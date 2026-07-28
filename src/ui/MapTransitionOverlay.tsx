import { useGameStore } from "../state/gameStore";

export function MapTransitionOverlay() {
  const transitioning = useGameStore((state) => state.inputMode === "transition");
  return (
    <div
      className={`map-transition${transitioning ? " map-transition--active" : ""}`}
      aria-hidden="true"
    />
  );
}
