import { dialoguesById } from "../content/dialogues/wave1Dialogues";
import { useGameStore } from "../state/gameStore";
import { LightShardMark } from "./LightShardMark";

export function DialogueOverlay() {
  const dialogueId = useGameStore((state) => state.activeDialogueId);
  const lineIndex = useGameStore((state) => state.dialogueLineIndex);
  const advanceDialogue = useGameStore((state) => state.advanceDialogue);
  const dialogue = dialogueId ? dialoguesById[dialogueId] : null;

  if (!dialogue) {
    return null;
  }

  const isLastLine = lineIndex === dialogue.lines.length - 1;

  return (
    <section className="dialogue-layer" role="dialog" aria-modal="true">
      <div className="dialogue-panel">
        <span className="dialogue-corner" aria-hidden="true" />
        <div className="dialogue-heading">
          <div className="dialogue-speaker-lockup">
            <LightShardMark className="light-shard-mark--dialogue" />
            <p className="dialogue-speaker">{dialogue.speakerName}</p>
          </div>
          <span className="dialogue-progress">
            {lineIndex + 1} / {dialogue.lines.length}
          </span>
        </div>
        <p className="dialogue-line">{dialogue.lines[lineIndex]}</p>
        <div className="dialogue-actions">
          <span>
            <kbd>E</kbd> / <kbd>Enter</kbd>
          </span>
          <button type="button" onClick={() => advanceDialogue(dialogue.lines.length)}>
            <span>{isLastLine ? "Dokončit" : "Pokračovat"}</span>
            <i aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
