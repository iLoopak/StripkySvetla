export type Wave1StoryStage = "meet-mila" | "find-spark" | "return-to-mila" | "completed";

export type InputMode = "world" | "dialogue";

export interface StorySnapshot {
  stage: Wave1StoryStage;
  collectedEntityIds: ReadonlySet<string>;
}

export type StoryEvent =
  | { type: "dialogue-completed"; dialogueId: string }
  | { type: "collectible-collected"; entityId: string };
