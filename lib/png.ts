import { deflateSync } from "node:zlib";
import type { PixelFrame } from "./pet-contract";

const crcTable = new Uint32Array(256).map((_, index) => {
  let c = index;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

function crc32(buffer: Buffer): number {
  let c = 0xffffffff;
  for (const byte of buffer) {
    c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16)
  ];
}

export function renderSpriteSheetPng(frames: PixelFrame[], tileSize = 96): Buffer {
  const columns = 2;
  const rows = Math.ceil(frames.length / columns);
  const width = columns * tileSize;
  const height = rows * tileSize;
  const cellSize = tileSize / 8;
  const stride = 1 + width * 4;
  const raw = Buffer.alloc(stride * height);

  for (let y = 0; y < height; y += 1) {
    raw[y * stride] = 0;
    for (let x = 0; x < width; x += 1) {
      const frameColumn = Math.floor(x / tileSize);
      const frameRow = Math.floor(y / tileSize);
      const frame = frames[frameRow * columns + frameColumn];
      const offset = y * stride + 1 + x * 4;

      if (!frame) {
        raw[offset] = 255;
        raw[offset + 1] = 255;
        raw[offset + 2] = 255;
        raw[offset + 3] = 0;
        continue;
      }

      const localX = x % tileSize;
      const localY = y % tileSize;
      const cellX = Math.min(7, Math.floor(localX / cellSize));
      const cellY = Math.min(7, Math.floor(localY / cellSize));
      const paletteIndex = frame.cells[cellY * 8 + cellX] ?? 0;
      const [red, green, blue] = hexToRgb(frame.palette[paletteIndex] ?? frame.palette[0]);
      raw[offset] = red;
      raw[offset + 1] = green;
      raw[offset + 2] = blue;
      raw[offset + 3] = 255;
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0))
  ]);
}
