import { useEffect } from "react";
import { useGameStore } from "../state/gameStore";

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

  return (
    <div className="feedback-message" role="status">
      <span className="feedback-spark" aria-hidden="true" />
      {message.text}
    </div>
  );
}
