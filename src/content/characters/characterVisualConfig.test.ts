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
    expect(playerCharacter.sprite.assetPath).not.toBe(milaCharacter.sprite.assetPath);
    expect(playerCharacter.accessories).toContain("light-pendant");
    expect(milaCharacter.outfitStyle).toBe("festival-steward");
  });

  it("keeps sprite assets small, local, and baseline-compatible", () => {
    [playerCharacter, milaCharacter].forEach((character) => {
      expect(character.sprite.assetPath).toMatch(/^\/assets\/characters\/.+\.png$/);
      expect(character.sprite.pixelWidth).toBe(64);
      expect(character.sprite.pixelHeight).toBe(96);
      expect(character.sprite.worldHeight).toBeGreaterThan(0);
    });
  });
});
