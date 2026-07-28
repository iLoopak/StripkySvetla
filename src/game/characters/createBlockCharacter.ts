import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { CharacterAccessory, CharacterDefinition } from "../../content/types";
import type { CharacterAnimationState } from "../core/gameTypes";

function material(
  name: string,
  color: string,
  scene: Scene,
  emissiveStrength = 0,
): StandardMaterial {
  const result = new StandardMaterial(name, scene);
  result.diffuseColor = Color3.FromHexString(color);
  result.specularColor = Color3.Black();
  result.emissiveColor = Color3.FromHexString(color).scale(emissiveStrength);
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

interface AnimatedAccessories {
  pendant: TransformNode | null;
  scarfTail: AbstractMesh | null;
}

function addCourierHair(
  instanceName: string,
  headY: number,
  headSize: number,
  hairMaterial: StandardMaterial,
  root: TransformNode,
  scene: Scene,
): void {
  const cap = part(
    `${instanceName}-HairCap`,
    { width: headSize + 0.1, height: 0.24, depth: headSize + 0.11 },
    hairMaterial,
    root,
    scene,
  );
  cap.position.y = headY + headSize * 0.42;

  const hoodBack = part(
    `${instanceName}-HoodBack`,
    { width: headSize + 0.13, height: 0.42, depth: 0.18 },
    hairMaterial,
    root,
    scene,
  );
  hoodBack.position.set(0, headY + 0.05, headSize * 0.5);

  [-0.2, 0.16].forEach((x, index) => {
    const fringe = part(
      `${instanceName}-Fringe-${index}`,
      { width: 0.24, height: index === 0 ? 0.22 : 0.16, depth: 0.11 },
      hairMaterial,
      root,
      scene,
    );
    fringe.position.set(x, headY + 0.2, -headSize * 0.52);
  });
}

function addFestivalHair(
  instanceName: string,
  headY: number,
  headSize: number,
  hairMaterial: StandardMaterial,
  accentMaterial: StandardMaterial,
  root: TransformNode,
  scene: Scene,
): void {
  const hair = part(
    `${instanceName}-HairCap`,
    { width: headSize + 0.08, height: 0.25, depth: headSize + 0.08 },
    hairMaterial,
    root,
    scene,
  );
  hair.position.y = headY + headSize * 0.42;

  const bun = part(
    `${instanceName}-HairBun`,
    { width: 0.42, height: 0.42, depth: 0.42 },
    hairMaterial,
    root,
    scene,
  );
  bun.position.set(0.23, headY + 0.42, headSize * 0.42);

  const ribbon = part(
    `${instanceName}-HairRibbon`,
    { width: 0.48, height: 0.1, depth: 0.13 },
    accentMaterial,
    root,
    scene,
  );
  ribbon.position.set(0.23, headY + 0.44, headSize * 0.62);
  ribbon.rotation.z = -0.18;
}

function addAccessory(
  accessory: CharacterAccessory,
  definition: CharacterDefinition,
  instanceName: string,
  bodyY: number,
  bodyMaterial: StandardMaterial,
  secondaryMaterial: StandardMaterial,
  accentMaterial: StandardMaterial,
  root: TransformNode,
  scene: Scene,
  animated: AnimatedAccessories,
): void {
  if (accessory === "scarf") {
    const collar = part(
      `${instanceName}-ScarfCollar`,
      {
        width: definition.proportions.bodyWidth + 0.12,
        height: 0.16,
        depth: 0.54,
      },
      secondaryMaterial,
      root,
      scene,
    );
    collar.position.y = bodyY + definition.proportions.bodyHeight * 0.44;

    const tail = part(
      `${instanceName}-ScarfTail`,
      { width: 0.2, height: 0.58, depth: 0.12 },
      secondaryMaterial,
      root,
      scene,
    );
    tail.position.set(0.28, bodyY + 0.05, 0.33);
    tail.rotation.x = -0.18;
    animated.scarfTail = tail;
    return;
  }

  if (accessory === "light-pendant") {
    const pendant = new TransformNode(`${instanceName}-LightPendant`, scene);
    pendant.parent = root;
    pendant.position.set(0, bodyY + 0.08, -0.32);

    const frame = part(
      `${instanceName}-PendantFrame`,
      { width: 0.26, height: 0.34, depth: 0.12 },
      bodyMaterial,
      pendant,
      scene,
    );
    frame.rotation.z = Math.PI * 0.25;

    const light = part(
      `${instanceName}-PendantLight`,
      { width: 0.15, height: 0.2, depth: 0.14 },
      accentMaterial,
      pendant,
      scene,
    );
    light.rotation.z = Math.PI * 0.25;
    animated.pendant = pendant;
    return;
  }

  if (accessory === "sash") {
    const sash = part(
      `${instanceName}-FestivalSash`,
      {
        width: 0.16,
        height: definition.proportions.bodyHeight + 0.1,
        depth: 0.08,
      },
      accentMaterial,
      root,
      scene,
    );
    sash.position.set(0.04, bodyY, -0.3);
    sash.rotation.z = 0.52;
    return;
  }

  const brooch = part(
    `${instanceName}-FestivalBrooch`,
    { width: 0.18, height: 0.18, depth: 0.12 },
    accentMaterial,
    root,
    scene,
  );
  brooch.position.set(-0.29, bodyY + 0.28, -0.36);
  brooch.rotation.z = Math.PI * 0.25;
}

export interface BlockCharacter {
  root: TransformNode;
  animate: (state: CharacterAnimationState) => void;
}

export function createBlockCharacter(
  scene: Scene,
  definition: CharacterDefinition,
  instanceName = definition.id,
): BlockCharacter {
  const root = new TransformNode(`${instanceName}-CharacterRoot`, scene);
  const bodyMaterial = material(
    `${instanceName}-primary`,
    definition.palette.primary,
    scene,
  );
  const secondaryMaterial = material(
    `${instanceName}-secondary`,
    definition.palette.secondary,
    scene,
  );
  const skinMaterial = material(`${instanceName}-skin`, definition.palette.skin, scene);
  const hairMaterial = material(`${instanceName}-hair`, definition.palette.hair, scene);
  const bootMaterial = material(`${instanceName}-boots`, definition.palette.boots, scene);
  const accentMaterial = material(
    `${instanceName}-accent`,
    definition.palette.accent,
    scene,
    definition.accessories.includes("light-pendant") ? 0.62 : 0.16,
  );
  const { proportions } = definition;
  const bodyY = proportions.legHeight + proportions.bodyHeight * 0.5 + 0.05;
  const headY =
    proportions.legHeight + proportions.bodyHeight + proportions.headSize * 0.5 + 0.12;

  const body = part(
    `${instanceName}-Body`,
    {
      width: proportions.bodyWidth,
      height: proportions.bodyHeight,
      depth: 0.5,
    },
    bodyMaterial,
    root,
    scene,
  );
  body.position.y = bodyY;

  if (definition.outfitStyle === "courier-tunic") {
    const tunicHem = part(
      `${instanceName}-TunicHem`,
      {
        width: proportions.bodyWidth + 0.08,
        height: 0.28,
        depth: 0.54,
      },
      secondaryMaterial,
      root,
      scene,
    );
    tunicHem.position.y = bodyY - proportions.bodyHeight * 0.38;
  } else {
    const festivalWrap = part(
      `${instanceName}-FestivalWrap`,
      {
        width: proportions.bodyWidth + 0.18,
        height: 0.23,
        depth: 0.58,
      },
      secondaryMaterial,
      root,
      scene,
    );
    festivalWrap.position.y = bodyY + proportions.bodyHeight * 0.34;

    const coatHem = part(
      `${instanceName}-CoatHem`,
      {
        width: proportions.bodyWidth + 0.08,
        height: 0.32,
        depth: 0.53,
      },
      secondaryMaterial,
      root,
      scene,
    );
    coatHem.position.y = bodyY - proportions.bodyHeight * 0.35;
  }

  const head = part(
    `${instanceName}-Head`,
    {
      width: proportions.headSize,
      height: proportions.headSize,
      depth: proportions.headSize * 0.94,
    },
    skinMaterial,
    root,
    scene,
  );
  head.position.y = headY;

  if (definition.hairStyle === "courier-hood") {
    addCourierHair(instanceName, headY, proportions.headSize, hairMaterial, root, scene);
  } else {
    addFestivalHair(
      instanceName,
      headY,
      proportions.headSize,
      hairMaterial,
      accentMaterial,
      root,
      scene,
    );
  }

  const leftArm = part(
    `${instanceName}-LeftArm`,
    { width: 0.25, height: proportions.armLength, depth: 0.3 },
    bodyMaterial,
    root,
    scene,
  );
  leftArm.position.set(
    -proportions.bodyWidth * 0.68,
    bodyY + proportions.bodyHeight * 0.04,
    0,
  );
  leftArm.setPivotPoint(new Vector3(0, proportions.armLength * 0.42, 0));

  const rightArm = part(
    `${instanceName}-RightArm`,
    { width: 0.25, height: proportions.armLength, depth: 0.3 },
    bodyMaterial,
    root,
    scene,
  );
  rightArm.position.set(
    proportions.bodyWidth * 0.68,
    bodyY + proportions.bodyHeight * 0.04,
    0,
  );
  rightArm.setPivotPoint(new Vector3(0, proportions.armLength * 0.42, 0));

  const leftLeg = part(
    `${instanceName}-LeftLeg`,
    {
      width: 0.31,
      height: proportions.legHeight,
      depth: proportions.footDepth,
    },
    bootMaterial,
    root,
    scene,
  );
  leftLeg.position.set(-0.2, proportions.legHeight * 0.5, -0.04);
  leftLeg.setPivotPoint(new Vector3(0, proportions.legHeight * 0.42, 0.08));

  const rightLeg = part(
    `${instanceName}-RightLeg`,
    {
      width: 0.31,
      height: proportions.legHeight,
      depth: proportions.footDepth,
    },
    bootMaterial,
    root,
    scene,
  );
  rightLeg.position.set(0.2, proportions.legHeight * 0.5, -0.04);
  rightLeg.setPivotPoint(new Vector3(0, proportions.legHeight * 0.42, 0.08));

  const animated: AnimatedAccessories = {
    pendant: null,
    scarfTail: null,
  };
  definition.accessories.forEach((accessory) =>
    addAccessory(
      accessory,
      definition,
      instanceName,
      bodyY,
      bodyMaterial,
      secondaryMaterial,
      accentMaterial,
      root,
      scene,
      animated,
    ),
  );

  return {
    root,
    animate: ({ elapsedSeconds, isMoving }) => {
      const stride = isMoving ? Math.sin(elapsedSeconds * 10) * 0.62 : 0;
      const idle = Math.sin(elapsedSeconds * 2.15);
      const stewardGesture =
        definition.outfitStyle === "festival-steward" && !isMoving
          ? Math.sin(elapsedSeconds * 1.35) * 0.055
          : 0;

      leftLeg.rotation.x = stride;
      rightLeg.rotation.x = -stride;
      leftArm.rotation.x = -stride * 0.76 + stewardGesture;
      rightArm.rotation.x = stride * 0.76 - stewardGesture;
      body.position.y = bodyY + idle * (isMoving ? 0.035 : 0.018);
      head.position.y = headY + idle * 0.012;
      head.rotation.z = isMoving ? 0 : Math.sin(elapsedSeconds * 1.25) * 0.018;

      if (animated.pendant) {
        animated.pendant.rotation.z =
          Math.sin(elapsedSeconds * (isMoving ? 7 : 1.8)) * (isMoving ? 0.1 : 0.035);
      }
      if (animated.scarfTail) {
        animated.scarfTail.rotation.x =
          -0.18 + Math.sin(elapsedSeconds * (isMoving ? 8 : 1.6)) * 0.055;
      }
    },
  };
}
