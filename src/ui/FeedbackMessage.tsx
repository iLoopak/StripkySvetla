import { useEffect } from "react";
import { useGameStore } from "../state/gameStore";
import { LightShardMark } from "./LightShardMark";
import { feedbackVisualKind } from "./uiVisuals";

const FEEDBACK_DURATION_MS = 3200;

export function FeedbackMessage() {
  const message = useGameStore((state) => state.feedbackMessage);
  const clearFeedback = useGameStore((state) => state.clearFeedback);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(
      () => clearFeedback(message.id),
      FEEDBACK_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [clearFeedback, message]);

  if (!message) {
    return null;
  }

  const visualKind = feedbackVisualKind(message.text);

  return (
    <div
      className={`feedback-message feedback-message--${visualKind}`}
      role="status"
      aria-live="polite"
    >
      <LightShardMark className="light-shard-mark--feedback" />
      <span>{message.text}</span>
    </div>
  );
}
