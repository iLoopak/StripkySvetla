import type { MovementDirection, PlayerPosition } from "../game/core/gameTypes";

export const WORLD_HALF_SIZE = 8.5;

export function normalizeMovement(direction: MovementDirection): MovementDirection {
  const length = Math.hypot(direction.x, direction.z);

  if (length === 0 || length <= 1) {
    return direction;
  }

  return {
    x: direction.x / length,
    z: direction.z / length,
  };
}

export function clampPlayerPosition(
  position: PlayerPosition,
  halfSize = WORLD_HALF_SIZE,
): PlayerPosition {
  return {
    x: Math.max(-halfSize, Math.min(halfSize, position.x)),
    y: position.y,
    z: Math.max(-halfSize, Math.min(halfSize, position.z)),
  };
}
