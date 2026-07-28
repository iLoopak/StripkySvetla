export type ChapterId = "chapter-1";

export type ChapterOneStage =
  | "meet-mila"
  | "find-spark"
  | "return-to-mila"
  | "lantern-memory"
  | "puk-awakening"
  | "receive-rena-delivery"
  | "travel-to-jasnov"
  | "deliver-to-rena"
  | "inspect-ribbon-clue"
  | "confront-spunt"
  | "resolve-spunt-choice"
  | "reach-forest-gate"
  | "wave-2-completed";

export type SpuntOutcome = "protected" | "handed-over" | null;
export type InputMode = "world" | "dialogue" | "transition";

export interface StorySnapshot {
  chapterId: ChapterId;
  stage: ChapterOneStage;
  lanternMemorySeen: boolean;
  pukAwakened: boolean;
  renaDeliveryReceived: boolean;
  renaDeliveryCompleted: boolean;
  spuntOutcome: SpuntOutcome;
  spuntTrust: number;
  rangerTrust: number;
  collectedEntityIds: ReadonlySet<string>;
  resolvedEntityIds: ReadonlySet<string>;
}

export type StoryEvent =
  | { type: "dialogue-completed"; dialogueId: string }
  | { type: "collectible-collected"; entityId: string }
  | { type: "map-entered"; mapId: string }
  | { type: "ribbon-clue-inspected"; entityId: string }
  | { type: "spunt-choice-confirmed"; outcome: Exclude<SpuntOutcome, null> };

export interface StoryCondition {
  stage?: ChapterOneStage;
  spuntOutcome?: Exclude<SpuntOutcome, null>;
}
