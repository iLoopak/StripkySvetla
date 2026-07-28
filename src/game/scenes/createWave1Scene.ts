import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import type { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { playerCharacter } from "../../content/characters/characters";
import { createCharacterVisual } from "../characters/createCharacterVisual";
import type { CharacterVisual } from "../characters/characterVisualTypes";
import {
  applySkyEnvironmentSceneSettings,
  createSkyEnvironment,
  type SkyEnvironment,
} from "../environment/createSkyEnvironment";
import { jasnovSkyEnvironment } from "../environment/skyEnvironmentConfig";
import type { StorySnapshot } from "../story/storyTypes";
import { MapManager } from "../world/MapManager";

export interface GameScene {
  scene: Scene;
  camera: ArcRotateCamera;
  player: CharacterVisual;
  environment: SkyEnvironment;
  maps: MapManager;
  dispose: () => void;
}

export function createWave1Scene(
  engine: Engine,
  canvas: HTMLCanvasElement,
  mapId: string,
  entryPointId: string,
  story: StorySnapshot,
): GameScene {
  const scene = new Scene(engine);
  applySkyEnvironmentSceneSettings(scene, jasnovSkyEnvironment);

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
  skyLight.diffuse = Color3.FromHexString(jasnovSkyEnvironment.scene.skyLightColor);
  skyLight.groundColor = Color3.FromHexString(
    jasnovSkyEnvironment.scene.groundLightColor,
  );
  skyLight.intensity = jasnovSkyEnvironment.scene.skyLightIntensity;

  const environment = createSkyEnvironment(scene, camera, jasnovSkyEnvironment);
  const player = createCharacterVisual(scene, playerCharacter, "player");
  const maps = new MapManager(scene, player);
  maps.load(mapId, entryPointId, story);

  return {
    scene,
    camera,
    player,
    environment,
    maps,
    dispose: () => {
      maps.dispose();
      player.dispose?.();
      environment.dispose();
    },
  };
}

export type { RenderedEntity } from "../world/MapManager";
