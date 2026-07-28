import { describe, expect, it } from "vitest";
import { jasnovOutskirts } from "../../content/maps/jasnovOutskirts";
import {
  isMapPositionWalkable,
  resolveMapMovement,
  type CircularBlocker,
} from "./mapCollision";

const blockers: readonly CircularBlocker[] = jasnovOutskirts.entities.flatMap((entity) =>
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

describe("map collision", () => {
  it("blocks water, the shrine, Mila, and map boundaries", () => {
    const water = jasnovOutskirts.terrain.find((cell) => cell.surface === "water");
    expect(water).toBeDefined();
    expect(
      isMapPositionWalkable(jasnovOutskirts, water?.position ?? { x: 2, z: 0 }, blockers),
    ).toBe(false);
    expect(isMapPositionWalkable(jasnovOutskirts, { x: 0, z: 0 }, blockers)).toBe(false);
    expect(isMapPositionWalkable(jasnovOutskirts, { x: -4, z: 2.5 }, blockers)).toBe(
      false,
    );
    expect(isMapPositionWalkable(jasnovOutskirts, { x: -9, z: 0 }, blockers)).toBe(false);
  });

  it("keeps valid movement and derives height from map data", () => {
    const current = { x: -6, y: 0, z: 2.5 };
    const candidate = { x: -5.8, y: 99, z: 2.5 };
    expect(resolveMapMovement(jasnovOutskirts, current, candidate, blockers)).toEqual({
      x: -5.8,
      y: 0,
      z: 2.5,
    });
  });

  it("rejects a candidate inside a blocker", () => {
    const current = { x: -5, y: 0, z: 2.5 };
    const candidate = { x: -4, y: 0, z: 2.5 };
    expect(resolveMapMovement(jasnovOutskirts, current, candidate, blockers)).toEqual(
      current,
    );
  });
});
