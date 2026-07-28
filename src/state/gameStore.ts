import { create } from "zustand";
import type { PlayerPosition } from "../game/core/gameTypes";

export type GameStatus = "booting" | "ready" | "error";

interface GameStore {
  status: GameStatus;
  errorMessage: string | null;
  playerPosition: PlayerPosition;
  fps: number;
  setBooting: () => void;
  setReady: () => void;
  setError: (message: string) => void;
  updateTelemetry: (playerPosition: PlayerPosition, fps: number) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  status: "booting",
  errorMessage: null,
  playerPosition: { x: 0, y: 0, z: 0 },
  fps: 0,
  setBooting: () => set({ status: "booting", errorMessage: null }),
  setReady: () => set({ status: "ready", errorMessage: null }),
  setError: (errorMessage) => set({ status: "error", errorMessage }),
  updateTelemetry: (playerPosition, fps) => set({ playerPosition, fps }),
}));
