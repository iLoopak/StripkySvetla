import { describe, expect, it } from "vitest";
import { followerSmoothingFactor } from "./PukFollower";

describe("Puk follower smoothing", () => {
  it("is frame-rate independent and remains in interpolation range", () => {
    expect(followerSmoothingFactor(0)).toBe(0);
    expect(followerSmoothingFactor(1 / 120)).toBeGreaterThan(0);
    expect(followerSmoothingFactor(1 / 30)).toBeGreaterThan(
      followerSmoothingFactor(1 / 120),
    );
    expect(followerSmoothingFactor(1)).toBeLessThan(1);
  });
});
