import { Vector4 } from "@babylonjs/core/Maths/math.vector";

export const WORLD_ATLAS_PATH = "/assets/world/world-atlas.png";

export const WORLD_ATLAS_LAYOUT = {
  width: 128,
  height: 128,
  tileSize: 16,
  gutter: 1,
  columns: 7,
  rows: 7,
} as const;

export const WORLD_ATLAS_TILE_IDS = [
  "grass-top-a",
  "grass-top-b",
  "grass-side",
  "dirt",
  "path",
  "stone-a",
  "stone-b",
  "wood-side",
  "wood-top",
  "leaves-a",
  "leaves-b",
] as const;

export type AtlasTileId = (typeof WORLD_ATLAS_TILE_IDS)[number];

export interface AtlasTile {
  id: AtlasTileId;
  column: number;
  row: number;
}

export interface BlockFaceTextureDefinition {
  top: AtlasTileId;
  side: AtlasTileId;
  bottom: AtlasTileId;
}

export type TexturedBlockKind =
  "grass" | "grassLight" | "dirt" | "path" | "stone" | "wood" | "leaves";

export type BlockTextureVariantId =
  | "grass-a"
  | "grass-b"
  | "dirt"
  | "path"
  | "stone-a"
  | "stone-b"
  | "wood"
  | "leaves-a"
  | "leaves-b";

export const WORLD_ATLAS_TILES: readonly AtlasTile[] = [
  { id: "grass-top-a", column: 0, row: 0 },
  { id: "grass-top-b", column: 1, row: 0 },
  { id: "grass-side", column: 2, row: 0 },
  { id: "dirt", column: 3, row: 0 },
  { id: "path", column: 4, row: 0 },
  { id: "stone-a", column: 5, row: 0 },
  { id: "stone-b", column: 6, row: 0 },
  { id: "wood-side", column: 0, row: 1 },
  { id: "wood-top", column: 1, row: 1 },
  { id: "leaves-a", column: 2, row: 1 },
  { id: "leaves-b", column: 3, row: 1 },
];

export const BLOCK_FACE_TEXTURES: Readonly<
  Record<BlockTextureVariantId, BlockFaceTextureDefinition>
> = {
  "grass-a": {
    top: "grass-top-a",
    side: "grass-side",
    bottom: "dirt",
  },
  "grass-b": {
    top: "grass-top-b",
    side: "grass-side",
    bottom: "dirt",
  },
  dirt: {
    top: "dirt",
    side: "dirt",
    bottom: "dirt",
  },
  path: {
    top: "path",
    side: "dirt",
    bottom: "dirt",
  },
  "stone-a": {
    top: "stone-a",
    side: "stone-a",
    bottom: "stone-a",
  },
  "stone-b": {
    top: "stone-b",
    side: "stone-b",
    bottom: "stone-b",
  },
  wood: {
    top: "wood-top",
    side: "wood-side",
    bottom: "wood-top",
  },
  "leaves-a": {
    top: "leaves-a",
    side: "leaves-a",
    bottom: "leaves-a",
  },
  "leaves-b": {
    top: "leaves-b",
    side: "leaves-b",
    bottom: "leaves-b",
  },
};

const WORLD_ATLAS_TILES_BY_ID = new Map(WORLD_ATLAS_TILES.map((tile) => [tile.id, tile]));

const TEXTURED_BLOCK_KINDS: ReadonlySet<string> = new Set<TexturedBlockKind>([
  "grass",
  "grassLight",
  "dirt",
  "path",
  "stone",
  "wood",
  "leaves",
]);

export function isTexturedBlockKind(kind: string): kind is TexturedBlockKind {
  return TEXTURED_BLOCK_KINDS.has(kind);
}

export function selectDeterministicVariant(
  x: number,
  z: number,
  variantCount: number,
): number {
  if (!Number.isInteger(variantCount) || variantCount <= 0) {
    throw new RangeError("variantCount must be a positive integer.");
  }

  const quantizedX = Math.round(x * 1000);
  const quantizedZ = Math.round(z * 1000);
  const hash = Math.imul(quantizedX, 73_856_093) ^ Math.imul(quantizedZ, 19_349_663);
  return (hash >>> 0) % variantCount;
}

export function resolveBlockTextureVariant(
  kind: TexturedBlockKind,
  x: number,
  z: number,
): BlockTextureVariantId {
  if (kind === "grass") {
    return selectDeterministicVariant(x, z, 4) === 0 ? "grass-b" : "grass-a";
  }
  if (kind === "grassLight") {
    return "grass-b";
  }
  if (kind === "stone") {
    return selectDeterministicVariant(x, z, 2) === 0 ? "stone-a" : "stone-b";
  }
  if (kind === "leaves") {
    return selectDeterministicVariant(x, z, 2) === 0 ? "leaves-a" : "leaves-b";
  }
  return kind;
}

export function atlasTileToUV(tileId: AtlasTileId): Vector4 {
  const tile = WORLD_ATLAS_TILES_BY_ID.get(tileId);
  if (!tile) {
    throw new Error(`Unknown world atlas tile: ${tileId}`);
  }

  const { width, height, tileSize, gutter } = WORLD_ATLAS_LAYOUT;
  const stride = tileSize + gutter * 2;
  const halfTexel = 0.5;
  const left = tile.column * stride + gutter;
  const top = tile.row * stride + gutter;

  return new Vector4(
    (left + halfTexel) / width,
    1 - (top + tileSize - halfTexel) / height,
    (left + tileSize - halfTexel) / width,
    1 - (top + halfTexel) / height,
  );
}

export function createBoxFaceUV(definition: BlockFaceTextureDefinition): Vector4[] {
  const side = atlasTileToUV(definition.side);
  const top = atlasTileToUV(definition.top);
  const bottom = atlasTileToUV(definition.bottom);

  // Babylon box faces: front, back, right, left, top, bottom.
  return [side.clone(), side.clone(), side.clone(), side.clone(), top, bottom];
}
