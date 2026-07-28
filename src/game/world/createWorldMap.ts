import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Observer } from "@babylonjs/core/Misc/observable";
import type { Scene } from "@babylonjs/core/scene";
import type { DecorationEntityDefinition, WorldMapDefinition } from "../../content/types";
import { findTerrainCell } from "./mapCollision";

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

function createInstanceGroup(
  kind: BlockKind,
  blocks: readonly Block[],
  scene: Scene,
): TransformNode {
  const group = new TransformNode(`${kind}-group`, scene);
  const source = MeshBuilder.CreateBox(`${kind}-blocks`, { size: 1 }, scene);
  source.material = createMaterial(kind, scene);
  source.receiveShadows = kind !== "water";

  blocks.forEach((block, index) => {
    const mesh = index === 0 ? source : source.createInstance(`${kind}-${index}`);
    mesh.position.copyFrom(block.position);
    mesh.scaling.copyFrom(block.scaling ?? Vector3.One());
    mesh.parent = group;
  });

  return group;
}

function addTree(blocks: Block[], entity: DecorationEntityDefinition, y: number): void {
  const { x, z } = entity.position;
  blocks.push({
    kind: "wood",
    position: new Vector3(x, y + 0.7, z),
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
      position: new Vector3(x + offsetX, y + offsetY, z + offsetZ),
      scaling: new Vector3(0.9, 0.8, 0.9),
    });
  }
}

function createShrine(
  scene: Scene,
  entity: DecorationEntityDefinition,
  y: number,
): { root: TransformNode; observer: Observer<Scene> } {
  const root = new TransformNode(entity.id, scene);
  root.position.set(entity.position.x, y + 0.08, entity.position.z);

  const stone = new StandardMaterial(`${entity.id}-stone`, scene);
  stone.diffuseColor = Color3.FromHexString("#a9a2ad");
  stone.specularColor = Color3.Black();

  const base = MeshBuilder.CreateCylinder(
    `${entity.id}-base`,
    { height: 0.35, diameter: 2.4, tessellation: 8 },
    scene,
  );
  base.material = stone;
  base.position.y = 0.18;
  base.parent = root;

  const pedestal = MeshBuilder.CreateCylinder(
    `${entity.id}-pedestal`,
    { height: 0.75, diameterTop: 0.7, diameterBottom: 1.05, tessellation: 8 },
    scene,
  );
  pedestal.material = stone;
  pedestal.position.y = 0.7;
  pedestal.parent = root;

  const crystalMaterial = new StandardMaterial(`${entity.id}-crystal`, scene);
  crystalMaterial.diffuseColor = Color3.FromHexString("#a7e7dc");
  crystalMaterial.emissiveColor = Color3.FromHexString("#79d9d1").scale(0.8);
  crystalMaterial.alpha = 0.9;

  const crystal = MeshBuilder.CreatePolyhedron(
    `${entity.id}-crystal-mesh`,
    { type: 1, size: 0.72 },
    scene,
  );
  crystal.material = crystalMaterial;
  crystal.position.y = 1.65;
  crystal.scaling.y = 1.35;
  crystal.parent = root;

  const observer = scene.onBeforeRenderObservable.add(() => {
    const time = performance.now() * 0.001;
    crystal.position.y = 1.65 + Math.sin(time * 1.4) * 0.1;
    crystal.rotation.y = time * 0.35;
  });

  return { root, observer };
}

export interface RenderedWorldMap {
  root: TransformNode;
  water: TransformNode | null;
  dispose: () => void;
}

export function createWorldMap(scene: Scene, map: WorldMapDefinition): RenderedWorldMap {
  const root = new TransformNode(`${map.id}-world`, scene);
  const blocksByKind = new Map<BlockKind, Block[]>();
  const shrineObservers: Observer<Scene>[] = [];
  const push = (block: Block): void => {
    const blocks = blocksByKind.get(block.kind) ?? [];
    blocks.push(block);
    blocksByKind.set(block.kind, blocks);
  };

  map.terrain.forEach((cell) => {
    push({
      kind: "dirt",
      position: new Vector3(cell.position.x, cell.height - 0.75, cell.position.z),
    });
    push({
      kind: cell.surface,
      position: new Vector3(
        cell.position.x,
        cell.surface === "water" ? -0.17 : cell.height - 0.08,
        cell.position.z,
      ),
      scaling: new Vector3(0.96, 0.16, 0.96),
    });
  });

  map.entities
    .filter(
      (entity): entity is DecorationEntityDefinition => entity.type === "decoration",
    )
    .forEach((entity) => {
      const y = findTerrainCell(map, entity.position)?.height ?? 0;
      if (entity.decorationKind === "tree") {
        const decorationBlocks: Block[] = [];
        addTree(decorationBlocks, entity, y);
        decorationBlocks.forEach(push);
      } else if (entity.decorationKind === "rock") {
        push({
          kind: "stone",
          position: new Vector3(entity.position.x, y + 0.22, entity.position.z),
          scaling: new Vector3(0.55, 0.42, 0.7),
        });
      } else {
        const shrine = createShrine(scene, entity, y);
        shrine.root.parent = root;
        shrineObservers.push(shrine.observer);
      }
    });

  let water: TransformNode | null = null;
  blocksByKind.forEach((blocks, kind) => {
    const group = createInstanceGroup(kind, blocks, scene);
    group.parent = root;
    if (kind === "water") {
      water = group;
    }
  });

  return {
    root,
    water,
    dispose: () => {
      shrineObservers.forEach((observer) =>
        scene.onBeforeRenderObservable.remove(observer),
      );
    },
  };
}
