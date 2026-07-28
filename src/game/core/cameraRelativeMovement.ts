import type { MovementDirection } from "./gameTypes";

const MIN_DIRECTION_LENGTH_SQUARED = 1e-8;
const FALLBACK_CAMERA_FORWARD: MovementDirection = { x: 0, z: 1 };

export interface CameraGroundBasis {
  forward: MovementDirection;
  right: MovementDirection;
}

export function createCameraGroundBasis(
  flattenedCameraForward: MovementDirection,
): CameraGroundBasis {
  const lengthSquared =
    flattenedCameraForward.x * flattenedCameraForward.x +
    flattenedCameraForward.z * flattenedCameraForward.z;
  const forward =
    lengthSquared > MIN_DIRECTION_LENGTH_SQUARED
      ? {
          x: flattenedCameraForward.x / Math.sqrt(lengthSquared),
          z: flattenedCameraForward.z / Math.sqrt(lengthSquared),
        }
      : { ...FALLBACK_CAMERA_FORWARD };

  return {
    forward,
    right: {
      x: forward.z,
      z: -forward.x,
    },
  };
}

export function resolveCameraRelativeMovement(
  inputIntent: MovementDirection,
  basis: CameraGroundBasis,
): MovementDirection {
  const inputRight = inputIntent.x;
  const inputForward = -inputIntent.z;
  const movement = {
    x: basis.forward.x * inputForward + basis.right.x * inputRight,
    z: basis.forward.z * inputForward + basis.right.z * inputRight,
  };
  const length = Math.hypot(movement.x, movement.z);

  if (length === 0 || length <= 1) {
    return movement;
  }

  return {
    x: movement.x / length,
    z: movement.z / length,
  };
}
