import { createHash } from "node:crypto";
import { getGeneratorMode } from "./env";
import type { GenerationRequest, GenerationResult, Mood, PixelFrame } from "./pet-contract";
import { moods } from "./pet-contract";

const palettes: Record<Mood, string[]> = {
  cheerful: ["#f47c20", "#ffb457", "#2f8fbc", "#ffffff"],
  muted: ["#9f927d", "#c6bca9", "#6d6459", "#f7f4ed"],
  cool: ["#4f88b5", "#32648f", "#17486b", "#062842"],
  warm: ["#d55d61", "#f08c76", "#8d363a", "#fff1e9"]
};

function hashNumber(seed: string): number {
  const hex = createHash("sha256").update(seed).digest("hex").slice(0, 8);
  return Number.parseInt(hex, 16);
}

function cellValue(seed: string, index: number): number {
  const row = Math.floor(index / 8);
  const col = index % 8;
  const centerBias = row >= 2 && row <= 6 && col >= 2 && col <= 5 ? 1 : 0;
  const value = (hashNumber(`${seed}:${index}`) + row * 7 + col * 11 + centerBias) % 4;
  return value;
}

function makeFrame(seed: string, mood: Mood, index: number): PixelFrame {
  const cells = Array.from({ length: 64 }, (_, cellIndex) => cellValue(`${seed}:${mood}:${index}`, cellIndex));

  for (let x = 2; x < 6; x += 1) {
    cells[2 * 8 + x] = 1;
    cells[5 * 8 + x] = 2;
  }

  const eyeOffset = index % 2;
  cells[3 * 8 + 2 + eyeOffset] = 3;
  cells[3 * 8 + 5 - eyeOffset] = 3;
  cells[6 * 8 + 3] = 0;
  cells[6 * 8 + 4] = 0;

  return {
    id: `frame_${mood}_${index + 1}`,
    mood,
    label: `${mood} ${index + 1}`,
    palette: palettes[mood],
    cells
  };
}

export async function generatePixelSet(request: GenerationRequest): Promise<GenerationResult> {
  const mode = getGeneratorMode();

  if (mode === "real" && !process.env.OPENAI_API_KEY) {
    throw new Error("PET_GENERATE_MODE=real requires OPENAI_API_KEY.");
  }

  const orderedMoods = [
    request.mood,
    ...moods.filter((mood) => mood !== request.mood)
  ];
  const seed = `${request.upload.sha256}:${request.mood}:${request.frameCount}`;

  const frames = Array.from({ length: request.frameCount }, (_, index) => {
    const mood = orderedMoods[index % orderedMoods.length];
    return makeFrame(seed, mood, index);
  });

  return {
    id: `sprite_${hashNumber(seed).toString(16)}`,
    mode,
    frameCount: request.frameCount,
    selectedMood: request.mood,
    frames,
    createdAt: new Date().toISOString(),
    source: request.upload
  };
}
