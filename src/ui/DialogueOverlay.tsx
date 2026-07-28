import { dialoguesById } from "../content/dialogues/wave1Dialogues";
import { availableChoices, dialogueNodeById } from "../game/dialogue/dialogueGraph";
import { useGameStore } from "../state/gameStore";
import { LightShardMark } from "./LightShardMark";

export function DialogueOverlay() {
  const dialogueId = useGameStore((state) => state.activeDialogueId);
  const nodeId = useGameStore((state) => state.activeDialogueNodeId);
  const selectedChoiceIndex = useGameStore((state) => state.selectedChoiceIndex);
  const advanceDialogue = useGameStore((state) => state.advanceDialogue);
  const chooseDialogue = useGameStore((state) => state.chooseDialogue);
  const chapterId = useGameStore((state) => state.chapterId);
  const stage = useGameStore((state) => state.stage);
  const lanternMemorySeen = useGameStore((state) => state.lanternMemorySeen);
  const pukAwakened = useGameStore((state) => state.pukAwakened);
  const renaDeliveryReceived = useGameStore((state) => state.renaDeliveryReceived);
  const renaDeliveryCompleted = useGameStore((state) => state.renaDeliveryCompleted);
  const spuntOutcome = useGameStore((state) => state.spuntOutcome);
  const spuntTrust = useGameStore((state) => state.spuntTrust);
  const rangerTrust = useGameStore((state) => state.rangerTrust);
  const collectedEntityIds = useGameStore((state) => state.collectedEntityIds);
  const resolvedEntityIds = useGameStore((state) => state.resolvedEntityIds);
  const story = {
    chapterId,
    stage,
    lanternMemorySeen,
    pukAwakened,
    renaDeliveryReceived,
    renaDeliveryCompleted,
    spuntOutcome,
    spuntTrust,
    rangerTrust,
    collectedEntityIds,
    resolvedEntityIds,
  };
  const dialogue = dialogueId ? dialoguesById[dialogueId] : null;
  const node = dialogue && nodeId ? dialogueNodeById(dialogue, nodeId) : null;

  if (!dialogue || !node) {
    return null;
  }

  const choices = availableChoices(node, story);
  const speakerName = node.speakerName ?? dialogue.speakerName;
  const isTerminal = !node.next && choices.length === 0;

  return (
    <section className="dialogue-layer" role="dialog" aria-modal="true">
      <div className="dialogue-panel">
        <span className="dialogue-corner" aria-hidden="true" />
        <div className="dialogue-heading">
          <div className="dialogue-speaker-lockup">
            <LightShardMark className="light-shard-mark--dialogue" />
            <p className="dialogue-speaker">{speakerName}</p>
          </div>
          {choices.length > 0 ? (
            <span className="dialogue-progress">Vyber odpověď</span>
          ) : null}
        </div>
        <p className="dialogue-line">{node.text}</p>

        {choices.length > 0 ? (
          <div className="dialogue-choices" aria-label="Možnosti odpovědi">
            {choices.map((choice, index) => (
              <button
                type="button"
                className={
                  index === selectedChoiceIndex ? "dialogue-choice--selected" : ""
                }
                key={choice.id}
                onClick={() => chooseDialogue(index)}
              >
                <span>{choice.text}</span>
              </button>
            ))}
            <small>
              <kbd>W</kbd> / <kbd>S</kbd> nebo šipky · potvrdit <kbd>E</kbd>
            </small>
          </div>
        ) : (
          <div className="dialogue-actions">
            <span>
              <kbd>E</kbd> / <kbd>Enter</kbd>
            </span>
            <button type="button" onClick={advanceDialogue}>
              <span>{isTerminal ? "Dokončit" : "Pokračovat"}</span>
              <i aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
