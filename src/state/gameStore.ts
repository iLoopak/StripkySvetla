import { create } from "zustand";
import { dialoguesById } from "../content/dialogues/wave1Dialogues";
import type { PlayerPosition } from "../game/core/gameTypes";
import { availableChoices, dialogueNodeById } from "../game/dialogue/dialogueGraph";
import {
  readSaveGame,
  removeSaveGame,
  serializeSaveGame,
  writeSaveGame,
} from "../game/save/saveGame";
import { initialStorySnapshot, reduceStory } from "../game/story/storyMachine";
import type { InputMode, StoryEvent, StorySnapshot } from "../game/story/storyTypes";

export type GameStatus = "idle" | "booting" | "ready" | "error";

export interface FeedbackMessage {
  id: number;
  text: string;
}

interface GameStore extends StorySnapshot {
  status: GameStatus;
  errorMessage: string | null;
  gameStarted: boolean;
  saveAvailable: boolean;
  playerPosition: PlayerPosition;
  fps: number;
  currentMapId: string;
  entryPointId: string;
  inputMode: InputMode;
  activeDialogueId: string | null;
  activeDialogueNodeId: string | null;
  selectedChoiceIndex: number;
  interactionPrompt: string | null;
  feedbackMessage: FeedbackMessage | null;
  setBooting: () => void;
  setReady: () => void;
  setError: (message: string) => void;
  startNewGame: () => void;
  continueGame: () => boolean;
  updateTelemetry: (playerPosition: PlayerPosition, fps: number) => void;
  setInteractionPrompt: (prompt: string | null) => void;
  setTransitioning: (transitioning: boolean) => void;
  setMapCheckpoint: (mapId: string, entryPointId: string) => void;
  dispatchStory: (event: StoryEvent) => boolean;
  openDialogue: (dialogueId: string) => void;
  advanceDialogue: () => void;
  moveDialogueChoice: (delta: -1 | 1) => void;
  chooseDialogue: (choiceIndex?: number) => void;
  collectEntity: (entityId: string) => boolean;
  showFeedback: (text: string) => void;
  clearFeedback: (id: number) => void;
}

let nextFeedbackId = 1;

function feedback(text: string): FeedbackMessage {
  return { id: nextFeedbackId++, text };
}

function browserStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function storyFromState(state: GameStore): StorySnapshot {
  return {
    chapterId: state.chapterId,
    stage: state.stage,
    lanternMemorySeen: state.lanternMemorySeen,
    pukAwakened: state.pukAwakened,
    renaDeliveryReceived: state.renaDeliveryReceived,
    renaDeliveryCompleted: state.renaDeliveryCompleted,
    spuntOutcome: state.spuntOutcome,
    spuntTrust: state.spuntTrust,
    rangerTrust: state.rangerTrust,
    collectedEntityIds: state.collectedEntityIds,
    resolvedEntityIds: state.resolvedEntityIds,
  };
}

function storyPatch(snapshot: StorySnapshot): StorySnapshot {
  return snapshot;
}

const AUTOSAVE_STAGES = new Set([
  "receive-rena-delivery",
  "travel-to-jasnov",
  "deliver-to-rena",
  "inspect-ribbon-clue",
  "resolve-spunt-choice",
  "reach-forest-gate",
  "wave-2-completed",
]);

function persistCheckpoint(state: GameStore): boolean {
  if (!AUTOSAVE_STAGES.has(state.stage)) {
    return false;
  }
  const storage = browserStorage();
  if (!storage) {
    return false;
  }
  writeSaveGame(
    storage,
    serializeSaveGame(storyFromState(state), state.currentMapId, state.entryPointId),
  );
  return true;
}

function inspectBrowserSave(): {
  available: boolean;
  errorMessage: string | null;
} {
  const storage = browserStorage();
  const loaded = storage ? readSaveGame(storage) : null;
  return {
    available: loaded?.ok === true,
    errorMessage: loaded && !loaded.ok ? loaded.reason : null,
  };
}

const initialSaveState = inspectBrowserSave();

export const useGameStore = create<GameStore>((set, get) => ({
  status: "idle",
  errorMessage: initialSaveState.errorMessage,
  gameStarted: false,
  saveAvailable: initialSaveState.available,
  playerPosition: { x: 0, y: 0, z: 0 },
  fps: 0,
  currentMapId: "jasnov-outskirts",
  entryPointId: "wave-1-start",
  ...initialStorySnapshot,
  inputMode: "world",
  activeDialogueId: null,
  activeDialogueNodeId: null,
  selectedChoiceIndex: 0,
  interactionPrompt: null,
  feedbackMessage: null,
  setBooting: () => set({ status: "booting", errorMessage: null }),
  setReady: () => set({ status: "ready", errorMessage: null }),
  setError: (errorMessage) => set({ status: "error", errorMessage }),
  startNewGame: () => {
    const storage = browserStorage();
    if (storage) {
      removeSaveGame(storage);
    }
    set({
      ...storyPatch(initialStorySnapshot),
      status: "idle",
      errorMessage: null,
      gameStarted: true,
      saveAvailable: false,
      currentMapId: "jasnov-outskirts",
      entryPointId: "wave-1-start",
      inputMode: "world",
      activeDialogueId: null,
      activeDialogueNodeId: null,
      selectedChoiceIndex: 0,
      interactionPrompt: null,
      feedbackMessage: null,
    });
  },
  continueGame: () => {
    const storage = browserStorage();
    const loaded = storage ? readSaveGame(storage) : null;
    if (!loaded?.ok) {
      set({
        saveAvailable: false,
        errorMessage: loaded?.reason ?? "Uložená hra nebyla nalezena.",
      });
      return false;
    }
    set({
      ...storyPatch(loaded.snapshot),
      status: "idle",
      errorMessage: null,
      gameStarted: true,
      saveAvailable: true,
      currentMapId: loaded.save.currentMapId,
      entryPointId: loaded.save.entryPointId,
      inputMode: "world",
      activeDialogueId: null,
      activeDialogueNodeId: null,
      selectedChoiceIndex: 0,
      interactionPrompt: null,
      feedbackMessage: feedback("Postup načten"),
    });
    return true;
  },
  updateTelemetry: (playerPosition, fps) => set({ playerPosition, fps }),
  setInteractionPrompt: (interactionPrompt) =>
    set((state) =>
      state.interactionPrompt === interactionPrompt ? state : { interactionPrompt },
    ),
  setTransitioning: (transitioning) =>
    set({
      inputMode: transitioning ? "transition" : "world",
      interactionPrompt: null,
    }),
  setMapCheckpoint: (currentMapId, entryPointId) => {
    set({ currentMapId, entryPointId });
    const state = get();
    if (persistCheckpoint(state)) {
      set({ saveAvailable: true, feedbackMessage: feedback("Postup uložen") });
    }
  },
  dispatchStory: (event) => {
    const state = get();
    const currentStory = storyFromState(state);
    const nextStory = reduceStory(currentStory, event);
    if (nextStory === currentStory) {
      return false;
    }
    set({ ...storyPatch(nextStory), interactionPrompt: null });
    const updated = get();
    if (persistCheckpoint(updated)) {
      set({ saveAvailable: true, feedbackMessage: feedback("Postup uložen") });
    }
    return true;
  },
  openDialogue: (activeDialogueId) => {
    const dialogue = dialoguesById[activeDialogueId];
    if (!dialogue) {
      set({ status: "error", errorMessage: "Dialogový obsah se nepodařilo načíst." });
      return;
    }
    set((state) =>
      state.inputMode === "dialogue" || state.inputMode === "transition"
        ? state
        : {
            activeDialogueId,
            activeDialogueNodeId: dialogue.startNodeId,
            selectedChoiceIndex: 0,
            inputMode: "dialogue",
            interactionPrompt: null,
          },
    );
  },
  advanceDialogue: () => {
    const state = get();
    const dialogue = state.activeDialogueId && dialoguesById[state.activeDialogueId];
    const node =
      dialogue && state.activeDialogueNodeId
        ? dialogueNodeById(dialogue, state.activeDialogueNodeId)
        : null;
    if (!dialogue || !node || node.choices?.length) {
      return;
    }
    if (node.next) {
      set({ activeDialogueNodeId: node.next, selectedChoiceIndex: 0 });
      return;
    }

    const nextStory = reduceStory(storyFromState(state), {
      type: "dialogue-completed",
      dialogueId: dialogue.id,
    });
    set({
      ...storyPatch(nextStory),
      activeDialogueId: null,
      activeDialogueNodeId: null,
      selectedChoiceIndex: 0,
      inputMode: "world",
      interactionPrompt: null,
    });
    const updated = get();
    if (persistCheckpoint(updated)) {
      set({ saveAvailable: true, feedbackMessage: feedback("Postup uložen") });
    } else if (updated.stage !== state.stage) {
      set({
        feedbackMessage: feedback(
          updated.stage === "wave-2-completed" ? "Wave 2 dokončena" : "Nový cíl",
        ),
      });
    }
  },
  moveDialogueChoice: (delta) => {
    const state = get();
    const dialogue = state.activeDialogueId && dialoguesById[state.activeDialogueId];
    const node =
      dialogue && state.activeDialogueNodeId
        ? dialogueNodeById(dialogue, state.activeDialogueNodeId)
        : null;
    const choices = node ? availableChoices(node, storyFromState(state)) : [];
    if (choices.length === 0) {
      return;
    }
    set({
      selectedChoiceIndex:
        (state.selectedChoiceIndex + delta + choices.length) % choices.length,
    });
  },
  chooseDialogue: (choiceIndex) => {
    const state = get();
    const dialogue = state.activeDialogueId && dialoguesById[state.activeDialogueId];
    const node =
      dialogue && state.activeDialogueNodeId
        ? dialogueNodeById(dialogue, state.activeDialogueNodeId)
        : null;
    const choices = node ? availableChoices(node, storyFromState(state)) : [];
    const index = choiceIndex ?? state.selectedChoiceIndex;
    const choice = choices[index];
    if (!choice) {
      return;
    }
    let nextStory = storyFromState(state);
    if (choice.outcome) {
      nextStory = reduceStory(nextStory, {
        type: "spunt-choice-confirmed",
        outcome: choice.outcome,
      });
    }
    set({
      ...storyPatch(nextStory),
      activeDialogueNodeId: choice.next,
      selectedChoiceIndex: 0,
    });
    const updated = get();
    if (persistCheckpoint(updated)) {
      set({ saveAvailable: true, feedbackMessage: feedback("Postup uložen") });
    }
  },
  collectEntity: (entityId) =>
    get().dispatchStory({ type: "collectible-collected", entityId }),
  showFeedback: (text) => set({ feedbackMessage: feedback(text) }),
  clearFeedback: (id) =>
    set((state) =>
      state.feedbackMessage?.id === id ? { feedbackMessage: null } : state,
    ),
}));
