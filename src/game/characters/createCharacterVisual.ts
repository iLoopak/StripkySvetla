import type { Scene } from "@babylonjs/core/scene";
import type { CharacterDefinition } from "../../content/types";
import { createBlockCharacter } from "./createBlockCharacter";
import {
  characterRendererMode,
  type CharacterRendererMode,
} from "./characterRendererMode";
import type { CharacterVisual } from "./characterVisualTypes";
import { createSpriteCharacter } from "./createSpriteCharacter";

export function createCharacterVisual(
  scene: Scene,
  definition: CharacterDefinition,
  instanceName = definition.id,
  rendererMode: CharacterRendererMode = characterRendererMode,
): CharacterVisual {
  return rendererMode === "blocky" && (definition.kind ?? "humanoid") === "humanoid"
    ? createBlockCharacter(scene, definition, instanceName)
    : createSpriteCharacter(scene, definition, instanceName);
}
