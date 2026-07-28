import { describe, expect, it } from "vitest";
import {
  choiceNavigationForKey,
  directionFromKeys,
  movementForInputMode,
} from "./InputManager";

describe("directionFromKeys", () => {
  it("maps WASD and arrow keys to the same directions", () => {
    expect(directionFromKeys(new Set(["KeyW"]))).toEqual(
      directionFromKeys(new Set(["ArrowUp"])),
    );
  });

  it("supports simultaneous keys without increasing diagonal speed", () => {
    const direction = directionFromKeys(new Set(["KeyW", "KeyD"]));
    expect(direction.x).toBeCloseTo(Math.SQRT1_2);
    expect(direction.z).toBeCloseTo(-Math.SQRT1_2);
  });

  it("cancels opposing keys", () => {
    expect(directionFromKeys(new Set(["KeyA", "KeyD"]))).toEqual({ x: 0, z: 0 });
  });
});

describe("movementForInputMode", () => {
  it("blocks movement while a dialogue is open", () => {
    expect(movementForInputMode({ x: 1, z: -1 }, "dialogue")).toEqual({
      x: 0,
      z: 0,
    });
  });

  it("blocks movement during a map transition", () => {
    expect(movementForInputMode({ x: 1, z: -1 }, "transition")).toEqual({
      x: 0,
      z: 0,
    });
  });

  it("keeps movement enabled in world mode", () => {
    expect(movementForInputMode({ x: 0.5, z: -0.5 }, "world")).toEqual({
      x: 0.5,
      z: -0.5,
    });
  });
});

describe("choiceNavigationForKey", () => {
  it("maps W/S and vertical arrows to choice selection", () => {
    expect(choiceNavigationForKey("KeyW")).toBe(-1);
    expect(choiceNavigationForKey("ArrowUp")).toBe(-1);
    expect(choiceNavigationForKey("KeyS")).toBe(1);
    expect(choiceNavigationForKey("ArrowDown")).toBe(1);
    expect(choiceNavigationForKey("KeyA")).toBe(0);
  });
});
