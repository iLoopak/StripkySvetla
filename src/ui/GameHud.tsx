import { objectiveForStage } from "../game/story/storyMachine";
import { useGameStore } from "../state/gameStore";
import { FeedbackMessage } from "./FeedbackMessage";
import { LightShardMark } from "./LightShardMark";
import { parseInteractionPrompt } from "./uiVisuals";

export function GameHud() {
  const status = useGameStore((state) => state.status);
  const fps = useGameStore((state) => state.fps);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const storyStage = useGameStore((state) => state.storyStage);
  const interactionPrompt = useGameStore((state) => state.interactionPrompt);
  const inputMode = useGameStore((state) => state.inputMode);
  const objective = objectiveForStage(storyStage);
  const parsedPrompt = interactionPrompt
    ? parseInteractionPrompt(interactionPrompt)
    : null;

  return (
    <div className="hud" aria-hidden={status !== "ready"}>
      <header className="title-panel">
        <div className="title-kicker">
          <LightShardMark className="light-shard-mark--title" />
          <p className="eyebrow">Wave 1.5 · Světelná stopa</p>
        </div>
        <h1>Střípky světla</h1>
        <span className="title-light-line" aria-hidden="true">
          <i />
        </span>
      </header>

      <section
        className={`objective-panel${objective.completed ? " objective-panel--complete" : ""}`}
        key={objective.id}
        aria-label="Aktuální cíl"
        data-visual-state={objective.completed ? "complete" : "active"}
      >
        <span className="objective-corner" aria-hidden="true" />
        <div className="objective-heading">
          <LightShardMark className="light-shard-mark--objective" />
          <p className="objective-label">
            {objective.completed ? "Dokončeno" : "Aktuální cíl"}
          </p>
        </div>
        <div className="objective-copy">
          <p className="objective-title">{objective.title}</p>
          {objective.description ? (
            <p className="objective-description">{objective.description}</p>
          ) : null}
        </div>
      </section>

      {import.meta.env.DEV ? (
        <aside className="debug-panel" aria-label="Stav hry">
          <span className="status-line">
            <i className={`status-dot status-dot--${status}`} />
            <small>Engine</small>
            {status === "ready" ? "připraven" : status}
          </span>
          <span>
            <small>FPS</small>
            {Math.round(fps)}
          </span>
          <span>
            <small>Pozice</small>
            {playerPosition.x.toFixed(1)} · {playerPosition.y.toFixed(1)} ·{" "}
            {playerPosition.z.toFixed(1)}
          </span>
        </aside>
      ) : null}

      {parsedPrompt && inputMode === "world" ? (
        <div className="interaction-prompt" role="status" aria-live="polite">
          <LightShardMark className="light-shard-mark--prompt" />
          <kbd>{parsedPrompt.key}</kbd>
          <span>{parsedPrompt.label}</span>
        </div>
      ) : null}

      <FeedbackMessage />

      <footer className="controls-panel">
        <span>
          <kbd>WASD</kbd>
          <span className="control-secondary"> / šipky</span> Pohyb
        </span>
        <span className="controls-divider" />
        <span>
          <kbd>E</kbd> Interakce
        </span>
        <span className="controls-divider" />
        <span className="control-camera">Kamera · táhnout / zoom</span>
      </footer>
    </div>
  );
}
