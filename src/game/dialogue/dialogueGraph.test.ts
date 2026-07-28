import { describe, expect, it } from "vitest";
import { storyDialogues } from "../../content/dialogues/wave1Dialogues";
import type { DialogueDefinition } from "../../content/types";
import { validateDialogueGraph } from "./dialogueGraph";

describe("dialogue graph validation", () => {
  it("accepts all authored story dialogues", () => {
    storyDialogues.forEach((dialogue) => {
      expect(validateDialogueGraph(dialogue)).toEqual([]);
    });
  });

  it("reports missing links and duplicate choices", () => {
    const invalid: DialogueDefinition = {
      id: "invalid",
      speakerName: "Test",
      startNodeId: "start",
      nodes: [
        {
          id: "start",
          text: "Choose.",
          choices: [
            { id: "same", text: "A", next: "missing" },
            { id: "same", text: "B", next: "missing" },
          ],
        },
      ],
    };

    const errors = validateDialogueGraph(invalid);
    expect(errors.some((error) => error.includes("missing node"))).toBe(true);
    expect(errors.some((error) => error.includes("Duplicate choice"))).toBe(true);
    expect(errors.some((error) => error.includes("reachable terminal"))).toBe(true);
  });
});
