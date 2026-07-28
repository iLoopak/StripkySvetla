import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import { pukCharacter } from "../../content/characters/characters";
import { createCharacterVisual } from "../characters/createCharacterVisual";

export interface PukFollower {
  root: TransformNode;
  update: (elapsedSeconds: number, deltaSeconds: number) => void;
  dispose: () => void;
}

export function followerSmoothingFactor(deltaSeconds: number): number {
  return 1 - Math.exp(-Math.max(0, deltaSeconds) * 4.5);
}

export function createPukFollower(scene: Scene, playerRoot: TransformNode): PukFollower {
  const visual = createCharacterVisual(scene, pukCharacter, "puk-follower");
  visual.root.position.copyFrom(playerRoot.position);
  visual.root.position.addInPlace(new Vector3(-0.8, 1.35, 0.55));

  return {
    root: visual.root,
    update: (elapsedSeconds, deltaSeconds) => {
      const target = new Vector3(
        playerRoot.position.x - 0.78,
        playerRoot.position.y + 1.28 + Math.sin(elapsedSeconds * 2.1) * 0.11,
        playerRoot.position.z + 0.55,
      );
      const smoothing = followerSmoothingFactor(deltaSeconds);
      Vector3.LerpToRef(visual.root.position, target, smoothing, visual.root.position);
      visual.root.rotation.z = Math.sin(elapsedSeconds * 1.7) * 0.06;
      visual.animate({ elapsedSeconds, isMoving: false, facing: "right" });
    },
    dispose: () => visual.dispose?.(),
  };
}
