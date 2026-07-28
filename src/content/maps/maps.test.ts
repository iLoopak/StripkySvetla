import { describe, expect, it } from "vitest";
import { initialStorySnapshot } from "../../game/story/storyMachine";
import { matchesStoryConditions } from "../../game/story/storyMachine";
import { jasnovFestivalSquare } from "./jasnovFestivalSquare";
import { jasnovOutskirts } from "./jasnovOutskirts";
import { mapEntryPoint, mapsById } from "./maps";

describe("data-driven maps", () => {
  it("resolves the Jasnov transition and its target entry point", () => {
    const transition = jasnovOutskirts.transitions.find(
      (candidate) => candidate.id === "to-festival-square",
    );
    expect(transition?.targetMapId).toBe("jasnov-festival-square");
    expect(
      transition &&
        mapEntryPoint(mapsById[transition.targetMapId], transition.targetEntryPointId)
          ?.position,
    ).toEqual({ x: 0, z: 7 });
  });

  it("keeps the transition locked until the delivery is received", () => {
    const transition = jasnovOutskirts.transitions[0];
    expect(matchesStoryConditions(initialStorySnapshot, transition.conditions)).toBe(
      false,
    );
    expect(
      matchesStoryConditions(
        { ...initialStorySnapshot, stage: "travel-to-jasnov" },
        transition.conditions,
      ),
    ).toBe(true);
  });

  it("provides valid walkable spawns and required festival landmarks", () => {
    for (const map of [jasnovOutskirts, jasnovFestivalSquare]) {
      const spawn = mapEntryPoint(map, map.entryPoints[0].id);
      const terrain = map.terrain.find(
        (cell) =>
          cell.position.x === Math.round(spawn?.position.x ?? 999) &&
          cell.position.z === Math.round(spawn?.position.z ?? 999),
      );
      expect(terrain?.walkable).toBe(true);
    }

    const ids = new Set(jasnovFestivalSquare.entities.map((entity) => entity.id));
    expect(ids.has("festival-storehouse")).toBe(true);
    expect(ids.has("rena")).toBe(true);
    expect(ids.has("forest-gate")).toBe(true);
    expect(ids.has("ribbon-clue")).toBe(true);
  });
});
