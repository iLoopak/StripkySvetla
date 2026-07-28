import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import { getTerrainHeight, isWaterPosition } from "./terrain";

type BlockKind = "grass" | "dirt" | "path" | "water" | "stone" | "wood" | "leaves";

interface Block {
  kind: BlockKind;
  position: Vector3;
  scaling?: Vector3;
}

const COLORS: Record<BlockKind, Color3> = {
  grass: Color3.FromHexString("#6f9b65"),
  dirt: Color3.FromHexString("#795943"),
  path: Color3.FromHexString("#b39a6b"),
  water: Color3.FromHexString("#4f9aa5"),
  stone: Color3.FromHexString("#7e8291"),
  wood: Color3.FromHexString("#6c4a35"),
  leaves: Color3.FromHexString("#3f7558"),
};

function createMaterial(kind: BlockKind, scene: Scene): StandardMaterial {
  const material = new StandardMaterial(`${kind}-material`, scene);
  material.diffuseColor = COLORS[kind];
  material.specularColor = Color3.Black();

  if (kind === "water") {
    material.alpha = 0.72;
    material.emissiveColor = COLORS.water.scale(0.18);
  }

  return material;
}

function addTree(blocks: Block[], x: number, z: number, height: number): void {
  blocks.push({
    kind: "wood",
    position: new Vector3(x, height + 0.7, z),
    scaling: new Vector3(0.45, 1.4, 0.45),
  });

  for (const [offsetX, offsetY, offsetZ] of [
    [0, 1.65, 0],
    [-0.55, 1.35, 0],
    [0.55, 1.35, 0],
    [0, 1.35, -0.55],
    [0, 1.35, 0.55],
  ]) {
    blocks.push({
      kind: "leaves",
      position: new Vector3(x + offsetX, height + offsetY, z + offsetZ),
      scaling: new Vector3(0.9, 0.8, 0.9),
    });
  }
}

function addRock(blocks: Block[], x: number, z: number): void {
  const height = getTerrainHeight(x, z);
  blocks.push({
    kind: "stone",
    position: new Vector3(x, height + 0.22, z),
    scaling: new Vector3(0.55, 0.42, 0.7),
  });
}

function createInstanceGroup(
  kind: BlockKind,
  blocks: Block[],
  scene: Scene,
): TransformNode {
  const group = new TransformNode(`${kind}-group`, scene);
  const source = MeshBuilder.CreateBox(`${kind}-blocks`, { size: 1 }, scene);
  source.material = createMaterial(kind, scene);
  source.receiveShadows = kind !== "water";
  source.parent = group;

  blocks.forEach((block, index) => {
    const mesh = index === 0 ? source : source.createInstance(`${kind}-${index}`);
    mesh.position.copyFrom(block.position);
    mesh.scaling.copyFrom(block.scaling ?? Vector3.One());
    mesh.parent = group;
  });

  return group;
}

export interface Diorama {
  root: TransformNode;
  water: TransformNode | null;
}

export function createVoxelDiorama(scene: Scene): Diorama {
  const root = new TransformNode("VoxelDiorama", scene);
  const blocksByKind = new Map<BlockKind, Block[]>();
  const push = (block: Block): void => {
    const blocks = blocksByKind.get(block.kind) ?? [];
    blocks.push(block);
    blocksByKind.set(block.kind, blocks);
  };

  for (let z = -8; z <= 8; z += 1) {
    for (let x = -8; x <= 8; x += 1) {
      const terrainHeight = getTerrainHeight(x, z);
      const water = isWaterPosition(x, z);
      const pathCenter = Math.sin(z * 0.35) * 1.6 - 2.5;
      const path = Math.abs(x - pathCenter) < 0.72;

      push({
        kind: "dirt",
        position: new Vector3(x, terrainHeight - 0.75, z),
      });
      push({
        kind: water ? "water" : path ? "path" : "grass",
        position: new Vector3(x, water ? -0.17 : terrainHeight - 0.08, z),
        scaling: new Vector3(0.96, water ? 0.16 : 0.16, 0.96),
      });
    }
  }

  const decorationBlocks: Block[] = [];
  for (const [x, z] of [
    [-6, -5],
    [-5, 4],
    [6, 5],
    [6, -2],
    [-7, 1],
  ]) {
    addTree(decorationBlocks, x, z, getTerrainHeight(x, z));
  }
  for (const [x, z] of [
    [-4, 6],
    [5, -6],
    [7, 1],
    [-6, -1],
  ]) {
    addRock(decorationBlocks, x, z);
  }
  decorationBlocks.forEach(push);

  let waterMesh: TransformNode | null = null;
  blocksByKind.forEach((blocks, kind) => {
    const mesh = createInstanceGroup(kind, blocks, scene);
    mesh.parent = root;
    if (kind === "water") {
      waterMesh = mesh;
    }
  });

  return { root, water: waterMesh };
}
