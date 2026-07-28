import type {
  DecorationEntityDefinition,
  InteractionDefinition,
  SignatureDetailDefinition,
  TerrainCellDefinition,
  WorldEntityDefinition,
  WorldMapDefinition,
} from "../types";

function createTerrain(): TerrainCellDefinition[] {
  const cells: TerrainCellDefinition[] = [];
  for (let z = -8; z <= 8; z += 1) {
    for (let x = -9; x <= 9; x += 1) {
      const arrivalPath = Math.abs(x) <= 1 && z >= 3;
      const forestPath = Math.abs(x - 2) <= 1 && z <= -2;
      const square = Math.hypot(x, z - 1) <= 4.2;
      cells.push({
        position: { x, z },
        height: x <= -7 ? 0.5 : 0,
        surface: arrivalPath || forestPath || square ? "path" : "grass",
        walkable: true,
      });
    }
  }
  return cells;
}

const decorations: readonly DecorationEntityDefinition[] = [
  {
    id: "festival-storehouse",
    type: "decoration",
    decorationKind: "storehouse",
    position: { x: -6.2, z: -0.5 },
    collisionRadius: 1.35,
  },
  {
    id: "west-stall",
    type: "decoration",
    decorationKind: "festival-stall",
    position: { x: -4, z: 4.4 },
    collisionRadius: 0.8,
  },
  {
    id: "east-stall",
    type: "decoration",
    decorationKind: "festival-stall",
    position: { x: 4, z: 3.8 },
    collisionRadius: 0.8,
  },
  ...[
    [-6, 2],
    [-5, 2.6],
    [5.7, 1.8],
    [6.5, 1.2],
  ].map(([x, z], index): DecorationEntityDefinition => ({
    id: `festival-crate-${index + 1}`,
    type: "decoration",
    decorationKind: "crate",
    position: { x, z },
    collisionRadius: 0.36,
  })),
  {
    id: "spunt-pen",
    type: "decoration",
    decorationKind: "pen",
    position: { x: -7, z: 4.8 },
  },
  {
    id: "ribbon-clue",
    type: "decoration",
    decorationKind: "clue-marker",
    position: { x: -5.1, z: -2.1 },
  },
  {
    id: "forest-gate",
    type: "decoration",
    decorationKind: "forest-gate",
    position: { x: 2, z: -7.2 },
    collisionRadius: 0.7,
  },
  ...[
    [-8, -6],
    [-7, 7],
    [8, -5],
    [7, 6],
  ].map(([x, z], index): DecorationEntityDefinition => ({
    id: `square-tree-${index + 1}`,
    type: "decoration",
    decorationKind: "tree",
    position: { x, z },
    collisionRadius: 0.48,
  })),
];

const entities: readonly WorldEntityDefinition[] = [
  ...decorations,
  {
    id: "rena",
    type: "npc",
    characterId: "rena",
    position: { x: -3.8, z: -0.3 },
    facing: Math.PI * 0.5,
    collisionRadius: 0.55,
    dialogueIds: {
      "deliver-to-rena": "rena-delivery",
    },
  },
  {
    id: "spunt-storage",
    type: "npc",
    characterId: "spunt",
    position: { x: -6.6, z: -2.5 },
    facing: Math.PI * 0.5,
    dialogueIds: {
      "confront-spunt": "spunt-confrontation",
    },
    conditions: [{ stage: "confront-spunt" }],
  },
  {
    id: "spunt-pen-occupant",
    type: "npc",
    characterId: "spunt",
    position: { x: -7, z: 4.8 },
    facing: -Math.PI * 0.5,
    dialogueIds: {},
    conditions: [{ spuntOutcome: "handed-over" }],
  },
  {
    id: "spunt-at-gate",
    type: "npc",
    characterId: "spunt",
    position: { x: 1.2, z: -6.3 },
    facing: Math.PI,
    dialogueIds: {},
    conditions: [{ stage: "reach-forest-gate" }, { spuntOutcome: "protected" }],
  },
];

const interactions: readonly InteractionDefinition[] = [
  {
    id: "deliver-festival-list",
    type: "dialogue",
    targetId: "rena",
    prompt: "E · Předat zapečetěný soupis",
    interactionRadius: 1.75,
    availableStages: ["deliver-to-rena"],
  },
  {
    id: "inspect-ribbon-clue",
    type: "inspect",
    targetId: "ribbon-clue",
    prompt: "E · Prohlédnout stopy u skladu",
    interactionRadius: 2.4,
    availableStages: ["inspect-ribbon-clue"],
  },
  {
    id: "confront-spunt",
    type: "dialogue",
    targetId: "spunt-storage",
    prompt: "E · Přistoupit ke Špuntovi",
    interactionRadius: 1.65,
    availableStages: ["confront-spunt"],
  },
  {
    id: "open-forest-gate",
    type: "dialogue",
    targetId: "forest-gate",
    prompt: "E · Otevřít lesní bránu",
    interactionRadius: 1.7,
    availableStages: ["reach-forest-gate"],
    dialogueIdBySpuntOutcome: {
      protected: "gate-protected",
      "handed-over": "gate-handed-over",
    },
  },
];

const visualDetails: readonly SignatureDetailDefinition[] = [
  ...[
    [-2.5, 5.8],
    [2.5, 5.8],
    [-3.5, 1.8],
    [3.5, 1.8],
    [1.2, -4.6],
    [2.8, -4.6],
  ].map(([x, z], index): SignatureDetailDefinition => ({
    id: `festival-lantern-${index + 1}`,
    kind: "festival-lantern",
    position: { x, z },
  })),
  ...[
    [-2, 0.2],
    [0, -0.6],
    [2, 0.2],
  ].map(([x, z], index): SignatureDetailDefinition => ({
    id: `festival-table-${index + 1}`,
    kind: "festival-table",
    position: { x, z },
    facing: index % 2 === 0 ? Math.PI * 0.5 : 0,
  })),
  {
    id: "square-ribbon-line-west",
    kind: "ribbon-line",
    position: { x: -2.3, z: 3 },
    facing: Math.PI * 0.5,
  },
  {
    id: "square-ribbon-line-east",
    kind: "ribbon-line",
    position: { x: 3, z: 3 },
    facing: Math.PI * 0.5,
  },
  ...[
    [-1, 6],
    [1, 6],
    [3, -3],
  ].map(([x, z], index): SignatureDetailDefinition => ({
    id: `square-light-flower-${index + 1}`,
    kind: "light-flower",
    position: { x, z },
  })),
];

export const jasnovFestivalSquare: WorldMapDefinition = {
  id: "jasnov-festival-square",
  name: "Jasnov · festivalové náměstí",
  width: 19,
  depth: 17,
  playerSpawn: { x: 0, z: 7 },
  entryPoints: [{ id: "from-outskirts", position: { x: 0, z: 7 }, facing: "left" }],
  transitions: [],
  terrain: createTerrain(),
  entities,
  interactions,
  visualDetails,
};
