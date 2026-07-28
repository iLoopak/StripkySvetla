import type { Wave1StoryStage } from "../game/story/storyTypes";

export interface GridPosition {
  x: number;
  z: number;
}

export type TerrainSurface = "grass" | "path" | "water";

export interface TerrainCellDefinition {
  position: GridPosition;
  height: number;
  surface: TerrainSurface;
  walkable: boolean;
}

interface BaseEntityDefinition {
  id: string;
  position: GridPosition;
  facing?: number;
  collisionRadius?: number;
}

export interface NpcEntityDefinition extends BaseEntityDefinition {
  type: "npc";
  characterId: string;
  dialogueIds: Readonly<Partial<Record<Wave1StoryStage, string>>>;
}

export interface CollectibleEntityDefinition extends BaseEntityDefinition {
  type: "collectible";
  collectibleId: string;
}

export type DecorationKind = "tree" | "rock" | "shrine";

export interface DecorationEntityDefinition extends BaseEntityDefinition {
  type: "decoration";
  decorationKind: DecorationKind;
}

export type WorldEntityDefinition =
  NpcEntityDefinition | CollectibleEntityDefinition | DecorationEntityDefinition;

export type SignatureDetailKind =
  "path-lantern" | "light-flower" | "shard-marker" | "shrine-paving";

export interface SignatureDetailDefinition {
  id: string;
  kind: SignatureDetailKind;
  position: GridPosition;
  facing?: number;
}

export interface InteractionDefinition {
  id: string;
  type: "dialogue" | "collect";
  targetId: string;
  prompt: string;
  interactionRadius: number;
  availableStages: readonly Wave1StoryStage[];
}

export interface WorldMapDefinition {
  id: string;
  name: string;
  width: number;
  depth: number;
  playerSpawn: GridPosition;
  terrain: readonly TerrainCellDefinition[];
  entities: readonly WorldEntityDefinition[];
  interactions: readonly InteractionDefinition[];
  visualDetails: readonly SignatureDetailDefinition[];
}

export interface CharacterProportions {
  bodyWidth: number;
  bodyHeight: number;
  headSize: number;
  armLength: number;
  legHeight: number;
  footDepth: number;
}

export type CharacterHairStyle = "courier-hood" | "festival-bun";
export type CharacterOutfitStyle = "courier-tunic" | "festival-steward";
export type CharacterAccessory = "scarf" | "light-pendant" | "sash" | "festival-brooch";

export interface CharacterSpriteDefinition {
  assetPath: string;
  pixelWidth: number;
  pixelHeight: number;
  worldHeight: number;
}

export interface CharacterDefinition {
  id: string;
  displayName: string;
  sprite: CharacterSpriteDefinition;
  palette: {
    primary: string;
    secondary: string;
    skin: string;
    hair: string;
    boots: string;
    accent: string;
  };
  proportions: CharacterProportions;
  hairStyle: CharacterHairStyle;
  outfitStyle: CharacterOutfitStyle;
  accessories: readonly CharacterAccessory[];
}

export interface DialogueDefinition {
  id: string;
  speakerName: string;
  lines: readonly string[];
}

export interface ObjectiveDefinition {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
}
