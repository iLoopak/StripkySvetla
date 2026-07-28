import { describe, expect, it } from "vitest";
import { getTerrainHeight, isWaterPosition, resolveWalkablePosition } from "./terrain";

describe("terrain helpers", () => {
  it("returns deterministic terrace heights", () => {
    expect(getTerrainHeight(-6, -5)).toBe(1);
    expect(getTerrainHeight(6, 4)).toBe(0.75);
    expect(getTerrainHeight(0, 0)).toBe(0);
  });

  it("prevents movement into water", () => {
    const current = { x: 0, y: 0, z: 0 };
    const streamX = Math.sin(0) * 1.2 + 2.1;
    expect(isWaterPosition(streamX, 0)).toBe(true);
    expect(resolveWalkablePosition(current, { x: streamX, y: 0, z: 0 })).toBe(current);
  });
});
