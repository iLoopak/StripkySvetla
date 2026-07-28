import { Engine } from "@babylonjs/core/Engines/engine";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { useGameStore } from "../../state/gameStore";
import { clampPlayerPosition } from "../../utils/math";
import { InputManager } from "../input/InputManager";
import { createWave0Scene } from "../scenes/createWave0Scene";
import { resolveWalkablePosition } from "../world/terrain";

const PLAYER_SPEED = 3.5;
const TELEMETRY_INTERVAL_MS = 250;

export class GameRuntime {
  private readonly engine: Engine;
  private readonly input: InputManager;
  private readonly sceneBundle: ReturnType<typeof createWave0Scene>;
  private disposed = false;
  private elapsedSeconds = 0;
  private telemetryElapsedMs = TELEMETRY_INTERVAL_MS;

  constructor(canvas: HTMLCanvasElement) {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.engine = new Engine(canvas, true, {
      adaptToDeviceRatio: false,
      preserveDrawingBuffer: false,
      stencil: true,
    });
    this.engine.setHardwareScalingLevel(1 / pixelRatio);
    this.input = new InputManager();
    this.sceneBundle = createWave0Scene(this.engine, canvas);

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
    const isMoving = direction.x !== 0 || direction.z !== 0;
    const characterRoot = this.sceneBundle.character.root;

    if (isMoving) {
      const current = {
        x: characterRoot.position.x,
        y: characterRoot.position.y,
        z: characterRoot.position.z,
      };
      const candidate = clampPlayerPosition({
        x: current.x + direction.x * PLAYER_SPEED * deltaSeconds,
        y: current.y,
        z: current.z + direction.z * PLAYER_SPEED * deltaSeconds,
      });
      const next = resolveWalkablePosition(current, candidate);
      characterRoot.position.set(next.x, next.y, next.z);
      characterRoot.rotation.y = Math.atan2(direction.x, direction.z);
    }

    this.sceneBundle.character.animate({
      elapsedSeconds: this.elapsedSeconds,
      isMoving,
    });

    const cameraTarget = this.sceneBundle.camera.target;
    const desiredTarget = new Vector3(
      characterRoot.position.x * 0.18,
      characterRoot.position.y + 0.7,
      characterRoot.position.z * 0.18,
    );
    Vector3.LerpToRef(cameraTarget, desiredTarget, 0.035, cameraTarget);

    const water = this.sceneBundle.diorama.water;
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
}
