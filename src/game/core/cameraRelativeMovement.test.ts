import { describe, expect, it } from "vitest";
import { resolveHorizontalFacing } from "../characters/characterFacing";
import { directionFromKeys } from "../input/InputManager";
import {
  createCameraGroundBasis,
  resolveCameraRelativeMovement,
  type CameraGroundBasis,
} from "./cameraRelativeMovement";
import type { MovementDirection } from "./gameTypes";

const DIAGONAL = Math.SQRT1_2;

function movementForKeys(
  keys: readonly string[],
  basis: CameraGroundBasis,
): MovementDirection {
  return resolveCameraRelativeMovement(directionFromKeys(new Set(keys)), basis);
}

function expectDirection(actual: MovementDirection, expected: MovementDirection): void {
  expect(actual.x).toBeCloseTo(expected.x);
  expect(actual.z).toBeCloseTo(expected.z);
}

function expectScreenRelativeCardinals(basis: CameraGroundBasis): void {
  expectDirection(movementForKeys(["KeyW"], basis), basis.forward);
  expectDirection(movementForKeys(["ArrowUp"], basis), basis.forward);
  expectDirection(movementForKeys(["KeyS"], basis), {
    x: -basis.forward.x,
    z: -basis.forward.z,
  });
  expectDirection(movementForKeys(["ArrowDown"], basis), {
    x: -basis.forward.x,
    z: -basis.forward.z,
  });
  expectDirection(movementForKeys(["KeyA"], basis), {
    x: -basis.right.x,
    z: -basis.right.z,
  });
  expectDirection(movementForKeys(["ArrowLeft"], basis), {
    x: -basis.right.x,
    z: -basis.right.z,
  });
  expectDirection(movementForKeys(["KeyD"], basis), basis.right);
  expectDirection(movementForKeys(["ArrowRight"], basis), basis.right);
}

describe("camera-relative movement", () => {
  it("maps W/S/A/D and arrow keys at the default camera orientation", () => {
    const basis = createCameraGroundBasis({ x: -DIAGONAL, z: DIAGONAL });

    expectScreenRelativeCardinals(basis);
  });

  it("updates screen-relative directions after an approximately 90 degree rotation", () => {
    const basis = createCameraGroundBasis({ x: DIAGONAL, z: DIAGONAL });

    expectScreenRelativeCardinals(basis);
  });

  it("updates screen-relative directions after an approximately 180 degree rotation", () => {
    const basis = createCameraGroundBasis({ x: DIAGONAL, z: -DIAGONAL });

    expectScreenRelativeCardinals(basis);
  });

  it("keeps diagonal movement normalized", () => {
    const basis = createCameraGroundBasis({ x: 0.25, z: 0.75 });
    const movement = movementForKeys(["KeyW", "KeyD"], basis);

    expect(Math.hypot(movement.x, movement.z)).toBeCloseTo(1);
  });

  it("returns zero movement for zero input", () => {
    const basis = createCameraGroundBasis({ x: -DIAGONAL, z: DIAGONAL });

    expect(resolveCameraRelativeMovement({ x: 0, z: 0 }, basis)).toEqual({
      x: 0,
      z: 0,
    });
  });

  it("uses a stable fallback when the flattened camera forward is degenerate", () => {
    const basis = createCameraGroundBasis({ x: 0, z: 0 });

    expectDirection(basis.forward, { x: 0, z: 1 });
    expectDirection(basis.right, { x: 1, z: 0 });
    expectDirection(movementForKeys(["KeyW"], basis), { x: 0, z: 1 });
  });

  it("resolves facing from screen-horizontal movement after camera rotation", () => {
    const basis = createCameraGroundBasis({ x: DIAGONAL, z: DIAGONAL });
    const screenUp = movementForKeys(["KeyW"], basis);
    const screenRight = movementForKeys(["KeyD"], basis);
    const screenLeft = movementForKeys(["KeyA"], basis);

    expect(resolveHorizontalFacing(screenUp, basis.right, "left")).toBe("left");
    expect(resolveHorizontalFacing(screenUp, basis.right, "right")).toBe("right");
    expect(resolveHorizontalFacing(screenRight, basis.right, "left")).toBe("right");
    expect(resolveHorizontalFacing(screenLeft, basis.right, "right")).toBe("left");
  });
});
