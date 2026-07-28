import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  milaCharacter,
  playerCharacter,
  pukCharacter,
  renaCharacter,
  spuntCharacter,
} from "./characters";
import {
  characterVisualSignature,
  validateCharacterVisual,
} from "./characterVisualConfig";

describe("character visual configuration", () => {
  it("keeps required visual fields valid", () => {
    [playerCharacter, milaCharacter, pukCharacter, renaCharacter, spuntCharacter].forEach(
      (character) => {
        expect(validateCharacterVisual(character)).toEqual([]);
      },
    );
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

  it("gives every Wave 2 character a unique project-owned sprite identity", () => {
    const wave2Characters = [pukCharacter, renaCharacter, spuntCharacter];
    const signatures = wave2Characters.map(characterVisualSignature);
    expect(new Set(signatures).size).toBe(wave2Characters.length);

    wave2Characters.forEach((character) => {
      const assetUrl = new URL(
        `../../../public${character.sprite.assetPath}`,
        import.meta.url,
      );
      const path = fileURLToPath(assetUrl);
      expect(existsSync(path)).toBe(true);
      const png = readFileSync(path);
      expect(png.readUInt32BE(16)).toBe(character.sprite.pixelWidth);
      expect(png.readUInt32BE(20)).toBe(character.sprite.pixelHeight);
    });
  });

  it("keeps Rena humanoid and the two non-humanoids distinct", () => {
    expect(renaCharacter.sprite.pixelWidth).toBe(64);
    expect(renaCharacter.sprite.pixelHeight).toBe(96);
    expect(pukCharacter.kind).toBe("spirit");
    expect(spuntCharacter.kind).toBe("creature");
    expect(pukCharacter.sprite.worldHeight).toBeLessThan(
      playerCharacter.sprite.worldHeight,
    );
  });
});
