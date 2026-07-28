import { describe, expect, it } from "vitest";
import { resolveCharacterRendererMode } from "./characterRendererMode";

describe("resolveCharacterRendererMode", () => {
  it("uses sprite rendering by default", () => {
    expect(resolveCharacterRendererMode(undefined, true)).toBe("sprite");
    expect(resolveCharacterRendererMode("sprite", true)).toBe("sprite");
  });

  it("allows the blocky comparison renderer only in development", () => {
    expect(resolveCharacterRendererMode("blocky", true)).toBe("blocky");
    expect(resolveCharacterRendererMode("blocky", false)).toBe("sprite");
  });
});
