import { describe, expect, it } from "vitest";
import { directionFromKeys } from "./InputManager";

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
