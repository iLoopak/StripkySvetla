import type {
  ChapterOneStage,
  SpuntOutcome,
  StoryCondition,
} from "../game/story/storyTypes";

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
  conditions?: readonly StoryCondition[];
}

export interface ConditionalDialogueDefinition {
  dialogueId: string;
  conditions: readonly StoryCondition[];
}

export interface NpcEntityDefinition extends BaseEntityDefinition {
  type: "npc";
  characterId: string;
  dialogueIds: Readonly<Partial<Record<ChapterOneStage, string>>>;
  conditionalDialogueIds?: readonly ConditionalDialogueDefinition[];
}

export interface CollectibleEntityDefinition extends BaseEntityDefinition {
  type: "collectible";
  collectibleId: string;
}

export type DecorationKind =
  | "tree"
  | "rock"
  | "shrine"
  | "storehouse"
  | "festival-stall"
  | "crate"
  | "pen"
  | "forest-gate"
  | "clue-marker"
  | "town-gate";

export interface DecorationEntityDefinition extends BaseEntityDefinition {
  type: "decoration";
  decorationKind: DecorationKind;
}

export type WorldEntityDefinition =
  NpcEntityDefinition | CollectibleEntityDefinition | DecorationEntityDefinition;

export type SignatureDetailKind =
  | "path-lantern"
  | "light-flower"
  | "shard-marker"
  | "shrine-paving"
  | "festival-lantern"
  | "ribbon-line"
  | "festival-table";

export interface SignatureDetailDefinition {
  id: string;
  kind: SignatureDetailKind;
  position: GridPosition;
  facing?: number;
}

export interface InteractionDefinition {
  id: string;
  type: "dialogue" | "collect" | "inspect" | "transition";
  targetId: string;
  prompt: string;
  interactionRadius: number;
  availableStages: readonly ChapterOneStage[];
  transitionId?: string;
  dialogueId?: string;
  dialogueIdBySpuntOutcome?: Readonly<
    Partial<Record<Exclude<SpuntOutcome, null>, string>>
  >;
}

export interface MapEntryPoint {
  id: string;
  position: GridPosition;
  facing?: "left" | "right";
}

export interface MapTransitionDefinition {
  id: string;
  targetMapId: string;
  targetEntryPointId: string;
  conditions?: readonly StoryCondition[];
}

export interface WorldMapDefinition {
  id: string;
  name: string;
  width: number;
  depth: number;
  playerSpawn: GridPosition;
  entryPoints: readonly MapEntryPoint[];
  transitions: readonly MapTransitionDefinition[];
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

export type CharacterKind = "humanoid" | "spirit" | "creature";
export type CharacterHairStyle =
  "courier-hood" | "festival-bun" | "ranger-braid" | "none";
export type CharacterOutfitStyle =
  "courier-tunic" | "festival-steward" | "ranger-coat" | "none";
export type CharacterAccessory =
  | "scarf"
  | "light-pendant"
  | "sash"
  | "festival-brooch"
  | "gate-key"
  | "shoulder-wrap"
  | "floating-shard"
  | "ear-notch";

export interface CharacterSpriteDefinition {
  assetPath: string;
  pixelWidth: number;
  pixelHeight: number;
  worldHeight: number;
}

export interface CharacterDefinition {
  id: string;
  displayName: string;
  kind?: CharacterKind;
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

export interface DialogueChoice {
  id: string;
  text: string;
  next: string;
  outcome?: Exclude<SpuntOutcome, null>;
  conditions?: readonly StoryCondition[];
}

export interface DialogueNode {
  id: string;
  speakerName?: string;
  text: string;
  next?: string;
  choices?: readonly DialogueChoice[];
}

export interface DialogueDefinition {
  id: string;
  speakerName: string;
  startNodeId: string;
  nodes: readonly DialogueNode[];
}

export interface ObjectiveDefinition {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
}
