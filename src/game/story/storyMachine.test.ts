import { describe, expect, it } from "vitest";
import { jasnovOutskirts } from "../../content/maps/jasnovOutskirts";
import type { NpcEntityDefinition } from "../../content/types";
import {
  dialogueForNpc,
  initialStorySnapshot,
  objectiveForStage,
  reduceStory,
} from "./storyMachine";

const mila = jasnovOutskirts.entities.find(
  (entity): entity is NpcEntityDefinition =>
    entity.type === "npc" && entity.id === "mila",
);

if (!mila) {
  throw new Error("Mila is missing from the test map.");
}

describe("Wave 1 story machine", () => {
  it("advances through the intended story sequence", () => {
    const searching = reduceStory(initialStorySnapshot, {
      type: "dialogue-completed",
      dialogueId: "mila-introduction",
    });
    expect(searching.stage).toBe("find-spark");

    const returning = reduceStory(searching, {
      type: "collectible-collected",
      entityId: "light-spark",
    });
    expect(returning.stage).toBe("return-to-mila");
    expect(returning.collectedEntityIds.has("light-spark")).toBe(true);

    const completed = reduceStory(returning, {
      type: "dialogue-completed",
      dialogueId: "mila-return",
    });
    expect(completed.stage).toBe("completed");
  });

  it("rejects story events in the wrong stage", () => {
    const earlyCollect = reduceStory(initialStorySnapshot, {
      type: "collectible-collected",
      entityId: "light-spark",
    });
    const earlyReturn = reduceStory(initialStorySnapshot, {
      type: "dialogue-completed",
      dialogueId: "mila-return",
    });

    expect(earlyCollect).toBe(initialStorySnapshot);
    expect(earlyReturn).toBe(initialStorySnapshot);
  });

  it("allows the collectible to be acquired only once", () => {
    const searching = {
      stage: "find-spark" as const,
      collectedEntityIds: new Set<string>(),
    };
    const collected = reduceStory(searching, {
      type: "collectible-collected",
      entityId: "light-spark",
    });
    const repeated = reduceStory(collected, {
      type: "collectible-collected",
      entityId: "light-spark",
    });

    expect(repeated).toBe(collected);
    expect(repeated.collectedEntityIds.size).toBe(1);
  });

  it("selects Mila's dialogue and objective from the story stage", () => {
    expect(dialogueForNpc(mila, "meet-mila")).toBe("mila-introduction");
    expect(dialogueForNpc(mila, "find-spark")).toBe("mila-searching");
    expect(dialogueForNpc(mila, "return-to-mila")).toBe("mila-return");
    expect(dialogueForNpc(mila, "completed")).toBe("mila-completed");

    expect(objectiveForStage("meet-mila").id).toBe("talk-to-mila");
    expect(objectiveForStage("find-spark").id).toBe("find-light-spark");
    expect(objectiveForStage("return-to-mila").id).toBe("return-to-mila");
    expect(objectiveForStage("completed").completed).toBe(true);
  });
});
