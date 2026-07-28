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
}

export interface CharacterDefinition {
  id: string;
  displayName: string;
  palette: {
    clothing: string;
    skin: string;
    hair: string;
    boots: string;
    accent: string;
  };
  hairStyle: "cap" | "bun";
  hasLamp: boolean;
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
