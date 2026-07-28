import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import type { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Scene } from "@babylonjs/core/scene";
import { charactersById, playerCharacter } from "../../content/characters/characters";
import { jasnovOutskirts } from "../../content/maps/jasnovOutskirts";
import type {
  CollectibleEntityDefinition,
  NpcEntityDefinition,
  WorldEntityDefinition,
} from "../../content/types";
import {
  createBlockCharacter,
  type BlockCharacter,
} from "../characters/createBlockCharacter";
import { createLightSpark, type LightSpark } from "../entities/createLightSpark";
import { createWorldMap, type RenderedWorldMap } from "../world/createWorldMap";
import { findTerrainCell } from "../world/mapCollision";
import { worldVisualPalette } from "../visual/visualPalette";

export interface RenderedEntity {
  definition: NpcEntityDefinition | CollectibleEntityDefinition;
  root: TransformNode;
  animate: (elapsedSeconds: number) => void;
  collect?: (playEffect?: boolean) => boolean;
  dispose?: () => void;
}

function renderNpc(scene: Scene, definition: NpcEntityDefinition): RenderedEntity {
  const characterDefinition = charactersById[definition.characterId];
  if (!characterDefinition) {
    throw new Error(`Unknown character definition: ${definition.characterId}`);
  }

  const character = createBlockCharacter(scene, characterDefinition, definition.id);
  const y = findTerrainCell(jasnovOutskirts, definition.position)?.height ?? 0;
  character.root.position.set(definition.position.x, y, definition.position.z);
  character.root.rotation.y = definition.facing ?? 0;

  return {
    definition,
    root: character.root,
    animate: (elapsedSeconds) => character.animate({ elapsedSeconds, isMoving: false }),
  };
}

function renderCollectible(
  scene: Scene,
  definition: CollectibleEntityDefinition,
): RenderedEntity {
  const y = findTerrainCell(jasnovOutskirts, definition.position)?.height ?? 0;
  const spark: LightSpark = createLightSpark(
    scene,
    definition.id,
    definition.position,
    y,
  );

  return {
    definition,
    root: spark.root,
    animate: spark.animate,
    collect: spark.collect,
    dispose: spark.dispose,
  };
}

function renderEntity(
  scene: Scene,
  definition: WorldEntityDefinition,
): RenderedEntity | null {
  if (definition.type === "npc") {
    return renderNpc(scene, definition);
  }
  if (definition.type === "collectible") {
    return renderCollectible(scene, definition);
  }
  return null;
}

export interface Wave1Scene {
  scene: Scene;
  camera: ArcRotateCamera;
  player: BlockCharacter;
  world: RenderedWorldMap;
  entities: ReadonlyMap<string, RenderedEntity>;
  dispose: () => void;
}

export function createWave1Scene(engine: Engine, canvas: HTMLCanvasElement): Wave1Scene {
  const scene = new Scene(engine);
  scene.clearColor = Color4.FromHexString(`${worldVisualPalette.sky}ff`);
  scene.ambientColor = Color3.FromHexString(worldVisualPalette.ambient);

  const camera = new ArcRotateCamera(
    "IsometricCamera",
    -Math.PI / 4,
    Math.PI / 3.25,
    20.5,
    new Vector3(0, 0.6, 0),
    scene,
  );
  camera.lowerRadiusLimit = 12.5;
  camera.upperRadiusLimit = 28;
  camera.lowerBetaLimit = 0.55;
  camera.upperBetaLimit = 1.25;
  camera.wheelPrecision = 45;
  camera.panningSensibility = 0;
  camera.angularSensibilityX = 1600;
  camera.angularSensibilityY = 1600;
  camera.attachControl(canvas, true);

  const skyLight = new HemisphericLight("SkyLight", new Vector3(-0.4, 1, -0.25), scene);
  skyLight.diffuse = Color3.FromHexString(worldVisualPalette.skyLight);
  skyLight.groundColor = Color3.FromHexString(worldVisualPalette.groundLight);
  skyLight.intensity = 1.05;

  const world = createWorldMap(scene, jasnovOutskirts);
  const player = createBlockCharacter(scene, playerCharacter, "player");
  const spawnHeight =
    findTerrainCell(jasnovOutskirts, jasnovOutskirts.playerSpawn)?.height ?? 0;
  player.root.position.set(
    jasnovOutskirts.playerSpawn.x,
    spawnHeight,
    jasnovOutskirts.playerSpawn.z,
  );
  player.root.rotation.y = Math.PI;

  const entities = new Map<string, RenderedEntity>();
  jasnovOutskirts.entities.forEach((definition) => {
    const rendered = renderEntity(scene, definition);
    if (rendered) {
      entities.set(definition.id, rendered);
    }
  });

  scene.fogMode = Scene.FOGMODE_LINEAR;
  scene.fogColor = Color3.FromHexString(worldVisualPalette.fog);
  scene.fogStart = 22;
  scene.fogEnd = 38;

  return {
    scene,
    camera,
    player,
    world,
    entities,
    dispose: () => {
      world.dispose();
      entities.forEach((entity) => entity.dispose?.());
    },
  };
}
