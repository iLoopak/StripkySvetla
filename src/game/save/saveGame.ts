import type { ChapterOneStage, SpuntOutcome, StorySnapshot } from "../story/storyTypes";
import { mapEntryPoint, mapsById } from "../../content/maps/maps";

export const SAVE_GAME_KEY = "stripky-svetla.save.v1";
export const SAVE_GAME_VERSION = 1;

const STORY_STAGES: readonly ChapterOneStage[] = [
  "meet-mila",
  "find-spark",
  "return-to-mila",
  "lantern-memory",
  "puk-awakening",
  "receive-rena-delivery",
  "travel-to-jasnov",
  "deliver-to-rena",
  "inspect-ribbon-clue",
  "confront-spunt",
  "resolve-spunt-choice",
  "reach-forest-gate",
  "wave-2-completed",
];

interface SavedStoryState {
  chapterId: "chapter-1";
  stage: ChapterOneStage;
  lanternMemorySeen: boolean;
  pukAwakened: boolean;
  renaDeliveryReceived: boolean;
  renaDeliveryCompleted: boolean;
  spuntOutcome: SpuntOutcome;
  spuntTrust: number;
  rangerTrust: number;
}

export interface SaveGameV1 {
  version: 1;
  savedAt: string;
  currentMapId: string;
  entryPointId: string;
  storyState: SavedStoryState;
  collectedEntityIds: string[];
  resolvedEntityIds: string[];
}

export type SaveLoadResult =
  { ok: true; save: SaveGameV1; snapshot: StorySnapshot } | { ok: false; reason: string };

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isStoryStage(value: unknown): value is ChapterOneStage {
  return typeof value === "string" && STORY_STAGES.includes(value as ChapterOneStage);
}

function isSpuntOutcome(value: unknown): value is SpuntOutcome {
  return value === null || value === "protected" || value === "handed-over";
}

function isSavedStoryState(value: unknown): value is SavedStoryState {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    candidate.chapterId === "chapter-1" &&
    isStoryStage(candidate.stage) &&
    typeof candidate.lanternMemorySeen === "boolean" &&
    typeof candidate.pukAwakened === "boolean" &&
    typeof candidate.renaDeliveryReceived === "boolean" &&
    typeof candidate.renaDeliveryCompleted === "boolean" &&
    isSpuntOutcome(candidate.spuntOutcome) &&
    Number.isInteger(candidate.spuntTrust) &&
    Number.isInteger(candidate.rangerTrust)
  );
}

export function serializeSaveGame(
  snapshot: StorySnapshot,
  currentMapId: string,
  entryPointId: string,
  savedAt = new Date().toISOString(),
): SaveGameV1 {
  return {
    version: SAVE_GAME_VERSION,
    savedAt,
    currentMapId,
    entryPointId,
    storyState: {
      chapterId: snapshot.chapterId,
      stage: snapshot.stage,
      lanternMemorySeen: snapshot.lanternMemorySeen,
      pukAwakened: snapshot.pukAwakened,
      renaDeliveryReceived: snapshot.renaDeliveryReceived,
      renaDeliveryCompleted: snapshot.renaDeliveryCompleted,
      spuntOutcome: snapshot.spuntOutcome,
      spuntTrust: snapshot.spuntTrust,
      rangerTrust: snapshot.rangerTrust,
    },
    collectedEntityIds: [...snapshot.collectedEntityIds],
    resolvedEntityIds: [...snapshot.resolvedEntityIds],
  };
}

export function parseSaveGame(rawValue: string): SaveLoadResult {
  let value: unknown;
  try {
    value = JSON.parse(rawValue);
  } catch {
    return { ok: false, reason: "Uložená hra je poškozená." };
  }

  if (!value || typeof value !== "object") {
    return { ok: false, reason: "Uložená hra nemá platný formát." };
  }
  const candidate = value as Record<string, unknown>;
  if (candidate.version !== SAVE_GAME_VERSION) {
    return { ok: false, reason: "Tato verze uložené hry není podporovaná." };
  }
  if (
    typeof candidate.savedAt !== "string" ||
    Number.isNaN(Date.parse(candidate.savedAt)) ||
    typeof candidate.currentMapId !== "string" ||
    typeof candidate.entryPointId !== "string" ||
    !isSavedStoryState(candidate.storyState) ||
    !isStringArray(candidate.collectedEntityIds) ||
    !isStringArray(candidate.resolvedEntityIds)
  ) {
    return { ok: false, reason: "Uložená hra obsahuje neplatná data." };
  }

  const save = candidate as unknown as SaveGameV1;
  const map = mapsById[save.currentMapId];
  if (!map || !mapEntryPoint(map, save.entryPointId)) {
    return { ok: false, reason: "Uložená hra odkazuje na neznámé místo." };
  }
  const festivalStages: readonly ChapterOneStage[] = [
    "deliver-to-rena",
    "inspect-ribbon-clue",
    "confront-spunt",
    "resolve-spunt-choice",
    "reach-forest-gate",
    "wave-2-completed",
  ];
  const expectsFestivalMap = festivalStages.includes(save.storyState.stage);
  if (
    (expectsFestivalMap && save.currentMapId !== "jasnov-festival-square") ||
    (!expectsFestivalMap && save.currentMapId !== "jasnov-outskirts")
  ) {
    return { ok: false, reason: "Uložený checkpoint není konzistentní." };
  }
  return {
    ok: true,
    save,
    snapshot: {
      ...save.storyState,
      collectedEntityIds: new Set(save.collectedEntityIds),
      resolvedEntityIds: new Set(save.resolvedEntityIds),
    },
  };
}

export function readSaveGame(storage: Storage): SaveLoadResult | null {
  const rawValue = storage.getItem(SAVE_GAME_KEY);
  return rawValue ? parseSaveGame(rawValue) : null;
}

export function writeSaveGame(storage: Storage, save: SaveGameV1): void {
  storage.setItem(SAVE_GAME_KEY, JSON.stringify(save));
}

export function removeSaveGame(storage: Storage): void {
  storage.removeItem(SAVE_GAME_KEY);
}
