import type { NpcEntityDefinition, ObjectiveDefinition } from "../../content/types";
import { wave1ObjectivesByStage } from "../../content/objectives/wave1Objectives";
import type { StoryEvent, StorySnapshot, Wave1StoryStage } from "./storyTypes";

export const initialStorySnapshot: StorySnapshot = {
  stage: "meet-mila",
  collectedEntityIds: new Set<string>(),
};

export function reduceStory(snapshot: StorySnapshot, event: StoryEvent): StorySnapshot {
  if (event.type === "dialogue-completed") {
    if (snapshot.stage === "meet-mila" && event.dialogueId === "mila-introduction") {
      return { ...snapshot, stage: "find-spark" };
    }
    if (snapshot.stage === "return-to-mila" && event.dialogueId === "mila-return") {
      return { ...snapshot, stage: "completed" };
    }
    return snapshot;
  }

  if (
    snapshot.stage !== "find-spark" ||
    event.entityId !== "light-spark" ||
    snapshot.collectedEntityIds.has(event.entityId)
  ) {
    return snapshot;
  }

  return {
    stage: "return-to-mila",
    collectedEntityIds: new Set([...snapshot.collectedEntityIds, event.entityId]),
  };
}

export function dialogueForNpc(
  npc: NpcEntityDefinition,
  stage: Wave1StoryStage,
): string | null {
  return npc.dialogueIds[stage] ?? null;
}

export function objectiveForStage(stage: Wave1StoryStage): ObjectiveDefinition {
  return wave1ObjectivesByStage[stage];
}
