import { describe, expect, it } from "vitest";
import type { InteractionTarget } from "./InteractionSystem";
import { findNearestInteraction } from "./InteractionSystem";

const targets: readonly InteractionTarget[] = [
  {
    definition: {
      id: "far",
      type: "dialogue",
      targetId: "npc-far",
      prompt: "E · Promluvit",
      interactionRadius: 3,
      availableStages: ["meet-mila"],
    },
    position: { x: 2, z: 0 },
    enabled: true,
  },
  {
    definition: {
      id: "near",
      type: "collect",
      targetId: "item-near",
      prompt: "E · Sebrat",
      interactionRadius: 2,
      availableStages: ["meet-mila"],
    },
    position: { x: 1, z: 0 },
    enabled: true,
  },
];

describe("findNearestInteraction", () => {
  it("chooses the nearest enabled target in range", () => {
    expect(
      findNearestInteraction({ x: 0, z: 0 }, targets, "meet-mila")?.definition.id,
    ).toBe("near");
  });

  it("returns null outside the interaction radius", () => {
    expect(findNearestInteraction({ x: -5, z: 0 }, targets, "meet-mila")).toBeNull();
  });

  it("filters disabled targets and unavailable story stages", () => {
    const disabled = targets.map((target) => ({ ...target, enabled: false }));
    expect(findNearestInteraction({ x: 0, z: 0 }, disabled, "meet-mila")).toBeNull();
    expect(findNearestInteraction({ x: 0, z: 0 }, targets, "find-spark")).toBeNull();
  });
});
