import { deflateSync } from "node:zlib";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ATLAS_SIZE = 128;
const TILE_SIZE = 16;
const GUTTER = 1;
const CELL_SIZE = TILE_SIZE + GUTTER * 2;
const COLUMNS = 7;

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(scriptDirectory, "../public/assets/world/world-atlas.png");

const rgba = new Uint8Array(ATLAS_SIZE * ATLAS_SIZE * 4);

function hex(value) {
  const normalized = value.replace("#", "");
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
    255,
  ];
}

function createTile(base) {
  return Array.from({ length: TILE_SIZE }, () =>
    Array.from({ length: TILE_SIZE }, () => base),
  );
}

function set(tile, color, points) {
  points.forEach(([x, y]) => {
    tile[y][x] = color;
  });
}

function horizontal(tile, color, y, fromX, toX) {
  for (let x = fromX; x <= toX; x += 1) {
    tile[y][x] = color;
  }
}

function vertical(tile, color, x, fromY, toY) {
  for (let y = fromY; y <= toY; y += 1) {
    tile[y][x] = color;
  }
}

function grassTopA() {
  const tile = createTile("#668f68");
  set(tile, "#769a70", [
    [2, 3],
    [3, 2],
    [4, 3],
    [10, 2],
    [11, 3],
    [6, 8],
    [7, 7],
    [3, 12],
    [11, 12],
  ]);
  set(tile, "#4f7658", [
    [5, 4],
    [13, 6],
    [2, 8],
    [9, 11],
  ]);
  return tile;
}

function grassTopB() {
  const tile = createTile("#699169");
  set(tile, "#7b9e73", [
    [6, 2],
    [7, 3],
    [12, 4],
    [3, 6],
    [9, 9],
    [10, 8],
    [2, 12],
    [7, 13],
  ]);
  set(tile, "#52795a", [
    [2, 3],
    [9, 4],
    [6, 7],
    [13, 8],
    [4, 10],
  ]);
  return tile;
}

function grassSide() {
  const tile = createTile("#6c5143");
  for (let y = 0; y < 4; y += 1) {
    horizontal(tile, y < 2 ? "#769d70" : "#668f68", y, 0, 15);
  }
  set(tile, "#4f7658", [
    [2, 3],
    [2, 4],
    [6, 3],
    [10, 3],
    [10, 4],
    [10, 5],
    [14, 3],
    [14, 4],
  ]);
  set(tile, "#7d6050", [
    [3, 7],
    [7, 12],
    [12, 9],
  ]);
  set(tile, "#5b4338", [
    [5, 9],
    [9, 7],
    [13, 13],
  ]);
  return tile;
}

function dirt() {
  const tile = createTile("#6c5143");
  set(tile, "#5b4338", [
    [3, 3],
    [4, 3],
    [11, 5],
    [7, 8],
    [2, 12],
    [10, 13],
  ]);
  set(tile, "#7d6050", [
    [8, 2],
    [13, 8],
    [4, 9],
    [7, 13],
  ]);
  set(tile, "#8a745d", [
    [9, 2],
    [5, 9],
  ]);
  return tile;
}

function path() {
  const tile = createTile("#b99c6a");
  set(tile, "#a8895c", [
    [2, 3],
    [3, 3],
    [10, 2],
    [7, 7],
    [8, 7],
    [12, 10],
    [4, 12],
  ]);
  set(tile, "#c7af80", [
    [6, 3],
    [13, 5],
    [3, 8],
    [9, 11],
    [10, 11],
  ]);
  set(tile, "#96774f", [
    [11, 6],
    [5, 10],
    [13, 13],
  ]);
  return tile;
}

function stoneA() {
  const tile = createTile("#7f8c8d");
  set(tile, "#929a97", [
    [3, 3],
    [4, 3],
    [11, 2],
    [12, 2],
    [8, 9],
    [9, 9],
    [3, 12],
    [4, 12],
  ]);
  set(tile, "#68797b", [
    [9, 4],
    [9, 5],
    [10, 5],
    [6, 10],
    [6, 11],
    [5, 11],
  ]);
  set(tile, "#596d70", [
    [10, 6],
    [11, 6],
    [5, 12],
  ]);
  return tile;
}

function stoneB() {
  const tile = createTile("#7f8c8d");
  set(tile, "#929a97", [
    [6, 2],
    [7, 2],
    [12, 5],
    [3, 7],
    [4, 7],
    [9, 12],
    [10, 12],
  ]);
  set(tile, "#68797b", [
    [4, 4],
    [5, 4],
    [5, 5],
    [11, 8],
    [11, 9],
    [10, 9],
  ]);
  set(tile, "#596d70", [
    [6, 5],
    [10, 10],
    [9, 10],
  ]);
  return tile;
}

function woodSide() {
  const tile = createTile("#67483a");
  vertical(tile, "#795746", 3, 2, 13);
  vertical(tile, "#563a30", 7, 4, 12);
  vertical(tile, "#795746", 12, 1, 14);
  set(tile, "#563a30", [
    [9, 7],
    [10, 6],
    [11, 7],
    [10, 8],
  ]);
  set(tile, "#8a6851", [
    [4, 4],
    [8, 11],
    [13, 5],
  ]);
  return tile;
}

function woodTop() {
  const tile = createTile("#795746");
  const light = "#8b6a52";
  const dark = "#5b3e32";
  horizontal(tile, light, 2, 5, 10);
  horizontal(tile, light, 13, 5, 10);
  vertical(tile, light, 2, 5, 10);
  vertical(tile, light, 13, 5, 10);
  set(tile, light, [
    [4, 3],
    [11, 3],
    [3, 4],
    [12, 4],
    [3, 11],
    [12, 11],
    [4, 12],
    [11, 12],
  ]);
  horizontal(tile, dark, 5, 6, 9);
  horizontal(tile, dark, 10, 6, 9);
  vertical(tile, dark, 5, 6, 9);
  vertical(tile, dark, 10, 6, 9);
  set(tile, dark, [
    [7, 7],
    [8, 7],
    [7, 8],
    [8, 8],
  ]);
  return tile;
}

function leavesA() {
  const tile = createTile("#3f7058");
  set(tile, "#4f8064", [
    [3, 2],
    [4, 2],
    [2, 3],
    [3, 3],
    [4, 3],
    [10, 4],
    [11, 4],
    [12, 4],
    [11, 5],
    [6, 8],
    [7, 8],
    [8, 8],
    [7, 9],
    [3, 12],
    [4, 12],
    [11, 12],
    [12, 11],
  ]);
  set(tile, "#315b4a", [
    [7, 3],
    [8, 3],
    [3, 7],
    [12, 8],
    [9, 12],
    [10, 12],
  ]);
  set(tile, "#5a8d6c", [
    [3, 2],
    [11, 4],
    [7, 8],
    [4, 12],
  ]);
  return tile;
}

function leavesB() {
  const tile = createTile("#3f7058");
  set(tile, "#4f8064", [
    [6, 2],
    [7, 2],
    [8, 3],
    [12, 3],
    [13, 4],
    [3, 6],
    [4, 6],
    [3, 7],
    [9, 8],
    [10, 8],
    [11, 9],
    [5, 11],
    [6, 12],
    [12, 12],
  ]);
  set(tile, "#315b4a", [
    [2, 3],
    [10, 5],
    [6, 7],
    [13, 8],
    [3, 11],
    [9, 13],
  ]);
  set(tile, "#5a8d6c", [
    [7, 2],
    [13, 4],
    [4, 6],
    [10, 8],
    [6, 12],
  ]);
  return tile;
}

const tiles = [
  grassTopA(),
  grassTopB(),
  grassSide(),
  dirt(),
  path(),
  stoneA(),
  stoneB(),
  woodSide(),
  woodTop(),
  leavesA(),
  leavesB(),
];

function writePixel(x, y, color) {
  const [red, green, blue, alpha] = hex(color);
  const index = (y * ATLAS_SIZE + x) * 4;
  rgba[index] = red;
  rgba[index + 1] = green;
  rgba[index + 2] = blue;
  rgba[index + 3] = alpha;
}

function paintTile(tile, index) {
  const column = index % COLUMNS;
  const row = Math.floor(index / COLUMNS);
  const originX = column * CELL_SIZE + GUTTER;
  const originY = row * CELL_SIZE + GUTTER;

  for (let y = -GUTTER; y < TILE_SIZE + GUTTER; y += 1) {
    for (let x = -GUTTER; x < TILE_SIZE + GUTTER; x += 1) {
      const sourceX = Math.max(0, Math.min(TILE_SIZE - 1, x));
      const sourceY = Math.max(0, Math.min(TILE_SIZE - 1, y));
      writePixel(originX + x, originY + y, tile[sourceY][sourceX]);
    }
  }
}

tiles.forEach(paintTile);

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function encodePng() {
  const scanlines = Buffer.alloc((ATLAS_SIZE * 4 + 1) * ATLAS_SIZE);
  for (let y = 0; y < ATLAS_SIZE; y += 1) {
    const rowOffset = y * (ATLAS_SIZE * 4 + 1);
    scanlines[rowOffset] = 0;
    Buffer.from(rgba.buffer, y * ATLAS_SIZE * 4, ATLAS_SIZE * 4).copy(
      scanlines,
      rowOffset + 1,
    );
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(ATLAS_SIZE, 0);
  header.writeUInt32BE(ATLAS_SIZE, 4);
  header[8] = 8;
  header[9] = 6;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(scanlines)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, encodePng());
