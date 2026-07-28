import { describe, expect, it } from "vitest";
import { milaCharacter, playerCharacter } from "./characters";
import {
  characterVisualSignature,
  validateCharacterVisual,
} from "./characterVisualConfig";

describe("character visual configuration", () => {
  it("keeps required visual fields valid", () => {
    expect(validateCharacterVisual(playerCharacter)).toEqual([]);
    expect(validateCharacterVisual(milaCharacter)).toEqual([]);
  });

  it("gives the player and Mila distinct visual identities", () => {
    expect(characterVisualSignature(playerCharacter)).not.toBe(
      characterVisualSignature(milaCharacter),
    );
    expect(playerCharacter.accessories).toContain("light-pendant");
    expect(milaCharacter.outfitStyle).toBe("festival-steward");
  });
});
