import { useEffect, useRef } from "react";
import { useGameStore } from "../state/gameStore";
import { GameRuntime } from "./core/GameRuntime";

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    useGameStore.getState().setBooting();
    let runtime: GameRuntime | null = null;

    try {
      runtime = new GameRuntime(canvas);
      useGameStore.getState().setReady();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nepodařilo se spustit herní scénu.";
      console.error("Babylon runtime initialization failed.", error);
      useGameStore.getState().setError(message);
    }

    return () => {
      runtime?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      aria-label="Voxelový svět hry Střípky světla"
    />
  );
}
