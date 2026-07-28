import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { CharacterAnimationState } from "../core/gameTypes";

export interface CharacterVisual {
  root: TransformNode;
  animate: (state: CharacterAnimationState) => void;
}
