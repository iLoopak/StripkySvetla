export interface PlayerPosition {
  x: number;
  y: number;
  z: number;
}

export interface MovementDirection {
  x: number;
  z: number;
}

export interface CharacterAnimationState {
  elapsedSeconds: number;
  isMoving: boolean;
}
