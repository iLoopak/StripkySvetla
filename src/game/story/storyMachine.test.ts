import { describe, expect, it } from "vitest";
import { jasnovOutskirts } from "../../content/maps/jasnovOutskirts";
import type { NpcEntityDefinition } from "../../content/types";
import {
  dialogueForNpc,
  initialStorySnapshot,
  objectiveForStage,
  reduceStory,
} from "./storyMachine";
import type { StorySnapshot } from "./storyTypes";

const mila = jasnovOutskirts.entities.find(
  (entity): entity is NpcEntityDefinition =>
    entity.type === "npc" && entity.id === "mila",
);

if (!mila) {
  throw new Error("Mila is missing from the test map.");
}

function reachLanternMemory(): StorySnapshot {
  const searching = reduceStory(initialStorySnapshot, {
    type: "dialogue-completed",
    dialogueId: "mila-introduction",
  });
  const returning = reduceStory(searching, {
    type: "collectible-collected",
    entityId: "light-spark",
  });
  return reduceStory(returning, {
    type: "dialogue-completed",
    dialogueId: "mila-return",
  });
}

function reachConfrontation(): StorySnapshot {
  let story = reachLanternMemory();
  story = reduceStory(story, {
    type: "dialogue-completed",
    dialogueId: "lantern-memory",
  });
  story = reduceStory(story, {
    type: "dialogue-completed",
    dialogueId: "puk-awakening",
  });
  story = reduceStory(story, {
    type: "dialogue-completed",
    dialogueId: "mila-rena-delivery",
  });
  story = reduceStory(story, {
    type: "map-entered",
    mapId: "jasnov-festival-square",
  });
  story = reduceStory(story, {
    type: "dialogue-completed",
    dialogueId: "rena-delivery",
  });
  return reduceStory(story, {
    type: "ribbon-clue-inspected",
    entityId: "ribbon-clue",
  });
}

describe("chapter one story machine", () => {
  it("preserves the Wave 1 sequence and enters the lantern memory", () => {
    const memory = reachLanternMemory();
    expect(memory.stage).toBe("lantern-memory");
    expect(memory.collectedEntityIds.has("light-spark")).toBe(true);
    expect(memory.lanternMemorySeen).toBe(false);
  });

  it("shows the memory and awakens Puk only once", () => {
    const memory = reachLanternMemory();
    const awakening = reduceStory(memory, {
      type: "dialogue-completed",
      dialogueId: "lantern-memory",
    });
    const repeatedMemory = reduceStory(awakening, {
      type: "dialogue-completed",
      dialogueId: "lantern-memory",
    });
    const awakened = reduceStory(awakening, {
      type: "dialogue-completed",
      dialogueId: "puk-awakening",
    });
    const repeatedAwakening = reduceStory(awakened, {
      type: "dialogue-completed",
      dialogueId: "puk-awakening",
    });

    expect(awakening.lanternMemorySeen).toBe(true);
    expect(repeatedMemory).toBe(awakening);
    expect(awakened.pukAwakened).toBe(true);
    expect(awakened.stage).toBe("receive-rena-delivery");
    expect(repeatedAwakening).toBe(awakened);
  });

  it("does not allow the delivery or clue to be skipped", () => {
    expect(
      reduceStory(initialStorySnapshot, {
        type: "map-entered",
        mapId: "jasnov-festival-square",
      }),
    ).toBe(initialStorySnapshot);
    expect(
      reduceStory(initialStorySnapshot, {
        type: "ribbon-clue-inspected",
        entityId: "ribbon-clue",
      }),
    ).toBe(initialStorySnapshot);
  });

  it.each([
    ["protected", 1, -1],
    ["handed-over", -1, 1],
  ] as const)(
    "commits the %s choice once and folds at the forest gate",
    (outcome, spuntTrust, rangerTrust) => {
      const confrontation = reachConfrontation();
      const chosen = reduceStory(confrontation, {
        type: "spunt-choice-confirmed",
        outcome,
      });
      const changedChoice = reduceStory(chosen, {
        type: "spunt-choice-confirmed",
        outcome: outcome === "protected" ? "handed-over" : "protected",
      });
      const folded = reduceStory(chosen, {
        type: "dialogue-completed",
        dialogueId: "spunt-confrontation",
      });

      expect(chosen.spuntOutcome).toBe(outcome);
      expect(chosen.spuntTrust).toBe(spuntTrust);
      expect(chosen.rangerTrust).toBe(rangerTrust);
      expect(changedChoice).toBe(chosen);
      expect(folded.stage).toBe("reach-forest-gate");
      expect(folded.spuntOutcome).toBe(outcome);
    },
  );

  it("selects dialogue and objectives from the story snapshot", () => {
    expect(dialogueForNpc(mila, initialStorySnapshot)).toBe("mila-introduction");
    const memory = reachLanternMemory();
    expect(objectiveForStage(memory.stage).id).toBe("watch-lantern-memory");
    expect(objectiveForStage("wave-2-completed").completed).toBe(true);
  });
});
