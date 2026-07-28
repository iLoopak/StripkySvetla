import { create } from "zustand";
import type { PlayerPosition } from "../game/core/gameTypes";
import { initialStorySnapshot, reduceStory } from "../game/story/storyMachine";
import type { InputMode, StorySnapshot, Wave1StoryStage } from "../game/story/storyTypes";

export type GameStatus = "booting" | "ready" | "error";

export interface FeedbackMessage {
  id: number;
  text: string;
}

interface GameStore {
  status: GameStatus;
  errorMessage: string | null;
  playerPosition: PlayerPosition;
  fps: number;
  storyStage: Wave1StoryStage;
  collectedEntityIds: ReadonlySet<string>;
  inputMode: InputMode;
  activeDialogueId: string | null;
  dialogueLineIndex: number;
  interactionPrompt: string | null;
  feedbackMessage: FeedbackMessage | null;
  setBooting: () => void;
  setReady: () => void;
  setError: (message: string) => void;
  updateTelemetry: (playerPosition: PlayerPosition, fps: number) => void;
  setInteractionPrompt: (prompt: string | null) => void;
  openDialogue: (dialogueId: string) => void;
  advanceDialogue: (lineCount: number) => void;
  collectEntity: (entityId: string) => boolean;
  clearFeedback: (id: number) => void;
}

let nextFeedbackId = 1;

function feedback(text: string): FeedbackMessage {
  return { id: nextFeedbackId++, text };
}

function storyFromState(state: GameStore): StorySnapshot {
  return {
    stage: state.storyStage,
    collectedEntityIds: state.collectedEntityIds,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  status: "booting",
  errorMessage: null,
  playerPosition: { x: 0, y: 0, z: 0 },
  fps: 0,
  storyStage: initialStorySnapshot.stage,
  collectedEntityIds: initialStorySnapshot.collectedEntityIds,
  inputMode: "world",
  activeDialogueId: null,
  dialogueLineIndex: 0,
  interactionPrompt: null,
  feedbackMessage: null,
  setBooting: () => set({ status: "booting", errorMessage: null }),
  setReady: () => set({ status: "ready", errorMessage: null }),
  setError: (errorMessage) => set({ status: "error", errorMessage }),
  updateTelemetry: (playerPosition, fps) => set({ playerPosition, fps }),
  setInteractionPrompt: (interactionPrompt) =>
    set((state) =>
      state.interactionPrompt === interactionPrompt ? state : { interactionPrompt },
    ),
  openDialogue: (activeDialogueId) =>
    set((state) =>
      state.inputMode === "dialogue"
        ? state
        : {
            activeDialogueId,
            dialogueLineIndex: 0,
            inputMode: "dialogue",
            interactionPrompt: null,
          },
    ),
  advanceDialogue: (lineCount) => {
    const state = get();
    if (!state.activeDialogueId) {
      return;
    }

    if (state.dialogueLineIndex + 1 < lineCount) {
      set({ dialogueLineIndex: state.dialogueLineIndex + 1 });
      return;
    }

    const nextStory = reduceStory(storyFromState(state), {
      type: "dialogue-completed",
      dialogueId: state.activeDialogueId,
    });
    let feedbackMessage = state.feedbackMessage;
    if (nextStory.stage === "find-spark" && nextStory.stage !== state.storyStage) {
      feedbackMessage = feedback("Nový cíl");
    } else if (nextStory.stage === "completed" && nextStory.stage !== state.storyStage) {
      feedbackMessage = feedback("Wave 1 dokončena");
    }

    set({
      activeDialogueId: null,
      dialogueLineIndex: 0,
      inputMode: "world",
      storyStage: nextStory.stage,
      collectedEntityIds: nextStory.collectedEntityIds,
      feedbackMessage,
      interactionPrompt: null,
    });
  },
  collectEntity: (entityId) => {
    const state = get();
    const nextStory = reduceStory(storyFromState(state), {
      type: "collectible-collected",
      entityId,
    });
    if (nextStory.stage === state.storyStage) {
      return false;
    }

    set({
      storyStage: nextStory.stage,
      collectedEntityIds: nextStory.collectedEntityIds,
      interactionPrompt: null,
      feedbackMessage: feedback("Získána světelná jiskra"),
    });
    return true;
  },
  clearFeedback: (id) =>
    set((state) =>
      state.feedbackMessage?.id === id ? { feedbackMessage: null } : state,
    ),
}));
