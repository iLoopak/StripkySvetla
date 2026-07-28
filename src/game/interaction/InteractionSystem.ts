import type { GridPosition, InteractionDefinition } from "../../content/types";
import type { ChapterOneStage } from "../story/storyTypes";

export interface InteractionTarget {
  definition: InteractionDefinition;
  position: GridPosition;
  enabled: boolean;
}

export function distanceBetween(a: GridPosition, b: GridPosition): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

export function findNearestInteraction(
  playerPosition: GridPosition,
  targets: readonly InteractionTarget[],
  stage: ChapterOneStage,
): InteractionTarget | null {
  let nearest: InteractionTarget | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const target of targets) {
    if (!target.enabled || !target.definition.availableStages.includes(stage)) {
      continue;
    }

    const distance = distanceBetween(playerPosition, target.position);
    if (distance <= target.definition.interactionRadius && distance < nearestDistance) {
      nearest = target;
      nearestDistance = distance;
    }
  }

  return nearest;
}
