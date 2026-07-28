import type { CharacterDefinition } from "../types";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function validateCharacterVisual(
  definition: CharacterDefinition,
): readonly string[] {
  const errors: string[] = [];
  const colors = Object.entries(definition.palette);

  if (!definition.id || !definition.displayName) {
    errors.push("Character identity fields are required.");
  }
  if (colors.some(([, color]) => !HEX_COLOR.test(color))) {
    errors.push("Character palette values must use six-digit hex colors.");
  }
  if (Object.values(definition.proportions).some((value) => value <= 0)) {
    errors.push("Character proportions must be positive.");
  }
  if (
    !definition.sprite.assetPath.startsWith("/assets/characters/") ||
    !definition.sprite.assetPath.endsWith(".png")
  ) {
    errors.push("Character sprites must use a project-local PNG asset.");
  }
  if (
    !Number.isInteger(definition.sprite.pixelWidth) ||
    !Number.isInteger(definition.sprite.pixelHeight) ||
    definition.sprite.pixelWidth <= 0 ||
    definition.sprite.pixelHeight <= 0 ||
    definition.sprite.worldHeight <= 0
  ) {
    errors.push("Character sprite dimensions must be positive.");
  }
  if (
    new Set(definition.accessories).size !== definition.accessories.length ||
    definition.accessories.length > 2
  ) {
    errors.push("Characters must use no more than two unique signature accessories.");
  }

  return errors;
}

export function characterVisualSignature(definition: CharacterDefinition): string {
  return [
    definition.hairStyle,
    definition.outfitStyle,
    ...definition.accessories,
    definition.sprite.assetPath,
    definition.palette.primary,
    definition.palette.accent,
  ].join("|");
}
