import type {
  DecorationEntityDefinition,
  InteractionDefinition,
  SignatureDetailDefinition,
  TerrainCellDefinition,
  WorldEntityDefinition,
  WorldMapDefinition,
} from "../types";

function terrainHeight(x: number, z: number): number {
  if (x < -3 && z < -2) {
    return 1;
  }
  if (x > 4 && z > 2) {
    return 0.75;
  }
  if (x > 5 && z < -4) {
    return 0.5;
  }
  return 0;
}

function isStreamCell(x: number, z: number): boolean {
  const streamCenter = Math.sin(z * 0.55) * 1.2 + 2.1;
  return Math.abs(x - streamCenter) < 0.72 && z > -7 && z < 7;
}

function createTerrain(): TerrainCellDefinition[] {
  const cells: TerrainCellDefinition[] = [];

  for (let z = -8; z <= 8; z += 1) {
    for (let x = -8; x <= 8; x += 1) {
      const water = isStreamCell(x, z);
      const pathCenter = Math.sin(z * 0.35) * 1.6 - 2.5;
      const path = Math.abs(x - pathCenter) < 0.72;
      cells.push({
        position: { x, z },
        height: terrainHeight(x, z),
        surface: water ? "water" : path ? "path" : "grass",
        walkable: !water,
      });
    }
  }

  return cells;
}

const decorations: readonly DecorationEntityDefinition[] = [
  {
    id: "old-shrine",
    type: "decoration",
    decorationKind: "shrine",
    position: { x: 0, z: 0 },
    collisionRadius: 1.25,
  },
  ...[
    [-6, -5],
    [-5, 4],
    [6, 5],
    [6, -2],
    [-7, 1],
  ].map(([x, z], index): DecorationEntityDefinition => ({
    id: `tree-${index + 1}`,
    type: "decoration",
    decorationKind: "tree",
    position: { x, z },
    collisionRadius: 0.48,
  })),
  ...[
    [-4, 6],
    [5, -6],
    [7, 1],
    [-6, -1],
  ].map(([x, z], index): DecorationEntityDefinition => ({
    id: `rock-${index + 1}`,
    type: "decoration",
    decorationKind: "rock",
    position: { x, z },
    collisionRadius: 0.42,
  })),
];

const entities: readonly WorldEntityDefinition[] = [
  ...decorations,
  {
    id: "mila",
    type: "npc",
    characterId: "mila",
    position: { x: -4, z: 2.5 },
    facing: Math.PI * 0.75,
    collisionRadius: 0.55,
    dialogueIds: {
      "meet-mila": "mila-introduction",
      "find-spark": "mila-searching",
      "return-to-mila": "mila-return",
      completed: "mila-completed",
    },
  },
  {
    id: "light-spark",
    type: "collectible",
    collectibleId: "light-spark",
    position: { x: -1.8, z: -2.4 },
  },
];

const interactions: readonly InteractionDefinition[] = [
  {
    id: "talk-to-mila",
    type: "dialogue",
    targetId: "mila",
    prompt: "E · Promluvit",
    interactionRadius: 1.85,
    availableStages: ["meet-mila", "find-spark", "return-to-mila", "completed"],
  },
  {
    id: "collect-light-spark",
    type: "collect",
    targetId: "light-spark",
    prompt: "E · Sebrat světelnou jiskru",
    interactionRadius: 1.45,
    availableStages: ["find-spark"],
  },
];

const visualDetails: readonly SignatureDetailDefinition[] = [
  ...[
    [-1.8, 5],
    [-2.2, 2.5],
    [-5, -4],
  ].map(([x, z], index): SignatureDetailDefinition => ({
    id: `path-lantern-${index + 1}`,
    kind: "path-lantern",
    position: { x, z },
  })),
  ...[
    [-3, -3],
    [-1, -4],
    [3, -2],
    [3, 2],
    [1, 4],
  ].map(([x, z], index): SignatureDetailDefinition => ({
    id: `light-flower-${index + 1}`,
    kind: "light-flower",
    position: { x, z },
  })),
  {
    id: "shard-marker-west",
    kind: "shard-marker",
    position: { x: -6, z: 3.5 },
    facing: Math.PI * 0.2,
  },
  {
    id: "shard-marker-south",
    kind: "shard-marker",
    position: { x: 4, z: -4 },
    facing: -Math.PI * 0.25,
  },
  ...[
    [-1.45, 0],
    [1.45, 0],
    [0, -1.45],
    [0, 1.45],
  ].map(([x, z], index): SignatureDetailDefinition => ({
    id: `shrine-paving-${index + 1}`,
    kind: "shrine-paving",
    position: { x, z },
    facing: Math.PI * 0.25,
  })),
];

export const jasnovOutskirts: WorldMapDefinition = {
  id: "jasnov-outskirts",
  name: "Okraj Jasnovy",
  width: 17,
  depth: 17,
  playerSpawn: { x: -6, z: 2.5 },
  terrain: createTerrain(),
  entities,
  interactions,
  visualDetails,
};
