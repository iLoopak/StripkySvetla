import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Scene } from "@babylonjs/core/scene";
import type { Engine } from "@babylonjs/core/Engines/engine";
import {
  createBlockCharacter,
  type BlockCharacter,
} from "../characters/createBlockCharacter";
import { createVoxelDiorama, type Diorama } from "../world/createVoxelDiorama";

function createShrine(scene: Scene): TransformNode {
  const root = new TransformNode("LightShrine", scene);
  const stone = new StandardMaterial("shrine-stone", scene);
  stone.diffuseColor = Color3.FromHexString("#a9a2ad");
  stone.specularColor = Color3.Black();

  const base = MeshBuilder.CreateCylinder(
    "ShrineBase",
    { height: 0.35, diameter: 2.4, tessellation: 8 },
    scene,
  );
  base.material = stone;
  base.position.set(0, 0.18, 0);
  base.parent = root;

  const pedestal = MeshBuilder.CreateCylinder(
    "ShrinePedestal",
    { height: 0.75, diameterTop: 0.7, diameterBottom: 1.05, tessellation: 8 },
    scene,
  );
  pedestal.material = stone;
  pedestal.position.y = 0.7;
  pedestal.parent = root;

  const crystalMaterial = new StandardMaterial("crystal-material", scene);
  crystalMaterial.diffuseColor = Color3.FromHexString("#a7e7dc");
  crystalMaterial.emissiveColor = Color3.FromHexString("#79d9d1").scale(0.8);
  crystalMaterial.alpha = 0.9;

  const crystal = MeshBuilder.CreatePolyhedron(
    "LightCrystal",
    { type: 1, size: 0.72 },
    scene,
  );
  crystal.material = crystalMaterial;
  crystal.position.y = 1.65;
  crystal.scaling.y = 1.35;
  crystal.parent = root;

  const motes = Array.from({ length: 6 }, (_, index) => {
    const mote = MeshBuilder.CreateBox(`LightMote-${index}`, { size: 0.1 }, scene);
    mote.material = crystalMaterial;
    mote.parent = root;
    return mote;
  });

  const light = new PointLight("CrystalLight", new Vector3(0, 2, 0), scene);
  light.diffuse = Color3.FromHexString("#9ceee3");
  light.intensity = 7;
  light.range = 8;
  light.parent = root;

  scene.onBeforeRenderObservable.add(() => {
    const time = performance.now() * 0.001;
    crystal.position.y = 1.65 + Math.sin(time * 1.4) * 0.1;
    crystal.rotation.y = time * 0.35;
    light.intensity = 6.5 + Math.sin(time * 1.7) * 0.8;

    motes.forEach((mote, index) => {
      const phase = time * 0.45 + (index / motes.length) * Math.PI * 2;
      const radius = 1 + (index % 2) * 0.3;
      mote.position.set(
        Math.cos(phase) * radius,
        1.5 + Math.sin(phase * 2) * 0.55,
        Math.sin(phase) * radius,
      );
      mote.rotation.y = phase;
    });
  });

  return root;
}

export interface Wave0Scene {
  scene: Scene;
  camera: ArcRotateCamera;
  character: BlockCharacter;
  diorama: Diorama;
}

export function createWave0Scene(engine: Engine, canvas: HTMLCanvasElement): Wave0Scene {
  const scene = new Scene(engine);
  scene.clearColor = Color4.FromHexString("#172b35ff");
  scene.ambientColor = Color3.FromHexString("#344852");

  const camera = new ArcRotateCamera(
    "IsometricCamera",
    -Math.PI / 4,
    Math.PI / 3.25,
    22,
    new Vector3(0, 0.6, 0),
    scene,
  );
  camera.lowerRadiusLimit = 13;
  camera.upperRadiusLimit = 30;
  camera.lowerBetaLimit = 0.55;
  camera.upperBetaLimit = 1.25;
  camera.wheelPrecision = 45;
  camera.panningSensibility = 0;
  camera.angularSensibilityX = 1600;
  camera.angularSensibilityY = 1600;
  camera.attachControl(canvas, true);

  const skyLight = new HemisphericLight("SkyLight", new Vector3(-0.4, 1, -0.25), scene);
  skyLight.diffuse = Color3.FromHexString("#fff1d2");
  skyLight.groundColor = Color3.FromHexString("#243b4b");
  skyLight.intensity = 1.45;

  const diorama = createVoxelDiorama(scene);
  const shrine = createShrine(scene);
  shrine.position.set(0, 0.08, 0);

  const character = createBlockCharacter(scene);
  character.root.position.set(-3.5, 0, 2.5);
  character.root.rotation.y = Math.PI;

  scene.fogMode = Scene.FOGMODE_LINEAR;
  scene.fogColor = Color3.FromHexString("#172b35");
  scene.fogStart = 24;
  scene.fogEnd = 42;

  return { scene, camera, character, diorama };
}
