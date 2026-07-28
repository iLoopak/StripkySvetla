export interface PlayerPosition {
  x: number;
  y: number;
  z: number;
}

export interface MovementDirection {
  x: number;
  z: number;
}

export type HorizontalFacing = "left" | "right";

export interface CharacterAnimationState {
  elapsedSeconds: number;
  isMoving: boolean;
  facing: HorizontalFacing;
}
