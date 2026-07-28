import { objectiveForStage } from "../game/story/storyMachine";
import { useGameStore } from "../state/gameStore";
import { FeedbackMessage } from "./FeedbackMessage";

export function GameHud() {
  const status = useGameStore((state) => state.status);
  const fps = useGameStore((state) => state.fps);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const storyStage = useGameStore((state) => state.storyStage);
  const interactionPrompt = useGameStore((state) => state.interactionPrompt);
  const inputMode = useGameStore((state) => state.inputMode);
  const objective = objectiveForStage(storyStage);

  return (
    <div className="hud" aria-hidden={status !== "ready"}>
      <header className="title-panel">
        <p className="eyebrow">Wave 1 · Světelná stopa</p>
        <h1>Střípky světla</h1>
      </header>

      <section
        className={`objective-panel${objective.completed ? " objective-panel--complete" : ""}`}
        key={objective.id}
        aria-label="Aktuální cíl"
      >
        <p className="objective-label">
          {objective.completed ? "Dokončeno" : "Aktuální cíl"}
        </p>
        <p className="objective-title">{objective.title}</p>
        {objective.description ? (
          <p className="objective-description">{objective.description}</p>
        ) : null}
      </section>

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

      {interactionPrompt && inputMode === "world" ? (
        <div className="interaction-prompt">
          <kbd>{interactionPrompt.slice(0, 1)}</kbd>
          <span>{interactionPrompt.slice(2).trim()}</span>
        </div>
      ) : null}

      <FeedbackMessage />

      <footer className="controls-panel">
        <span>
          <kbd>WASD</kbd> / <kbd>šipky</kbd> Pohyb
        </span>
        <span className="controls-divider" />
        <span>
          <kbd>E</kbd> Interakce
        </span>
        <span className="controls-divider" />
        <span>Kamera: táhnout · zoom</span>
      </footer>
    </div>
  );
}
