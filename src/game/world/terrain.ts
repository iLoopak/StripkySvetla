import type { PlayerPosition } from "../core/gameTypes";

export function getTerrainHeight(x: number, z: number): number {
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

export function isWaterPosition(x: number, z: number): boolean {
  const streamCenter = Math.sin(z * 0.55) * 1.2 + 2.1;
  return Math.abs(x - streamCenter) < 0.72 && z > -7 && z < 7;
}

export function resolveWalkablePosition(
  current: PlayerPosition,
  candidate: PlayerPosition,
): PlayerPosition {
  if (isWaterPosition(candidate.x, candidate.z)) {
    return current;
  }

  return {
    ...candidate,
    y: getTerrainHeight(candidate.x, candidate.z),
  };
}
