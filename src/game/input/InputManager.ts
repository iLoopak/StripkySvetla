import type { MovementDirection } from "../core/gameTypes";
import { normalizeMovement } from "../../utils/math";
import type { InputMode } from "../story/storyTypes";

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
const INTERACTION_KEYS = new Set(["KeyE", "Enter"]);

export function choiceNavigationForKey(code: string): -1 | 0 | 1 {
  if (code === "KeyW" || code === "ArrowUp") {
    return -1;
  }
  if (code === "KeyS" || code === "ArrowDown") {
    return 1;
  }
  return 0;
}

export function directionFromKeys(keys: ReadonlySet<string>): MovementDirection {
  const x =
    Number(keys.has("KeyD") || keys.has("ArrowRight")) -
    Number(keys.has("KeyA") || keys.has("ArrowLeft"));
  const z =
    Number(keys.has("KeyS") || keys.has("ArrowDown")) -
    Number(keys.has("KeyW") || keys.has("ArrowUp"));

  return normalizeMovement({ x, z });
}

export function movementForInputMode(
  direction: MovementDirection,
  inputMode: InputMode,
): MovementDirection {
  return inputMode === "world" ? direction : { x: 0, z: 0 };
}

export class InputManager {
  private readonly pressedKeys = new Set<string>();
  private interactionPressed = false;
  private choiceNavigation: -1 | 0 | 1 = 0;
  private disposed = false;

  constructor(private readonly target: Window = window) {
    this.target.addEventListener("keydown", this.handleKeyDown);
    this.target.addEventListener("keyup", this.handleKeyUp);
    this.target.addEventListener("blur", this.handleBlur);
  }

  getMovementDirection(): MovementDirection {
    return directionFromKeys(this.pressedKeys);
  }

  consumeInteractionPressed(): boolean {
    const pressed = this.interactionPressed;
    this.interactionPressed = false;
    return pressed;
  }

  consumeChoiceNavigation(): -1 | 0 | 1 {
    const navigation = this.choiceNavigation;
    this.choiceNavigation = 0;
    return navigation;
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.pressedKeys.clear();
    this.interactionPressed = false;
    this.choiceNavigation = 0;
    this.target.removeEventListener("keydown", this.handleKeyDown);
    this.target.removeEventListener("keyup", this.handleKeyUp);
    this.target.removeEventListener("blur", this.handleBlur);
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (INTERACTION_KEYS.has(event.code)) {
      event.preventDefault();
      if (!event.repeat) {
        this.interactionPressed = true;
      }
      return;
    }

    if (!MOVEMENT_KEYS.has(event.code)) {
      return;
    }

    event.preventDefault();
    if (!event.repeat) {
      this.choiceNavigation = choiceNavigationForKey(event.code);
    }
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
    this.choiceNavigation = 0;
  };
}
