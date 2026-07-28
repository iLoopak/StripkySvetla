import type { HorizontalFacing, MovementDirection } from "../core/gameTypes";

const SCREEN_HORIZONTAL_DEAD_ZONE = 0.08;

export function resolveHorizontalFacing(
  movement: MovementDirection,
  screenRight: MovementDirection,
  previousFacing: HorizontalFacing,
): HorizontalFacing {
  const movementLength = Math.hypot(movement.x, movement.z);
  const screenRightLength = Math.hypot(screenRight.x, screenRight.z);

  if (movementLength === 0 || screenRightLength === 0) {
    return previousFacing;
  }

  const screenHorizontalMovement =
    (movement.x * screenRight.x + movement.z * screenRight.z) /
    (movementLength * screenRightLength);

  if (Math.abs(screenHorizontalMovement) <= SCREEN_HORIZONTAL_DEAD_ZONE) {
    return previousFacing;
  }

  return screenHorizontalMovement > 0 ? "right" : "left";
}
