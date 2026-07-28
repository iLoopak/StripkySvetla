import { Engine } from "@babylonjs/core/Engines/engine";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { dialoguesById } from "../../content/dialogues/wave1Dialogues";
import type {
  CollectibleEntityDefinition,
  MapTransitionDefinition,
  NpcEntityDefinition,
} from "../../content/types";
import { useGameStore } from "../../state/gameStore";
import { resolveHorizontalFacing } from "../characters/characterFacing";
import { createPukFollower, type PukFollower } from "../companions/PukFollower";
import { availableChoices, dialogueNodeById } from "../dialogue/dialogueGraph";
import {
  findNearestInteraction,
  type InteractionTarget,
} from "../interaction/InteractionSystem";
import { InputManager, movementForInputMode } from "../input/InputManager";
import { createWave1Scene, type RenderedEntity } from "../scenes/createWave1Scene";
import { dialogueForNpc, matchesStoryConditions } from "../story/storyMachine";
import type { InputMode, StorySnapshot } from "../story/storyTypes";
import { resolveMapMovement } from "../world/mapCollision";
import {
  createCameraGroundBasis,
  resolveCameraRelativeMovement,
} from "./cameraRelativeMovement";
import type { HorizontalFacing } from "./gameTypes";

const PLAYER_SPEED = 3.5;
const TELEMETRY_INTERVAL_MS = 250;
const TRANSITION_HALF_DURATION_SECONDS = 0.32;

interface PendingTransition {
  definition: MapTransitionDefinition;
  phase: "fade-out" | "fade-in";
  elapsedSeconds: number;
}

function currentStorySnapshot(): StorySnapshot {
  const state = useGameStore.getState();
  return {
    chapterId: state.chapterId,
    stage: state.stage,
    lanternMemorySeen: state.lanternMemorySeen,
    pukAwakened: state.pukAwakened,
    renaDeliveryReceived: state.renaDeliveryReceived,
    renaDeliveryCompleted: state.renaDeliveryCompleted,
    spuntOutcome: state.spuntOutcome,
    spuntTrust: state.spuntTrust,
    rangerTrust: state.rangerTrust,
    collectedEntityIds: state.collectedEntityIds,
    resolvedEntityIds: state.resolvedEntityIds,
  };
}

export class GameRuntime {
  private readonly engine: Engine;
  private readonly input: InputManager;
  private readonly sceneBundle: ReturnType<typeof createWave1Scene>;
  private disposed = false;
  private elapsedSeconds = 0;
  private telemetryElapsedMs = TELEMETRY_INTERVAL_MS;
  private cameraControlsAttached = true;
  private playerFacing: HorizontalFacing = "right";
  private follower: PukFollower | null = null;
  private pendingTransition: PendingTransition | null = null;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.engine = new Engine(canvas, true, {
      adaptToDeviceRatio: false,
      preserveDrawingBuffer: false,
      stencil: true,
    });
    this.engine.setHardwareScalingLevel(1 / pixelRatio);
    this.input = new InputManager();

    const state = useGameStore.getState();
    this.sceneBundle = createWave1Scene(
      this.engine,
      canvas,
      state.currentMapId,
      state.entryPointId,
      currentStorySnapshot(),
    );
    this.ensureFollower(state);

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
    this.follower?.dispose();
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
    this.updateTransition(deltaSeconds);

    let store = useGameStore.getState();
    this.openAutomaticStoryDialogue(store);
    store = useGameStore.getState();
    this.ensureFollower(store);
    this.sceneBundle.maps.refreshStoryState(currentStorySnapshot());

    const direction = this.input.getMovementDirection();
    const inputIntent = movementForInputMode(direction, store.inputMode);
    const cameraDirection = this.sceneBundle.camera.getDirection(Vector3.Forward());
    const cameraBasis = createCameraGroundBasis({
      x: cameraDirection.x,
      z: cameraDirection.z,
    });
    const worldMovement = resolveCameraRelativeMovement(inputIntent, cameraBasis);
    const isMoving = worldMovement.x !== 0 || worldMovement.z !== 0;
    const characterRoot = this.sceneBundle.player.root;

    this.syncCameraControls(store.inputMode);

    if (isMoving) {
      const current = {
        x: characterRoot.position.x,
        y: characterRoot.position.y,
        z: characterRoot.position.z,
      };
      const candidate = {
        x: current.x + worldMovement.x * PLAYER_SPEED * deltaSeconds,
        y: current.y,
        z: current.z + worldMovement.z * PLAYER_SPEED * deltaSeconds,
      };
      const next = resolveMapMovement(
        this.sceneBundle.maps.map,
        current,
        candidate,
        this.sceneBundle.maps.getBlockers(currentStorySnapshot()),
      );
      characterRoot.position.set(next.x, next.y, next.z);
      characterRoot.rotation.y = Math.atan2(worldMovement.x, worldMovement.z);
      this.playerFacing = resolveHorizontalFacing(
        worldMovement,
        cameraBasis.right,
        this.playerFacing,
      );
    }

    this.sceneBundle.player.animate({
      elapsedSeconds: this.elapsedSeconds,
      isMoving,
      facing: this.playerFacing,
    });
    this.sceneBundle.maps.animate(this.elapsedSeconds);
    this.follower?.update(this.elapsedSeconds, deltaSeconds);

    if (store.inputMode === "dialogue") {
      this.handleDialogueInput(store);
    } else if (store.inputMode === "world") {
      this.input.consumeChoiceNavigation();
      const target = findNearestInteraction(
        characterRoot.position,
        this.getInteractionTargets(),
        store.stage,
      );
      useGameStore.getState().setInteractionPrompt(target?.definition.prompt ?? null);
      if (target && this.input.consumeInteractionPressed()) {
        this.executeInteraction(target);
      } else {
        this.input.consumeInteractionPressed();
      }
    } else {
      this.input.consumeInteractionPressed();
      this.input.consumeChoiceNavigation();
      useGameStore.getState().setInteractionPrompt(null);
    }

    const cameraTarget = this.sceneBundle.camera.target;
    const desiredTarget = new Vector3(
      characterRoot.position.x * 0.18,
      characterRoot.position.y + 0.7,
      characterRoot.position.z * 0.18,
    );
    Vector3.LerpToRef(cameraTarget, desiredTarget, 0.035, cameraTarget);

    const water = this.sceneBundle.maps.renderedWorld?.water;
    if (water) {
      water.position.y = Math.sin(this.elapsedSeconds * 1.2) * 0.025;
    }
    this.sceneBundle.environment.update(this.elapsedSeconds);

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

  private openAutomaticStoryDialogue(
    state: ReturnType<typeof useGameStore.getState>,
  ): void {
    if (state.inputMode !== "world" || state.activeDialogueId) {
      return;
    }
    if (state.stage === "lantern-memory") {
      state.openDialogue("lantern-memory");
    } else if (state.stage === "puk-awakening") {
      state.openDialogue("puk-awakening");
    }
  }

  private handleDialogueInput(state: ReturnType<typeof useGameStore.getState>): void {
    state.setInteractionPrompt(null);
    const navigation = this.input.consumeChoiceNavigation();
    if (navigation !== 0) {
      state.moveDialogueChoice(navigation);
    }
    if (!this.input.consumeInteractionPressed()) {
      return;
    }

    const dialogue = state.activeDialogueId && dialoguesById[state.activeDialogueId];
    const node =
      dialogue && state.activeDialogueNodeId
        ? dialogueNodeById(dialogue, state.activeDialogueNodeId)
        : null;
    const choices = node ? availableChoices(node, currentStorySnapshot()) : [];
    if (choices.length > 0) {
      useGameStore.getState().chooseDialogue();
    } else {
      useGameStore.getState().advanceDialogue();
    }
  }

  private getInteractionTargets(): InteractionTarget[] {
    const state = useGameStore.getState();
    const story = currentStorySnapshot();
    const map = this.sceneBundle.maps.map;
    return map.interactions.flatMap((definition) => {
      const entity = map.entities.find(
        (candidate) => candidate.id === definition.targetId,
      );
      if (!entity || !matchesStoryConditions(story, entity.conditions)) {
        return [];
      }
      const enabled =
        entity.type !== "collectible" || !state.collectedEntityIds.has(entity.id);
      return [{ definition, position: entity.position, enabled }];
    });
  }

  private executeInteraction(target: InteractionTarget): void {
    const map = this.sceneBundle.maps.map;
    const entity = map.entities.find(
      (candidate) => candidate.id === target.definition.targetId,
    );
    if (!entity) {
      return;
    }

    if (target.definition.type === "dialogue") {
      if (entity.type === "npc") {
        const visual = this.sceneBundle.maps.renderedEntities.get(entity.id);
        if (visual) {
          this.openNpcDialogue(visual, entity);
        }
        return;
      }
      const outcome = useGameStore.getState().spuntOutcome;
      const dialogueId =
        (outcome ? target.definition.dialogueIdBySpuntOutcome?.[outcome] : undefined) ??
        target.definition.dialogueId;
      if (dialogueId) {
        useGameStore.getState().openDialogue(dialogueId);
      }
      return;
    }

    if (target.definition.type === "collect" && entity.type === "collectible") {
      const visual = this.sceneBundle.maps.renderedEntities.get(entity.id);
      if (visual) {
        this.collectEntity(visual, entity);
      }
      return;
    }

    if (target.definition.type === "inspect") {
      if (
        useGameStore
          .getState()
          .dispatchStory({ type: "ribbon-clue-inspected", entityId: entity.id })
      ) {
        useGameStore
          .getState()
          .showFeedback("Drobné otisky a zelený mech vedou za sklad");
      }
      return;
    }

    if (target.definition.type === "transition" && target.definition.transitionId) {
      const transition = map.transitions.find(
        (candidate) => candidate.id === target.definition.transitionId,
      );
      if (
        transition &&
        matchesStoryConditions(currentStorySnapshot(), transition.conditions)
      ) {
        this.pendingTransition = {
          definition: transition,
          phase: "fade-out",
          elapsedSeconds: 0,
        };
        useGameStore.getState().setTransitioning(true);
      }
    }
  }

  private openNpcDialogue(visual: RenderedEntity, definition: NpcEntityDefinition): void {
    const dialogueId = dialogueForNpc(definition, currentStorySnapshot());
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
    useGameStore.getState().openDialogue(dialogueId);
  }

  private collectEntity(
    visual: RenderedEntity,
    definition: CollectibleEntityDefinition,
  ): void {
    if (useGameStore.getState().collectEntity(definition.id)) {
      visual.collect?.(true);
      useGameStore.getState().showFeedback("Získána světelná jiskra");
    }
  }

  private updateTransition(deltaSeconds: number): void {
    if (!this.pendingTransition) {
      return;
    }
    this.pendingTransition.elapsedSeconds += deltaSeconds;
    if (this.pendingTransition.elapsedSeconds < TRANSITION_HALF_DURATION_SECONDS) {
      return;
    }

    if (this.pendingTransition.phase === "fade-out") {
      const { definition } = this.pendingTransition;
      try {
        useGameStore
          .getState()
          .dispatchStory({ type: "map-entered", mapId: definition.targetMapId });
        this.sceneBundle.maps.load(
          definition.targetMapId,
          definition.targetEntryPointId,
          currentStorySnapshot(),
        );
        useGameStore
          .getState()
          .setMapCheckpoint(definition.targetMapId, definition.targetEntryPointId);
        this.pendingTransition = {
          definition,
          phase: "fade-in",
          elapsedSeconds: 0,
        };
      } catch (error) {
        this.pendingTransition = null;
        useGameStore
          .getState()
          .setError(
            error instanceof Error ? error.message : "Přechod do Jasnova se nepodařil.",
          );
      }
      return;
    }

    this.pendingTransition = null;
    useGameStore.getState().setTransitioning(false);
  }

  private ensureFollower(state: ReturnType<typeof useGameStore.getState>): void {
    const shouldExist = state.pukAwakened || state.stage === "puk-awakening";
    if (shouldExist && !this.follower) {
      this.follower = createPukFollower(
        this.sceneBundle.scene,
        this.sceneBundle.player.root,
      );
    } else if (!shouldExist && this.follower) {
      this.follower.dispose();
      this.follower = null;
    }
  }

  private syncCameraControls(inputMode: InputMode): void {
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
