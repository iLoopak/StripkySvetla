import type { GridPosition, WorldMapDefinition } from "../../content/types";
import type { PlayerPosition } from "../core/gameTypes";

export interface CircularBlocker {
  id: string;
  position: GridPosition;
  radius: number;
}

const PLAYER_RADIUS = 0.3;

export function findTerrainCell(map: WorldMapDefinition, position: GridPosition) {
  const cellX = Math.round(position.x);
  const cellZ = Math.round(position.z);
  return (
    map.terrain.find((cell) => cell.position.x === cellX && cell.position.z === cellZ) ??
    null
  );
}

export function isMapPositionWalkable(
  map: WorldMapDefinition,
  position: GridPosition,
  blockers: readonly CircularBlocker[],
): boolean {
  const halfWidth = (map.width - 1) / 2;
  const halfDepth = (map.depth - 1) / 2;
  if (
    position.x < -halfWidth ||
    position.x > halfWidth ||
    position.z < -halfDepth ||
    position.z > halfDepth
  ) {
    return false;
  }

  const terrainCell = findTerrainCell(map, position);
  if (!terrainCell?.walkable) {
    return false;
  }

  return blockers.every(
    (blocker) =>
      Math.hypot(position.x - blocker.position.x, position.z - blocker.position.z) >=
      PLAYER_RADIUS + blocker.radius,
  );
}

export function resolveMapMovement(
  map: WorldMapDefinition,
  current: PlayerPosition,
  candidate: PlayerPosition,
  blockers: readonly CircularBlocker[],
): PlayerPosition {
  const candidates = [
    candidate,
    { ...candidate, z: current.z },
    { ...candidate, x: current.x },
  ];

  for (const next of candidates) {
    if (isMapPositionWalkable(map, next, blockers)) {
      const cell = findTerrainCell(map, next);
      return { ...next, y: cell?.height ?? current.y };
    }
  }

  return current;
}
