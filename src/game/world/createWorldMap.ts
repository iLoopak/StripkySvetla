import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Observer } from "@babylonjs/core/Misc/observable";
import type { Scene } from "@babylonjs/core/scene";
import type {
  DecorationEntityDefinition,
  SignatureDetailDefinition,
  WorldMapDefinition,
} from "../../content/types";
import { worldVisualPalette, type WorldVisualColor } from "../visual/visualPalette";
import { findTerrainCell } from "./mapCollision";
import {
  BLOCK_FACE_TEXTURES,
  createBoxFaceUV,
  isTexturedBlockKind,
  resolveBlockTextureVariant,
  WORLD_ATLAS_PATH,
  type BlockTextureVariantId,
} from "./worldAtlas";

type BlockKind =
  | "grass"
  | "grassLight"
  | "dirt"
  | "path"
  | "water"
  | "stone"
  | "stoneDark"
  | "wood"
  | "leaves"
  | "mintLight"
  | "goldLight"
  | "burgundy"
  | "shrinePaving";

interface Block {
  kind: BlockKind;
  position: Vector3;
  scaling?: Vector3;
  rotation?: Vector3;
}

const BLOCK_COLORS: Record<BlockKind, WorldVisualColor> = {
  grass: "grass",
  grassLight: "grassLight",
  dirt: "dirt",
  path: "path",
  water: "water",
  stone: "stone",
  stoneDark: "stoneDark",
  wood: "wood",
  leaves: "leaves",
  mintLight: "mintLight",
  goldLight: "goldLight",
  burgundy: "burgundy",
  shrinePaving: "shrinePaving",
};

const EMISSIVE_STRENGTH: Partial<Record<BlockKind, number>> = {
  water: 0.12,
  mintLight: 0.62,
  goldLight: 0.56,
  shrinePaving: 0.08,
};

function createMaterial(
  name: string,
  color: string,
  scene: Scene,
  emissiveStrength = 0,
): StandardMaterial {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = Color3.FromHexString(color);
  material.specularColor = Color3.Black();
  material.emissiveColor = Color3.FromHexString(color).scale(emissiveStrength);
  return material;
}

interface WorldRenderResourceStats {
  atlasTextures: number;
  sharedMaterials: number;
  sourceMeshes: number;
}

class WorldRenderResources {
  private atlasTexture: Texture | null = null;
  private atlasMaterial: StandardMaterial | null = null;
  private readonly proceduralMaterials = new Map<BlockKind, StandardMaterial>();
  private readonly sourceMeshes = new Map<string, Mesh>();

  constructor(private readonly scene: Scene) {}

  getSourceMesh(
    key: string,
    kind: BlockKind,
    textureVariant: BlockTextureVariantId | null,
  ): Mesh {
    const cached = this.sourceMeshes.get(key);
    if (cached) {
      return cached;
    }

    const source = MeshBuilder.CreateBox(
      `${key}-blocks`,
      textureVariant
        ? {
            size: 1,
            faceUV: createBoxFaceUV(BLOCK_FACE_TEXTURES[textureVariant]),
          }
        : { size: 1 },
      this.scene,
    );
    source.material = textureVariant
      ? this.getAtlasMaterial()
      : this.getProceduralMaterial(kind);
    source.receiveShadows = kind !== "water";
    this.sourceMeshes.set(key, source);
    return source;
  }

  getStats(): WorldRenderResourceStats {
    return {
      atlasTextures: this.atlasTexture ? 1 : 0,
      sharedMaterials: this.proceduralMaterials.size + (this.atlasMaterial ? 1 : 0),
      sourceMeshes: this.sourceMeshes.size,
    };
  }

  dispose(): void {
    this.sourceMeshes.forEach((source) => {
      if (!source.isDisposed()) {
        source.dispose(false, false);
      }
    });
    this.sourceMeshes.clear();
    this.proceduralMaterials.forEach((material) => material.dispose());
    this.proceduralMaterials.clear();
    this.atlasMaterial?.dispose(false, false);
    this.atlasMaterial = null;
    this.atlasTexture?.dispose();
    this.atlasTexture = null;
  }

  private getAtlasMaterial(): StandardMaterial {
    if (this.atlasMaterial) {
      return this.atlasMaterial;
    }

    const texture = new Texture(
      WORLD_ATLAS_PATH,
      this.scene,
      true,
      true,
      Texture.NEAREST_SAMPLINGMODE,
    );
    texture.name = "world-atlas-texture";
    texture.wrapU = Texture.CLAMP_ADDRESSMODE;
    texture.wrapV = Texture.CLAMP_ADDRESSMODE;
    texture.anisotropicFilteringLevel = 1;

    const material = new StandardMaterial("world-atlas-material", this.scene);
    material.diffuseColor = Color3.White();
    material.diffuseTexture = texture;
    material.specularColor = Color3.Black();

    this.atlasTexture = texture;
    this.atlasMaterial = material;
    return material;
  }

  private getProceduralMaterial(kind: BlockKind): StandardMaterial {
    const cached = this.proceduralMaterials.get(kind);
    if (cached) {
      return cached;
    }

    const material = createMaterial(
      `${kind}-material`,
      worldVisualPalette[BLOCK_COLORS[kind]],
      this.scene,
      EMISSIVE_STRENGTH[kind],
    );
    if (kind === "water") {
      material.alpha = 0.76;
    }
    this.proceduralMaterials.set(kind, material);
    return material;
  }
}

interface BlockRenderGroup {
  kind: BlockKind;
  textureVariant: BlockTextureVariantId | null;
  blocks: Block[];
}

function resolveBlockRenderKey(block: Block): {
  key: string;
  textureVariant: BlockTextureVariantId | null;
} {
  if (!isTexturedBlockKind(block.kind)) {
    return { key: `procedural-${block.kind}`, textureVariant: null };
  }

  const textureVariant = resolveBlockTextureVariant(
    block.kind,
    block.position.x,
    block.position.z,
  );
  return { key: `textured-${textureVariant}`, textureVariant };
}

function createInstanceGroup(
  key: string,
  renderGroup: BlockRenderGroup,
  resources: WorldRenderResources,
  scene: Scene,
): TransformNode {
  const group = new TransformNode(`${key}-group`, scene);
  const source = resources.getSourceMesh(
    key,
    renderGroup.kind,
    renderGroup.textureVariant,
  );

  renderGroup.blocks.forEach((block, index) => {
    const mesh = index === 0 ? source : source.createInstance(`${key}-${index}`);
    mesh.position.copyFrom(block.position);
    mesh.scaling.copyFrom(block.scaling ?? Vector3.One());
    mesh.rotation.copyFrom(block.rotation ?? Vector3.Zero());
    mesh.parent = group;
  });

  return group;
}

function addTree(blocks: Block[], entity: DecorationEntityDefinition, y: number): void {
  const { x, z } = entity.position;
  blocks.push({
    kind: "wood",
    position: new Vector3(x, y + 0.7, z),
    scaling: new Vector3(0.43, 1.4, 0.43),
  });

  for (const [offsetX, offsetY, offsetZ, scale] of [
    [0, 1.68, 0, 0.92],
    [-0.55, 1.38, 0, 0.84],
    [0.55, 1.38, 0, 0.84],
    [0, 1.38, -0.55, 0.84],
    [0, 1.38, 0.55, 0.84],
  ]) {
    blocks.push({
      kind: "leaves",
      position: new Vector3(x + offsetX, y + offsetY, z + offsetZ),
      scaling: new Vector3(scale, scale * 0.86, scale),
    });
  }
}

function addSignatureDetail(
  blocks: Block[],
  detail: SignatureDetailDefinition,
  y: number,
): void {
  const { x, z } = detail.position;
  const rotationY = detail.facing ?? 0;

  if (detail.kind === "path-lantern") {
    blocks.push(
      {
        kind: "wood",
        position: new Vector3(x, y + 0.62, z),
        scaling: new Vector3(0.16, 1.24, 0.16),
      },
      {
        kind: "stoneDark",
        position: new Vector3(x, y + 1.33, z),
        scaling: new Vector3(0.42, 0.12, 0.42),
      },
      {
        kind: "goldLight",
        position: new Vector3(x, y + 1.12, z),
        scaling: new Vector3(0.28, 0.34, 0.28),
        rotation: new Vector3(0, Math.PI * 0.25, 0),
      },
    );
    return;
  }

  if (detail.kind === "light-flower") {
    blocks.push({
      kind: "leaves",
      position: new Vector3(x, y + 0.16, z),
      scaling: new Vector3(0.08, 0.32, 0.08),
    });
    [
      [-0.13, 0],
      [0.13, 0],
      [0, -0.13],
      [0, 0.13],
    ].forEach(([offsetX, offsetZ], index) =>
      blocks.push({
        kind: "mintLight",
        position: new Vector3(x + offsetX, y + 0.36, z + offsetZ),
        scaling: new Vector3(0.15, 0.08, 0.15),
        rotation: new Vector3(0, index * Math.PI * 0.25, Math.PI * 0.12),
      }),
    );
    return;
  }

  if (detail.kind === "shard-marker") {
    blocks.push(
      {
        kind: "stoneDark",
        position: new Vector3(x, y + 0.42, z),
        scaling: new Vector3(0.38, 0.84, 0.32),
        rotation: new Vector3(0, rotationY, 0),
      },
      {
        kind: "mintLight",
        position: new Vector3(x, y + 0.86, z - 0.17),
        scaling: new Vector3(0.15, 0.15, 0.08),
        rotation: new Vector3(0, rotationY, Math.PI * 0.25),
      },
    );
    return;
  }

  blocks.push({
    kind: "shrinePaving",
    position: new Vector3(x, y + 0.025, z),
    scaling: new Vector3(0.72, 0.05, 0.72),
    rotation: new Vector3(0, rotationY, 0),
  });
}

interface ShrineVisual {
  root: TransformNode;
  observer: Observer<Scene>;
}

function createShrine(
  scene: Scene,
  entity: DecorationEntityDefinition,
  y: number,
): ShrineVisual {
  const root = new TransformNode(entity.id, scene);
  root.position.set(entity.position.x, y + 0.05, entity.position.z);

  const stone = createMaterial(`${entity.id}-stone`, worldVisualPalette.stone, scene);
  const darkStone = createMaterial(
    `${entity.id}-dark-stone`,
    worldVisualPalette.stoneDark,
    scene,
  );
  const mint = createMaterial(
    `${entity.id}-mint`,
    worldVisualPalette.mintLight,
    scene,
    0.55,
  );
  const gold = createMaterial(
    `${entity.id}-gold`,
    worldVisualPalette.goldLight,
    scene,
    0.34,
  );

  const lowerBase = MeshBuilder.CreateCylinder(
    `${entity.id}-lower-base`,
    { height: 0.28, diameter: 2.75, tessellation: 8 },
    scene,
  );
  lowerBase.material = darkStone;
  lowerBase.position.y = 0.14;
  lowerBase.parent = root;

  const upperBase = MeshBuilder.CreateCylinder(
    `${entity.id}-upper-base`,
    { height: 0.24, diameter: 2.15, tessellation: 8 },
    scene,
  );
  upperBase.material = stone;
  upperBase.position.y = 0.38;
  upperBase.parent = root;

  const pedestal = MeshBuilder.CreateCylinder(
    `${entity.id}-pedestal`,
    { height: 0.76, diameterTop: 0.72, diameterBottom: 1.12, tessellation: 8 },
    scene,
  );
  pedestal.material = darkStone;
  pedestal.position.y = 0.77;
  pedestal.parent = root;

  [-0.72, 0.72].forEach((offsetX) => {
    const lightLine = MeshBuilder.CreateBox(
      `${entity.id}-light-line-${offsetX}`,
      { width: 0.08, height: 0.04, depth: 1.15 },
      scene,
    );
    lightLine.material = mint;
    lightLine.position.set(offsetX, 0.53, 0);
    lightLine.parent = root;
  });

  for (const [x, z] of [
    [-0.43, -0.34],
    [0.43, -0.34],
    [-0.43, 0.34],
    [0.43, 0.34],
  ]) {
    const frame = MeshBuilder.CreateBox(
      `${entity.id}-lantern-frame-${x}-${z}`,
      { width: 0.07, height: 0.78, depth: 0.07 },
      scene,
    );
    frame.material = gold;
    frame.position.set(x, 1.38, z);
    frame.parent = root;
  }

  const leftCrystal = MeshBuilder.CreatePolyhedron(
    `${entity.id}-crystal-left`,
    { type: 1, size: 0.58 },
    scene,
  );
  leftCrystal.material = mint;
  leftCrystal.position.set(-0.2, 1.62, 0);
  leftCrystal.scaling.y = 1.35;
  leftCrystal.rotation.z = 0.2;
  leftCrystal.parent = root;

  const rightCrystal = MeshBuilder.CreatePolyhedron(
    `${entity.id}-crystal-right`,
    { type: 1, size: 0.5 },
    scene,
  );
  rightCrystal.material = gold;
  rightCrystal.position.set(0.22, 1.52, 0.04);
  rightCrystal.scaling.y = 1.2;
  rightCrystal.rotation.z = -0.22;
  rightCrystal.parent = root;

  const orbitingShards = Array.from({ length: 3 }, (_, index) => {
    const shard = MeshBuilder.CreatePolyhedron(
      `${entity.id}-orbiting-shard-${index}`,
      { type: 1, size: 0.17 },
      scene,
    );
    shard.material = index === 1 ? gold : mint;
    shard.parent = root;
    return shard;
  });

  const shrineLight = new PointLight(`${entity.id}-light`, new Vector3(0, 1.4, 0), scene);
  shrineLight.diffuse = Color3.FromHexString(worldVisualPalette.goldLight);
  shrineLight.intensity = 1.15;
  shrineLight.range = 4.4;
  shrineLight.parent = root;

  const observer = scene.onBeforeRenderObservable.add(() => {
    const time = performance.now() * 0.001;
    const hover = Math.sin(time * 1.35) * 0.065;
    leftCrystal.position.y = 1.62 + hover;
    rightCrystal.position.y = 1.52 - hover * 0.65;
    leftCrystal.rotation.y = time * 0.25;
    rightCrystal.rotation.y = -time * 0.28;
    shrineLight.intensity = 1.08 + Math.sin(time * 1.7) * 0.08;

    orbitingShards.forEach((shard, index) => {
      const phase = time * 0.5 + (index / orbitingShards.length) * Math.PI * 2;
      shard.position.set(
        Math.cos(phase) * 0.82,
        1.55 + Math.sin(phase * 1.4) * 0.18,
        Math.sin(phase) * 0.82,
      );
      shard.rotation.y = -phase;
    });
  });

  return { root, observer };
}

export interface RenderedWorldMap {
  root: TransformNode;
  water: TransformNode | null;
  resourceStats: WorldRenderResourceStats;
  dispose: () => void;
}

export function createWorldMap(scene: Scene, map: WorldMapDefinition): RenderedWorldMap {
  const root = new TransformNode(`${map.id}-world`, scene);
  const renderGroups = new Map<string, BlockRenderGroup>();
  const resources = new WorldRenderResources(scene);
  const shrineObservers: Observer<Scene>[] = [];
  const push = (block: Block): void => {
    const descriptor = resolveBlockRenderKey(block);
    const renderGroup = renderGroups.get(descriptor.key) ?? {
      kind: block.kind,
      textureVariant: descriptor.textureVariant,
      blocks: [],
    };
    renderGroup.blocks.push(block);
    renderGroups.set(descriptor.key, renderGroup);
  };

  map.terrain.forEach((cell) => {
    push({
      kind: "dirt",
      position: new Vector3(cell.position.x, cell.height - 0.75, cell.position.z),
    });
    const isGrassVariation =
      cell.surface === "grass" &&
      Math.abs(cell.position.x * 13 + cell.position.z * 7) % 11 === 0;
    push({
      kind: isGrassVariation ? "grassLight" : cell.surface,
      position: new Vector3(
        cell.position.x,
        cell.surface === "water" ? -0.17 : cell.height - 0.07,
        cell.position.z,
      ),
      scaling: new Vector3(0.985, 0.15, 0.985),
    });
  });

  map.entities
    .filter(
      (entity): entity is DecorationEntityDefinition => entity.type === "decoration",
    )
    .forEach((entity) => {
      const y = findTerrainCell(map, entity.position)?.height ?? 0;
      if (entity.decorationKind === "tree") {
        const decorationBlocks: Block[] = [];
        addTree(decorationBlocks, entity, y);
        decorationBlocks.forEach(push);
      } else if (entity.decorationKind === "rock") {
        push({
          kind: "stone",
          position: new Vector3(entity.position.x, y + 0.22, entity.position.z),
          scaling: new Vector3(0.55, 0.42, 0.7),
          rotation: new Vector3(0, Math.PI * 0.12, 0),
        });
      } else {
        const shrine = createShrine(scene, entity, y);
        shrine.root.parent = root;
        shrineObservers.push(shrine.observer);
      }
    });

  map.visualDetails.forEach((detail) => {
    const cell = findTerrainCell(map, detail.position);
    if (!cell || cell.surface === "water") {
      return;
    }
    const detailBlocks: Block[] = [];
    addSignatureDetail(detailBlocks, detail, cell.height);
    detailBlocks.forEach(push);
  });

  let water: TransformNode | null = null;
  renderGroups.forEach((renderGroup, key) => {
    const group = createInstanceGroup(key, renderGroup, resources, scene);
    group.parent = root;
    if (renderGroup.kind === "water") {
      water = group;
    }
  });

  return {
    root,
    water,
    resourceStats: resources.getStats(),
    dispose: () => {
      shrineObservers.forEach((observer) =>
        scene.onBeforeRenderObservable.remove(observer),
      );
      root.dispose(false, false);
      resources.dispose();
    },
  };
}
