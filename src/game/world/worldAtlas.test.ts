import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  atlasTileToUV,
  BLOCK_FACE_TEXTURES,
  createBoxFaceUV,
  resolveBlockTextureVariant,
  selectDeterministicVariant,
  WORLD_ATLAS_LAYOUT,
  WORLD_ATLAS_PATH,
  WORLD_ATLAS_TILE_IDS,
  WORLD_ATLAS_TILES,
} from "./worldAtlas";

function readPngDimensions(path: string): { width: number; height: number } {
  const buffer = readFileSync(path);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

describe("world atlas metadata", () => {
  it("uses unique tile IDs", () => {
    expect(new Set(WORLD_ATLAS_TILE_IDS).size).toBe(WORLD_ATLAS_TILE_IDS.length);
    expect(new Set(WORLD_ATLAS_TILES.map((tile) => tile.id)).size).toBe(
      WORLD_ATLAS_TILES.length,
    );
  });

  it("references only declared tiles from block definitions", () => {
    const declared = new Set(WORLD_ATLAS_TILE_IDS);

    Object.values(BLOCK_FACE_TEXTURES).forEach((definition) => {
      expect(declared.has(definition.top)).toBe(true);
      expect(declared.has(definition.side)).toBe(true);
      expect(declared.has(definition.bottom)).toBe(true);
    });
  });

  it("returns UV coordinates inside the normalized texture range", () => {
    WORLD_ATLAS_TILE_IDS.forEach((tileId) => {
      const uv = atlasTileToUV(tileId);
      [uv.x, uv.y, uv.z, uv.w].forEach((coordinate) => {
        expect(coordinate).toBeGreaterThanOrEqual(0);
        expect(coordinate).toBeLessThanOrEqual(1);
      });
      expect(uv.x).toBeLessThan(uv.z);
      expect(uv.y).toBeLessThan(uv.w);
    });
  });

  it("maps grass top, side, and bottom faces correctly", () => {
    const definition = BLOCK_FACE_TEXTURES["grass-a"];
    const faceUV = createBoxFaceUV(definition);

    expect(faceUV[0]).toEqual(atlasTileToUV("grass-side"));
    expect(faceUV[4]).toEqual(atlasTileToUV("grass-top-a"));
    expect(faceUV[5]).toEqual(atlasTileToUV("dirt"));
  });

  it("maps wood top, side, and bottom faces correctly", () => {
    const definition = BLOCK_FACE_TEXTURES.wood;
    const faceUV = createBoxFaceUV(definition);

    expect(faceUV[0]).toEqual(atlasTileToUV("wood-side"));
    expect(faceUV[4]).toEqual(atlasTileToUV("wood-top"));
    expect(faceUV[5]).toEqual(atlasTileToUV("wood-top"));
  });

  it("selects stable in-range variants from world positions", () => {
    const first = selectDeterministicVariant(-4.25, 7.5, 3);
    expect(selectDeterministicVariant(-4.25, 7.5, 3)).toBe(first);
    expect(first).toBeGreaterThanOrEqual(0);
    expect(first).toBeLessThan(3);
    expect(resolveBlockTextureVariant("stone", 4, -6)).toBe(
      resolveBlockTextureVariant("stone", 4, -6),
    );
    expect(resolveBlockTextureVariant("grass", -3, 8)).toBe(
      resolveBlockTextureVariant("grass", -3, 8),
    );
  });

  it("distributes two-way variants across representative world positions", () => {
    const selected = new Set(
      [
        [-6, -5],
        [-5, 4],
        [6, 5],
        [6, -2],
        [-4, 6],
        [5, -6],
        [7, 1],
        [-6, -1],
      ].map(([x, z]) => selectDeterministicVariant(x, z, 2)),
    );

    expect(selected).toEqual(new Set([0, 1]));
  });

  it("uses a local PNG whose dimensions match the atlas metadata", () => {
    expect(WORLD_ATLAS_PATH).toMatch(/^\/assets\/.*\.png$/);
    const assetUrl = new URL(`../../../public${WORLD_ATLAS_PATH}`, import.meta.url);
    expect(readPngDimensions(fileURLToPath(assetUrl))).toEqual({
      width: WORLD_ATLAS_LAYOUT.width,
      height: WORLD_ATLAS_LAYOUT.height,
    });
  });
});
