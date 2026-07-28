import { Engine } from "@babylonjs/core/Engines/engine";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { dialoguesById } from "../../content/dialogues/wave1Dialogues";
import { jasnovOutskirts } from "../../content/maps/jasnovOutskirts";
import type {
  CollectibleEntityDefinition,
  NpcEntityDefinition,
} from "../../content/types";
import { useGameStore } from "../../state/gameStore";
import {
  findNearestInteraction,
  type InteractionTarget,
} from "../interaction/InteractionSystem";
import { InputManager, movementForInputMode } from "../input/InputManager";
import { resolveHorizontalFacing } from "../characters/characterFacing";
import { createWave1Scene, type RenderedEntity } from "../scenes/createWave1Scene";
import { dialogueForNpc } from "../story/storyMachine";
import { resolveMapMovement, type CircularBlocker } from "../world/mapCollision";
import type { HorizontalFacing } from "./gameTypes";

const PLAYER_SPEED = 3.5;
const TELEMETRY_INTERVAL_MS = 250;

export class GameRuntime {
  private readonly engine: Engine;
  private readonly input: InputManager;
  private readonly sceneBundle: ReturnType<typeof createWave1Scene>;
  private readonly blockers: readonly CircularBlocker[];
  private disposed = false;
  private elapsedSeconds = 0;
  private telemetryElapsedMs = TELEMETRY_INTERVAL_MS;
  private cameraControlsAttached = true;
  private playerFacing: HorizontalFacing = "right";

  constructor(private readonly canvas: HTMLCanvasElement) {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.engine = new Engine(canvas, true, {
      adaptToDeviceRatio: false,
      preserveDrawingBuffer: false,
      stencil: true,
    });
    this.engine.setHardwareScalingLevel(1 / pixelRatio);
    this.input = new InputManager();
    this.sceneBundle = createWave1Scene(this.engine, canvas);
    this.blockers = jasnovOutskirts.entities.flatMap((entity) =>
      entity.collisionRadius && entity.type !== "collectible"
        ? [
            {
              id: entity.id,
              position: entity.position,
              radius: entity.collisionRadius,
            },
          ]
        : [],
    );

    const collectedEntityIds = useGameStore.getState().collectedEntityIds;
    collectedEntityIds.forEach((entityId) => {
      this.sceneBundle.entities.get(entityId)?.collect?.(false);
    });

    window.addEventListener("resize", this.handleResize);
    this.engine.runRenderLoop(this.renderFrame);
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.engine.stopRenderLoop(this.renderFrame);
    window.removeEventListener("resize", this.handleResize);
    this.input.dispose();
    this.sceneBundle.camera.detachControl();
    this.sceneBundle.dispose();
    this.sceneBundle.scene.dispose();
    this.engine.dispose();
  }

  private readonly handleResize = (): void => {
    if (!this.disposed) {
      this.engine.resize();
    }
  };

  private readonly renderFrame = (): void => {
    if (this.disposed) {
      return;
    }

    const deltaMs = Math.min(this.engine.getDeltaTime(), 50);
    const deltaSeconds = deltaMs / 1000;
    this.elapsedSeconds += deltaSeconds;
    this.telemetryElapsedMs += deltaMs;

    const direction = this.input.getMovementDirection();
    const store = useGameStore.getState();
    const movement = movementForInputMode(direction, store.inputMode);
    const isMoving = movement.x !== 0 || movement.z !== 0;
    const characterRoot = this.sceneBundle.player.root;

    this.syncCameraControls(store.inputMode);

    if (isMoving) {
      const current = {
        x: characterRoot.position.x,
        y: characterRoot.position.y,
        z: characterRoot.position.z,
      };
      const candidate = {
        x: current.x + movement.x * PLAYER_SPEED * deltaSeconds,
        y: current.y,
        z: current.z + movement.z * PLAYER_SPEED * deltaSeconds,
      };
      const next = resolveMapMovement(jasnovOutskirts, current, candidate, this.blockers);
      characterRoot.position.set(next.x, next.y, next.z);
      characterRoot.rotation.y = Math.atan2(movement.x, movement.z);
      const screenRight = this.sceneBundle.camera.getDirection(Vector3.Right());
      this.playerFacing = resolveHorizontalFacing(
        movement,
        { x: screenRight.x, z: screenRight.z },
        this.playerFacing,
      );
    }

    this.sceneBundle.player.animate({
      elapsedSeconds: this.elapsedSeconds,
      isMoving,
      facing: this.playerFacing,
    });
    this.sceneBundle.entities.forEach((entity) => entity.animate(this.elapsedSeconds));

    if (store.inputMode === "dialogue") {
      useGameStore.getState().setInteractionPrompt(null);
      if (this.input.consumeInteractionPressed()) {
        const dialogueId = useGameStore.getState().activeDialogueId;
        const dialogue = dialogueId ? dialoguesById[dialogueId] : null;
        if (dialogue) {
          useGameStore.getState().advanceDialogue(dialogue.lines.length);
        }
      }
    } else {
      const target = findNearestInteraction(
        characterRoot.position,
        this.getInteractionTargets(),
        store.storyStage,
      );
      useGameStore.getState().setInteractionPrompt(target?.definition.prompt ?? null);
      const interactionPressed = this.input.consumeInteractionPressed();
      if (target && interactionPressed) {
        this.executeInteraction(target);
      }
    }

    const cameraTarget = this.sceneBundle.camera.target;
    const desiredTarget = new Vector3(
      characterRoot.position.x * 0.18,
      characterRoot.position.y + 0.7,
      characterRoot.position.z * 0.18,
    );
    Vector3.LerpToRef(cameraTarget, desiredTarget, 0.035, cameraTarget);

    const water = this.sceneBundle.world.water;
    if (water) {
      water.position.y = Math.sin(this.elapsedSeconds * 1.2) * 0.025;
    }

    if (this.telemetryElapsedMs >= TELEMETRY_INTERVAL_MS) {
      this.telemetryElapsedMs = 0;
      useGameStore.getState().updateTelemetry(
        {
          x: characterRoot.position.x,
          y: characterRoot.position.y,
          z: characterRoot.position.z,
        },
        this.engine.getFps(),
      );
    }

    this.sceneBundle.scene.render();
  };

  private getInteractionTargets(): InteractionTarget[] {
    const state = useGameStore.getState();
    return jasnovOutskirts.interactions.flatMap((definition) => {
      const entity = jasnovOutskirts.entities.find(
        (candidate) => candidate.id === definition.targetId,
      );
      if (!entity) {
        return [];
      }

      return [
        {
          definition,
          position: entity.position,
          enabled:
            entity.type !== "collectible" || !state.collectedEntityIds.has(entity.id),
        },
      ];
    });
  }

  private executeInteraction(target: InteractionTarget): void {
    const visual = this.sceneBundle.entities.get(target.definition.targetId);
    if (!visual) {
      return;
    }

    if (target.definition.type === "dialogue" && visual.definition.type === "npc") {
      this.openNpcDialogue(visual, visual.definition);
      return;
    }

    if (
      target.definition.type === "collect" &&
      visual.definition.type === "collectible"
    ) {
      this.collectEntity(visual, visual.definition);
    }
  }

  private openNpcDialogue(visual: RenderedEntity, definition: NpcEntityDefinition): void {
    const state = useGameStore.getState();
    const dialogueId = dialogueForNpc(definition, state.storyStage);
    if (!dialogueId) {
      return;
    }

    const playerPosition = this.sceneBundle.player.root.position;
    const directionX = playerPosition.x - visual.root.position.x;
    const directionZ = playerPosition.z - visual.root.position.z;
    visual.root.rotation.y = Math.atan2(directionX, directionZ);
    const screenRight = this.sceneBundle.camera.getDirection(Vector3.Right());
    visual.setFacing?.(
      resolveHorizontalFacing(
        { x: directionX, z: directionZ },
        { x: screenRight.x, z: screenRight.z },
        "right",
      ),
    );
    state.openDialogue(dialogueId);
  }

  private collectEntity(
    visual: RenderedEntity,
    definition: CollectibleEntityDefinition,
  ): void {
    if (useGameStore.getState().collectEntity(definition.id)) {
      visual.collect?.(true);
    }
  }

  private syncCameraControls(inputMode: "world" | "dialogue"): void {
    const shouldAttach = inputMode === "world";
    if (shouldAttach === this.cameraControlsAttached) {
      return;
    }

    if (shouldAttach) {
      this.sceneBundle.camera.attachControl(this.canvas, true);
    } else {
      this.sceneBundle.camera.detachControl();
    }
    this.cameraControlsAttached = shouldAttach;
  }
}
