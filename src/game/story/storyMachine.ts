import type { NpcEntityDefinition, ObjectiveDefinition } from "../../content/types";
import { objectivesByStage } from "../../content/objectives/wave1Objectives";
import type {
  ChapterOneStage,
  StoryCondition,
  StoryEvent,
  StorySnapshot,
} from "./storyTypes";

export const initialStorySnapshot: StorySnapshot = {
  chapterId: "chapter-1",
  stage: "meet-mila",
  lanternMemorySeen: false,
  pukAwakened: false,
  renaDeliveryReceived: false,
  renaDeliveryCompleted: false,
  spuntOutcome: null,
  spuntTrust: 0,
  rangerTrust: 0,
  collectedEntityIds: new Set<string>(),
  resolvedEntityIds: new Set<string>(),
};

function withStage(snapshot: StorySnapshot, stage: ChapterOneStage): StorySnapshot {
  return { ...snapshot, stage };
}

export function reduceStory(snapshot: StorySnapshot, event: StoryEvent): StorySnapshot {
  if (event.type === "collectible-collected") {
    if (
      snapshot.stage !== "find-spark" ||
      event.entityId !== "light-spark" ||
      snapshot.collectedEntityIds.has(event.entityId)
    ) {
      return snapshot;
    }

    return {
      ...snapshot,
      stage: "return-to-mila",
      collectedEntityIds: new Set([...snapshot.collectedEntityIds, event.entityId]),
    };
  }

  if (event.type === "map-entered") {
    return snapshot.stage === "travel-to-jasnov" &&
      event.mapId === "jasnov-festival-square"
      ? withStage(snapshot, "deliver-to-rena")
      : snapshot;
  }

  if (event.type === "ribbon-clue-inspected") {
    if (
      snapshot.stage !== "inspect-ribbon-clue" ||
      snapshot.resolvedEntityIds.has(event.entityId)
    ) {
      return snapshot;
    }
    return {
      ...snapshot,
      stage: "confront-spunt",
      resolvedEntityIds: new Set([...snapshot.resolvedEntityIds, event.entityId]),
    };
  }

  if (event.type === "spunt-choice-confirmed") {
    if (snapshot.stage !== "confront-spunt" || snapshot.spuntOutcome !== null) {
      return snapshot;
    }
    const protectedSpunt = event.outcome === "protected";
    return {
      ...snapshot,
      stage: "resolve-spunt-choice",
      spuntOutcome: event.outcome,
      spuntTrust: snapshot.spuntTrust + (protectedSpunt ? 1 : -1),
      rangerTrust: snapshot.rangerTrust + (protectedSpunt ? -1 : 1),
      resolvedEntityIds: new Set([...snapshot.resolvedEntityIds, "spunt-choice"]),
    };
  }

  const { dialogueId } = event;
  if (snapshot.stage === "meet-mila" && dialogueId === "mila-introduction") {
    return withStage(snapshot, "find-spark");
  }
  if (snapshot.stage === "return-to-mila" && dialogueId === "mila-return") {
    return withStage(snapshot, "lantern-memory");
  }
  if (snapshot.stage === "lantern-memory" && dialogueId === "lantern-memory") {
    return {
      ...snapshot,
      stage: "puk-awakening",
      lanternMemorySeen: true,
      resolvedEntityIds: new Set([...snapshot.resolvedEntityIds, "lantern-memory"]),
    };
  }
  if (snapshot.stage === "puk-awakening" && dialogueId === "puk-awakening") {
    return {
      ...snapshot,
      stage: "receive-rena-delivery",
      pukAwakened: true,
      resolvedEntityIds: new Set([...snapshot.resolvedEntityIds, "puk-awakening"]),
    };
  }
  if (snapshot.stage === "receive-rena-delivery" && dialogueId === "mila-rena-delivery") {
    return {
      ...snapshot,
      stage: "travel-to-jasnov",
      renaDeliveryReceived: true,
    };
  }
  if (snapshot.stage === "deliver-to-rena" && dialogueId === "rena-delivery") {
    return {
      ...snapshot,
      stage: "inspect-ribbon-clue",
      renaDeliveryCompleted: true,
    };
  }
  if (snapshot.stage === "resolve-spunt-choice" && dialogueId === "spunt-confrontation") {
    return withStage(snapshot, "reach-forest-gate");
  }
  if (
    snapshot.stage === "reach-forest-gate" &&
    (dialogueId === "gate-protected" || dialogueId === "gate-handed-over")
  ) {
    return {
      ...snapshot,
      stage: "wave-2-completed",
      resolvedEntityIds: new Set([...snapshot.resolvedEntityIds, "forest-gate"]),
    };
  }

  return snapshot;
}

export function matchesStoryConditions(
  snapshot: StorySnapshot,
  conditions: readonly StoryCondition[] | undefined,
): boolean {
  return (
    conditions?.every(
      (condition) =>
        (condition.stage === undefined || condition.stage === snapshot.stage) &&
        (condition.spuntOutcome === undefined ||
          condition.spuntOutcome === snapshot.spuntOutcome),
    ) ?? true
  );
}

export function dialogueForNpc(
  npc: NpcEntityDefinition,
  snapshot: StorySnapshot,
): string | null {
  const conditional = npc.conditionalDialogueIds?.find((candidate) =>
    matchesStoryConditions(snapshot, candidate.conditions),
  );
  return conditional?.dialogueId ?? npc.dialogueIds[snapshot.stage] ?? null;
}

export function objectiveForStage(stage: ChapterOneStage): ObjectiveDefinition {
  return objectivesByStage[stage];
}
