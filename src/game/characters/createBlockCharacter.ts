import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Scene } from "@babylonjs/core/scene";
import type { CharacterAnimationState } from "../core/gameTypes";

function material(name: string, color: string, scene: Scene): StandardMaterial {
  const result = new StandardMaterial(name, scene);
  result.diffuseColor = Color3.FromHexString(color);
  result.specularColor = Color3.Black();
  return result;
}

function part(
  name: string,
  size: { width: number; height: number; depth: number },
  color: StandardMaterial,
  parent: TransformNode,
  scene: Scene,
): AbstractMesh {
  const mesh = MeshBuilder.CreateBox(name, size, scene);
  mesh.material = color;
  mesh.parent = parent;
  return mesh;
}

export interface BlockCharacter {
  root: TransformNode;
  animate: (state: CharacterAnimationState) => void;
}

export function createBlockCharacter(scene: Scene): BlockCharacter {
  const root = new TransformNode("CharacterRoot", scene);
  const bodyMaterial = material("character-cloak", "#355d78", scene);
  const skinMaterial = material("character-skin", "#efc39f", scene);
  const hairMaterial = material("character-hair", "#3d2b35", scene);
  const bootMaterial = material("character-boots", "#4a3740", scene);
  const lampMaterial = material("character-lamp", "#f3c969", scene);
  lampMaterial.emissiveColor = Color3.FromHexString("#d6944d").scale(0.45);

  const body = part(
    "Body",
    { width: 0.72, height: 0.86, depth: 0.42 },
    bodyMaterial,
    root,
    scene,
  );
  body.position.y = 1.15;

  const head = part(
    "Head",
    { width: 0.64, height: 0.64, depth: 0.6 },
    skinMaterial,
    root,
    scene,
  );
  head.position.y = 1.9;

  const hair = part(
    "Hair",
    { width: 0.7, height: 0.24, depth: 0.66 },
    hairMaterial,
    root,
    scene,
  );
  hair.position.y = 2.22;

  const leftArm = part(
    "LeftArm",
    { width: 0.22, height: 0.75, depth: 0.28 },
    bodyMaterial,
    root,
    scene,
  );
  leftArm.position.set(-0.5, 1.17, 0);
  leftArm.setPivotPoint(new Vector3(0, 0.32, 0));

  const rightArm = part(
    "RightArm",
    { width: 0.22, height: 0.75, depth: 0.28 },
    bodyMaterial,
    root,
    scene,
  );
  rightArm.position.set(0.5, 1.17, 0);
  rightArm.setPivotPoint(new Vector3(0, 0.32, 0));

  const leftLeg = part(
    "LeftLeg",
    { width: 0.27, height: 0.62, depth: 0.32 },
    bootMaterial,
    root,
    scene,
  );
  leftLeg.position.set(-0.2, 0.42, 0);
  leftLeg.setPivotPoint(new Vector3(0, 0.26, 0));

  const rightLeg = part(
    "RightLeg",
    { width: 0.27, height: 0.62, depth: 0.32 },
    bootMaterial,
    root,
    scene,
  );
  rightLeg.position.set(0.2, 0.42, 0);
  rightLeg.setPivotPoint(new Vector3(0, 0.26, 0));

  const lamp = part(
    "TravelLamp",
    { width: 0.22, height: 0.28, depth: 0.18 },
    lampMaterial,
    root,
    scene,
  );
  lamp.position.set(0.55, 0.8, 0.08);

  return {
    root,
    animate: ({ elapsedSeconds, isMoving }) => {
      const stride = isMoving ? Math.sin(elapsedSeconds * 10) * 0.58 : 0;
      leftLeg.rotation.x = stride;
      rightLeg.rotation.x = -stride;
      leftArm.rotation.x = -stride * 0.72;
      rightArm.rotation.x = stride * 0.72;
      body.position.y = 1.15 + Math.sin(elapsedSeconds * (isMoving ? 10 : 2.4)) * 0.025;
      head.rotation.z = isMoving ? 0 : Math.sin(elapsedSeconds * 1.4) * 0.025;
    },
  };
}
