import type { Camera } from "@babylonjs/core/Cameras/camera";
import { Material } from "@babylonjs/core/Materials/material";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { Scene } from "@babylonjs/core/scene";
import "@babylonjs/core/Shaders/default.fragment.js";
import "@babylonjs/core/Shaders/default.vertex.js";
import {
  validateSkyEnvironmentConfig,
  type HorizonLayerConfig,
  type SkyEnvironmentConfig,
} from "./skyEnvironmentConfig";

export interface SkyEnvironment {
  root: TransformNode;
  update: (elapsedSeconds: number) => void;
  dispose: () => void;
}

interface SkyEnvironmentResources {
  environment: SkyEnvironment;
  configId: string;
}

const environmentsByScene = new WeakMap<Scene, SkyEnvironmentResources>();
const HORIZON_SEGMENTS = 56;
const CLOUD_SEA_SEGMENTS = 64;
const CLOUD_SEA_RINGS = 4;

function hexToShaderColor(color: string): string {
  const value = Number.parseInt(color.slice(1), 16);
  const red = ((value >> 16) & 0xff) / 255;
  const green = ((value >> 8) & 0xff) / 255;
  const blue = (value & 0xff) / 255;
  return `vec3(${red.toFixed(6)}, ${green.toFixed(6)}, ${blue.toFixed(6)})`;
}

function createSkyFragmentShader(config: SkyEnvironmentConfig): string {
  const { stops, warmHorizon } = config.gradient;
  const gradientBranches = stops
    .slice(0, -1)
    .map((stop, index) => {
      const next = stops[index + 1];
      const prefix = index === 0 ? "if" : "else if";
      return `${prefix} (gradientV <= ${next.offset.toFixed(6)}) {
        color = mix(
          ${hexToShaderColor(stop.color)},
          ${hexToShaderColor(next.color)},
          smoothstep(${stop.offset.toFixed(6)}, ${next.offset.toFixed(6)}, gradientV)
        );
      }`;
    })
    .join("\n");

  return `
    precision highp float;
    varying vec3 vLocalPosition;

    void main(void) {
      vec3 direction = normalize(vLocalPosition);
      float gradientV = clamp(0.38 - direction.y * 0.52, 0.0, 1.0);
      vec3 color = ${hexToShaderColor(stops[stops.length - 1].color)};

      ${gradientBranches}

      float longitude = atan(direction.z, direction.x) / 6.28318530718 + 0.5;
      float horizontalDistance = abs(longitude - ${warmHorizon.centerX.toFixed(6)});
      horizontalDistance = min(horizontalDistance, 1.0 - horizontalDistance);
      float ellipseX = horizontalDistance / ${warmHorizon.radiusX.toFixed(6)};
      float ellipseY =
        abs(gradientV - ${warmHorizon.centerY.toFixed(6)}) /
        ${warmHorizon.radiusY.toFixed(6)};
      float warmMask =
        (1.0 - smoothstep(0.0, 1.0, length(vec2(ellipseX, ellipseY)))) *
        ${warmHorizon.strength.toFixed(6)};
      color = mix(color, ${hexToShaderColor(warmHorizon.color)}, warmMask);
      gl_FragColor = vec4(color, 1.0);
    }
  `;
}

function createSkyDome(
  scene: Scene,
  root: TransformNode,
  config: SkyEnvironmentConfig,
): { mesh: Mesh; material: ShaderMaterial } {
  const material = new ShaderMaterial(
    "SkyDomeMaterial",
    scene,
    {
      vertexSource: `
        precision highp float;
        attribute vec3 position;
        uniform mat4 worldViewProjection;
        varying vec3 vLocalPosition;

        void main(void) {
          vLocalPosition = position;
          gl_Position = worldViewProjection * vec4(position, 1.0);
        }
      `,
      fragmentSource: createSkyFragmentShader(config),
    },
    {
      attributes: ["position"],
      uniforms: ["worldViewProjection"],
    },
  );
  material.backFaceCulling = false;
  material.disableDepthWrite = true;

  const mesh = MeshBuilder.CreateSphere(
    "SkyDome",
    {
      diameter: config.dome.radius * 2,
      segments: config.dome.segments,
      sideOrientation: Mesh.BACKSIDE,
    },
    scene,
  );
  mesh.parent = root;
  mesh.material = material;
  mesh.infiniteDistance = true;
  mesh.applyFog = false;
  mesh.isPickable = false;
  mesh.receiveShadows = false;
  mesh.alwaysSelectAsActiveMesh = true;
  return { mesh, material };
}

function horizonHeight(angle: number, layer: HorizonLayerConfig): number {
  const broad = Math.sin(angle * 3 + layer.phase) * 0.2;
  const middle = Math.sin(angle * 7 - layer.phase * 0.7) * 0.12;
  const fine = Math.cos(angle * 11 + layer.phase * 1.4) * 0.06;
  return layer.baseHeight + layer.height * (0.62 + broad + middle + fine);
}

function createHorizonRing(
  scene: Scene,
  root: TransformNode,
  layer: HorizonLayerConfig,
): { mesh: Mesh; material: StandardMaterial } {
  const positions: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];

  for (let index = 0; index <= HORIZON_SEGMENTS; index += 1) {
    const angle = ((index % HORIZON_SEGMENTS) / HORIZON_SEGMENTS) * Math.PI * 2;
    const x = Math.cos(angle) * layer.radius;
    const z = Math.sin(angle) * layer.radius;
    const topHeight = horizonHeight(angle, layer);
    positions.push(x, topHeight - layer.height * 0.22, z);
    positions.push(x, topHeight, z);
  }

  for (let index = 0; index < HORIZON_SEGMENTS; index += 1) {
    const bottom = index * 2;
    const top = bottom + 1;
    const nextBottom = bottom + 2;
    const nextTop = bottom + 3;
    indices.push(bottom, nextTop, top, bottom, nextBottom, nextTop);
  }

  VertexData.ComputeNormals(positions, indices, normals);
  const vertexData = new VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;

  const mesh = new Mesh(layer.name, scene);
  vertexData.applyToMesh(mesh);
  mesh.parent = root;
  mesh.isPickable = false;
  mesh.receiveShadows = false;
  mesh.applyFog = true;
  mesh.freezeWorldMatrix();

  const material = new StandardMaterial(`${layer.name}Material`, scene);
  material.diffuseColor = Color3.FromHexString(layer.color);
  material.emissiveColor = Color3.FromHexString(layer.color).scale(0.18);
  material.specularColor = Color3.Black();
  material.backFaceCulling = false;
  mesh.material = material;
  return { mesh, material };
}

function cloudSeaAlpha(ringIndex: number, segmentIndex: number, opacity: number) {
  const radialFade = [1, 0.96, 0.72, 0.28, 0][ringIndex] ?? 0;
  const variation =
    ringIndex === 0 ? 1 : 0.92 + Math.sin(segmentIndex * 1.7 + ringIndex) * 0.08;
  return opacity * radialFade * variation;
}

function createCloudSea(
  scene: Scene,
  root: TransformNode,
  config: SkyEnvironmentConfig,
): { mesh: Mesh; material: StandardMaterial } {
  const positions: number[] = [0, config.cloudSea.height, 0];
  const colors: number[] = [1, 1, 1, config.cloudSea.opacity];
  const indices: number[] = [];
  const normals: number[] = [];

  for (let ringIndex = 1; ringIndex <= CLOUD_SEA_RINGS; ringIndex += 1) {
    const ringRatio = ringIndex / CLOUD_SEA_RINGS;
    for (let segmentIndex = 0; segmentIndex < CLOUD_SEA_SEGMENTS; segmentIndex += 1) {
      const angle = (segmentIndex / CLOUD_SEA_SEGMENTS) * Math.PI * 2;
      const irregularity = 1 + Math.sin(segmentIndex * 0.85 + ringIndex * 1.9) * 0.018;
      const radius = config.cloudSea.radius * ringRatio * irregularity;
      const heightOffset =
        Math.sin(segmentIndex * 0.65 + ringIndex * 1.3) * 0.08 * ringRatio;
      positions.push(
        Math.cos(angle) * radius,
        config.cloudSea.height + heightOffset,
        Math.sin(angle) * radius,
      );
      colors.push(
        1,
        1,
        1,
        cloudSeaAlpha(ringIndex, segmentIndex, config.cloudSea.opacity),
      );
    }
  }

  for (let segmentIndex = 0; segmentIndex < CLOUD_SEA_SEGMENTS; segmentIndex += 1) {
    const current = 1 + segmentIndex;
    const next = 1 + ((segmentIndex + 1) % CLOUD_SEA_SEGMENTS);
    indices.push(0, next, current);
  }

  for (let ringIndex = 1; ringIndex < CLOUD_SEA_RINGS; ringIndex += 1) {
    const innerStart = 1 + (ringIndex - 1) * CLOUD_SEA_SEGMENTS;
    const outerStart = innerStart + CLOUD_SEA_SEGMENTS;
    for (let segmentIndex = 0; segmentIndex < CLOUD_SEA_SEGMENTS; segmentIndex += 1) {
      const nextSegment = (segmentIndex + 1) % CLOUD_SEA_SEGMENTS;
      const inner = innerStart + segmentIndex;
      const innerNext = innerStart + nextSegment;
      const outer = outerStart + segmentIndex;
      const outerNext = outerStart + nextSegment;
      indices.push(inner, outerNext, outer, inner, innerNext, outerNext);
    }
  }

  VertexData.ComputeNormals(positions, indices, normals);
  const vertexData = new VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.colors = colors;

  const mesh = new Mesh("CloudSea", scene);
  vertexData.applyToMesh(mesh);
  mesh.parent = root;
  mesh.isPickable = false;
  mesh.receiveShadows = false;
  mesh.applyFog = true;
  mesh.useVertexColors = true;
  mesh.hasVertexAlpha = true;

  const material = new StandardMaterial("CloudSeaMaterial", scene);
  const cloudColor = Color3.FromHexString(config.cloudSea.color);
  material.disableLighting = true;
  material.diffuseColor = cloudColor;
  material.emissiveColor = cloudColor;
  material.specularColor = Color3.Black();
  material.backFaceCulling = false;
  material.transparencyMode = Material.MATERIAL_ALPHABLEND;
  material.needDepthPrePass = true;
  mesh.material = material;
  return { mesh, material };
}

export function applySkyEnvironmentSceneSettings(
  scene: Scene,
  config: SkyEnvironmentConfig,
): void {
  scene.clearColor = Color4.FromHexString(`${config.scene.clearColor}ff`);
  scene.ambientColor = Color3.FromHexString(config.scene.ambientColor);
  scene.fogMode = Scene.FOGMODE_LINEAR;
  scene.fogColor = Color3.FromHexString(config.scene.fogColor);
  scene.fogStart = config.scene.fogStart;
  scene.fogEnd = config.scene.fogEnd;
}

export function createSkyEnvironment(
  scene: Scene,
  camera: Camera,
  config: SkyEnvironmentConfig,
): SkyEnvironment {
  const validationErrors = validateSkyEnvironmentConfig(config);
  if (validationErrors.length > 0) {
    throw new Error(`Invalid sky environment config: ${validationErrors.join(" ")}`);
  }

  const existing = environmentsByScene.get(scene);
  if (existing) {
    if (existing.configId !== config.id) {
      throw new Error(
        `Scene already owns sky environment "${existing.configId}", cannot add "${config.id}".`,
      );
    }
    return existing.environment;
  }

  const root = new TransformNode("SkyEnvironmentRoot", scene);
  const skyDome = createSkyDome(scene, root, config);
  const horizonLayers = config.horizonLayers.map((layer) =>
    createHorizonRing(scene, root, layer),
  );
  const cloudSea = createCloudSea(scene, root, config);
  let disposed = false;

  const environment: SkyEnvironment = {
    root,
    update: (elapsedSeconds) => {
      if (disposed) {
        return;
      }
      skyDome.mesh.position.copyFrom(camera.globalPosition);
      cloudSea.mesh.rotation.y = elapsedSeconds * config.cloudSea.driftRadiansPerSecond;
    },
    dispose: () => {
      if (disposed) {
        return;
      }
      disposed = true;
      root.dispose(false, false);
      skyDome.material.dispose(false, false);
      horizonLayers.forEach(({ material }) => material.dispose(false, false));
      cloudSea.material.dispose(false, false);
      environmentsByScene.delete(scene);
    },
  };

  environmentsByScene.set(scene, { environment, configId: config.id });
  environment.update(0);
  return environment;
}
