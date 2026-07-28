import { describe, expect, it } from "vitest";
import { clampPlayerPosition, normalizeMovement } from "./math";

describe("normalizeMovement", () => {
  it("keeps a cardinal direction unchanged", () => {
    expect(normalizeMovement({ x: 1, z: 0 })).toEqual({ x: 1, z: 0 });
  });

  it("normalizes diagonal movement to unit length", () => {
    const direction = normalizeMovement({ x: 1, z: -1 });
    expect(Math.hypot(direction.x, direction.z)).toBeCloseTo(1);
    expect(direction.x).toBeCloseTo(Math.SQRT1_2);
  });
});

describe("clampPlayerPosition", () => {
  it("keeps the player inside the requested map bounds", () => {
    expect(clampPlayerPosition({ x: 14, y: 2, z: -12 }, 8)).toEqual({
      x: 8,
      y: 2,
      z: -8,
    });
  });
});
