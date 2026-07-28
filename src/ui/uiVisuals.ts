export type FeedbackVisualKind = "objective" | "collectible" | "completion";

export interface ParsedInteractionPrompt {
  key: string;
  label: string;
}

export function parseInteractionPrompt(prompt: string): ParsedInteractionPrompt {
  const [key = "E", ...labelParts] = prompt.trim().split(/\s+/);
  const label = labelParts.join(" ").replace(/^[·•]\s*/, "");
  return {
    key: key.slice(0, 1).toUpperCase(),
    label: label || prompt,
  };
}

export function feedbackVisualKind(message: string): FeedbackVisualKind {
  if (message.includes("dokončena")) {
    return "completion";
  }
  if (message.includes("jiskra")) {
    return "collectible";
  }
  return "objective";
}
