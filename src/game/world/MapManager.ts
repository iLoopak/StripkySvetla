import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import { charactersById } from "../../content/characters/characters";
import { mapEntryPoint, mapsById } from "../../content/maps/maps";
import type {
  CollectibleEntityDefinition,
  NpcEntityDefinition,
  WorldEntityDefinition,
  WorldMapDefinition,
} from "../../content/types";
import { createCharacterVisual } from "../characters/createCharacterVisual";
import type { CharacterVisual } from "../characters/characterVisualTypes";
import type { HorizontalFacing } from "../core/gameTypes";
import { createLightSpark } from "../entities/createLightSpark";
import { matchesStoryConditions } from "../story/storyMachine";
import type { StorySnapshot } from "../story/storyTypes";
import type { CircularBlocker } from "./mapCollision";
import { findTerrainCell } from "./mapCollision";
import {
  createWorldMap,
  type RenderedWorldMap,
  WorldRenderResources,
} from "./createWorldMap";

export interface RenderedEntity {
  definition: NpcEntityDefinition | CollectibleEntityDefinition;
  root: TransformNode;
  animate: (elapsedSeconds: number) => void;
  setFacing?: (facing: HorizontalFacing) => void;
  collect?: (playEffect?: boolean) => boolean;
  dispose: () => void;
}

export class MapManager {
  private readonly resources: WorldRenderResources;
  private activeMap: WorldMapDefinition | null = null;
  private world: RenderedWorldMap | null = null;
  private readonly entities = new Map<string, RenderedEntity>();

  constructor(
    private readonly scene: Scene,
    private readonly player: CharacterVisual,
  ) {
    this.resources = new WorldRenderResources(scene);
  }

  load(mapId: string, entryPointId: string, story: StorySnapshot): WorldMapDefinition {
    const map = mapsById[mapId];
    if (!map) {
      throw new Error(`Unknown map: ${mapId}`);
    }
    const entryPoint = mapEntryPoint(map, entryPointId);
    if (!entryPoint) {
      throw new Error(`Unknown entry point ${entryPointId} for map ${mapId}`);
    }

    this.disposeActiveMap();
    this.activeMap = map;
    this.world = createWorldMap(this.scene, map, this.resources);
    map.entities.forEach((definition) => {
      const entity = this.renderEntity(map, definition);
      if (entity) {
        this.entities.set(definition.id, entity);
      }
    });
    this.player.root.position.set(
      entryPoint.position.x,
      findTerrainCell(map, entryPoint.position)?.height ?? 0,
      entryPoint.position.z,
    );
    this.refreshStoryState(story);
    return map;
  }

  get map(): WorldMapDefinition {
    if (!this.activeMap) {
      throw new Error("No active map is loaded.");
    }
    return this.activeMap;
  }

  get renderedWorld(): RenderedWorldMap | null {
    return this.world;
  }

  get renderedEntities(): ReadonlyMap<string, RenderedEntity> {
    return this.entities;
  }

  refreshStoryState(story: StorySnapshot): void {
    this.entities.forEach((entity) => {
      const collected =
        entity.definition.type === "collectible" &&
        story.collectedEntityIds.has(entity.definition.id);
      const visible =
        !collected && matchesStoryConditions(story, entity.definition.conditions);
      entity.root.setEnabled(visible);
      if (collected) {
        entity.collect?.(false);
      }
    });
  }

  getBlockers(story: StorySnapshot): readonly CircularBlocker[] {
    return this.map.entities.flatMap((entity) => {
      const enabled =
        entity.collisionRadius !== undefined &&
        entity.type !== "collectible" &&
        matchesStoryConditions(story, entity.conditions);
      return enabled
        ? [
            {
              id: entity.id,
              position: entity.position,
              radius: entity.collisionRadius ?? 0,
            },
          ]
        : [];
    });
  }

  animate(elapsedSeconds: number): void {
    this.entities.forEach((entity) => {
      if (entity.root.isEnabled()) {
        entity.animate(elapsedSeconds);
      }
    });
  }

  dispose(): void {
    this.disposeActiveMap();
    this.resources.dispose();
  }

  private renderEntity(
    map: WorldMapDefinition,
    definition: WorldEntityDefinition,
  ): RenderedEntity | null {
    const y = findTerrainCell(map, definition.position)?.height ?? 0;
    if (definition.type === "npc") {
      const characterDefinition = charactersById[definition.characterId];
      if (!characterDefinition) {
        throw new Error(`Unknown character definition: ${definition.characterId}`);
      }
      const character = createCharacterVisual(
        this.scene,
        characterDefinition,
        definition.id,
      );
      let facing: HorizontalFacing = "right";
      character.root.position.set(definition.position.x, y, definition.position.z);
      character.root.rotation.y = definition.facing ?? 0;

      const ribbonMaterial =
        definition.id === "spunt-storage"
          ? this.addSpuntRibbon(character.root, definition.id)
          : null;

      return {
        definition,
        root: character.root,
        animate: (elapsedSeconds) =>
          character.animate({ elapsedSeconds, isMoving: false, facing }),
        setFacing: (nextFacing) => {
          facing = nextFacing;
        },
        dispose: () => {
          if (character.dispose) {
            character.dispose();
          } else {
            character.root.dispose(false, false);
          }
          ribbonMaterial?.dispose();
        },
      };
    }

    if (definition.type === "collectible") {
      const spark = createLightSpark(this.scene, definition.id, definition.position, y);
      return {
        definition,
        root: spark.root,
        animate: spark.animate,
        collect: spark.collect,
        dispose: spark.dispose,
      };
    }

    return null;
  }

  private addSpuntRibbon(parent: TransformNode, instanceName: string): StandardMaterial {
    const material = new StandardMaterial(`${instanceName}-RibbonMaterial`, this.scene);
    material.diffuseColor = Color3.FromHexString("#efb45f");
    material.emissiveColor = Color3.FromHexString("#ef8b66").scale(0.12);
    material.specularColor = Color3.Black();
    const ribbon = MeshBuilder.CreateBox(
      `${instanceName}-Ribbon`,
      { width: 0.42, height: 0.05, depth: 0.08 },
      this.scene,
    );
    ribbon.parent = parent;
    ribbon.position.set(0.48, 0.66, -0.1);
    ribbon.rotation.z = -0.18;
    ribbon.material = material;
    return material;
  }

  private disposeActiveMap(): void {
    this.entities.forEach((entity) => entity.dispose());
    this.entities.clear();
    this.world?.dispose();
    this.world = null;
    this.activeMap = null;
  }
}
