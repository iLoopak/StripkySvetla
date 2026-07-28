import { describe, expect, it } from "vitest";
import { feedbackVisualKind, parseInteractionPrompt } from "./uiVisuals";

describe("UI visual helpers", () => {
  it("turns interaction copy into a keycap and action label", () => {
    expect(parseInteractionPrompt("E · Promluvit")).toEqual({
      key: "E",
      label: "Promluvit",
    });
    expect(parseInteractionPrompt("E · Sebrat světelnou jiskru")).toEqual({
      key: "E",
      label: "Sebrat světelnou jiskru",
    });
  });

  it("returns only supported feedback variants", () => {
    expect(feedbackVisualKind("Nový cíl")).toBe("objective");
    expect(feedbackVisualKind("Získána světelná jiskra")).toBe("collectible");
    expect(feedbackVisualKind("Wave 1 dokončena")).toBe("completion");
  });
});
