import type { MovementDirection } from "../core/gameTypes";
import { normalizeMovement } from "../../utils/math";

const MOVEMENT_KEYS = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
]);

export function directionFromKeys(keys: ReadonlySet<string>): MovementDirection {
  const x =
    Number(keys.has("KeyD") || keys.has("ArrowRight")) -
    Number(keys.has("KeyA") || keys.has("ArrowLeft"));
  const z =
    Number(keys.has("KeyS") || keys.has("ArrowDown")) -
    Number(keys.has("KeyW") || keys.has("ArrowUp"));

  return normalizeMovement({ x, z });
}

export class InputManager {
  private readonly pressedKeys = new Set<string>();
  private disposed = false;

  constructor(private readonly target: Window = window) {
    this.target.addEventListener("keydown", this.handleKeyDown);
    this.target.addEventListener("keyup", this.handleKeyUp);
    this.target.addEventListener("blur", this.handleBlur);
  }

  getMovementDirection(): MovementDirection {
    return directionFromKeys(this.pressedKeys);
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.pressedKeys.clear();
    this.target.removeEventListener("keydown", this.handleKeyDown);
    this.target.removeEventListener("keyup", this.handleKeyUp);
    this.target.removeEventListener("blur", this.handleBlur);
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (!MOVEMENT_KEYS.has(event.code)) {
      return;
    }

    event.preventDefault();
    this.pressedKeys.add(event.code);
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    if (!MOVEMENT_KEYS.has(event.code)) {
      return;
    }

    event.preventDefault();
    this.pressedKeys.delete(event.code);
  };

  private readonly handleBlur = (): void => {
    this.pressedKeys.clear();
  };
}
