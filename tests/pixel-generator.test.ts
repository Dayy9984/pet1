import { describe, expect, it, vi } from "vitest";
import type { UploadResult } from "@/lib/pet-contract";
import { generatePixelSet } from "@/lib/pixel-generator";
import { renderSpriteSheetPng } from "@/lib/png";

const upload: UploadResult = {
  uploadId: "upload_1234567890abcdef",
  name: "pet.png",
  mimeType: "image/png",
  size: 1024,
  sha256: "a".repeat(64)
};

describe("pixel generator", () => {
  it("creates the requested number of deterministic frames", async () => {
    vi.setSystemTime(new Date("2026-05-20T00:00:00.000Z"));
    const result = await generatePixelSet({ upload, mood: "cool", frameCount: 8 });

    expect(result.frameCount).toBe(8);
    expect(result.frames).toHaveLength(8);
    expect(result.frames[0]?.mood).toBe("cool");
    expect(result.frames.every((frame) => frame.cells.length === 64)).toBe(true);
  });

  it("renders a png sprite sheet", async () => {
    const result = await generatePixelSet({ upload, mood: "cheerful", frameCount: 4 });
    const png = renderSpriteSheetPng(result.frames, 32);

    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(png.length).toBeGreaterThan(100);
  });
});
