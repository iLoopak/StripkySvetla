import { useGameStore } from "../state/gameStore";

export function GameHud() {
  const status = useGameStore((state) => state.status);
  const fps = useGameStore((state) => state.fps);
  const playerPosition = useGameStore((state) => state.playerPosition);

  return (
    <div className="hud" aria-hidden={status !== "ready"}>
      <header className="title-panel">
        <p className="eyebrow">Wave 0 · Technický základ</p>
        <h1>Střípky světla</h1>
      </header>

      <aside className="debug-panel" aria-label="Stav hry">
        <span className="status-line">
          <i className={`status-dot status-dot--${status}`} />
          Engine: {status === "ready" ? "připraven" : status}
        </span>
        <span>FPS: {Math.round(fps)}</span>
        <span>
          Pozice: {playerPosition.x.toFixed(1)} · {playerPosition.y.toFixed(1)} ·{" "}
          {playerPosition.z.toFixed(1)}
        </span>
      </aside>

      <footer className="controls-panel">
        <span>
          <kbd>WASD</kbd> / <kbd>šipky</kbd> Pohyb
        </span>
        <span className="controls-divider" />
        <span>Kamera: táhnout myší · zoom kolečkem</span>
      </footer>
    </div>
  );
}
