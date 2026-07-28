import type {
  DialogueChoice,
  DialogueDefinition,
  DialogueNode,
} from "../../content/types";
import { matchesStoryConditions } from "../story/storyMachine";
import type { StorySnapshot } from "../story/storyTypes";

export function dialogueNodeById(
  dialogue: DialogueDefinition,
  nodeId: string,
): DialogueNode | null {
  return dialogue.nodes.find((node) => node.id === nodeId) ?? null;
}

export function availableChoices(
  node: DialogueNode,
  snapshot: StorySnapshot,
): readonly DialogueChoice[] {
  return (
    node.choices?.filter((choice) =>
      matchesStoryConditions(snapshot, choice.conditions),
    ) ?? []
  );
}

export function validateDialogueGraph(dialogue: DialogueDefinition): readonly string[] {
  const errors: string[] = [];
  const nodeIds = new Set(dialogue.nodes.map((node) => node.id));
  const choiceIds = new Set<string>();
  if (nodeIds.size !== dialogue.nodes.length) {
    errors.push("Dialogue node IDs must be unique.");
  }

  if (!nodeIds.has(dialogue.startNodeId)) {
    errors.push(`Missing start node: ${dialogue.startNodeId}`);
  }

  for (const node of dialogue.nodes) {
    if (node.next && node.choices?.length) {
      errors.push(`Node ${node.id} cannot have both next and choices.`);
    }
    if (node.next && !nodeIds.has(node.next)) {
      errors.push(`Node ${node.id} references missing node ${node.next}.`);
    }
    if ((node.choices?.length ?? 0) > 2) {
      errors.push(`Node ${node.id} has more than two choices.`);
    }
    for (const choice of node.choices ?? []) {
      if (choiceIds.has(choice.id)) {
        errors.push(`Duplicate choice ID: ${choice.id}`);
      }
      choiceIds.add(choice.id);
      if (!nodeIds.has(choice.next)) {
        errors.push(`Choice ${choice.id} references missing node ${choice.next}.`);
      }
    }
  }

  const reachable = new Set<string>();
  const pending = [dialogue.startNodeId];
  while (pending.length > 0) {
    const nodeId = pending.pop();
    if (!nodeId || reachable.has(nodeId)) {
      continue;
    }
    reachable.add(nodeId);
    const node = dialogueNodeById(dialogue, nodeId);
    if (!node) {
      continue;
    }
    if (node.next) {
      pending.push(node.next);
    }
    for (const choice of node.choices ?? []) {
      pending.push(choice.next);
    }
  }
  const hasReachableTerminal = dialogue.nodes.some(
    (node) => reachable.has(node.id) && !node.next && (node.choices?.length ?? 0) === 0,
  );
  if (!hasReachableTerminal) {
    errors.push("Dialogue graph has no reachable terminal node.");
  }

  return errors;
}
