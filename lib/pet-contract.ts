import { z } from "zod";

export const moods = ["cheerful", "muted", "cool", "warm"] as const;

export const moodSchema = z.enum(moods);
export type Mood = z.infer<typeof moodSchema>;

export const frameCountSchema = z.union([z.literal(4), z.literal(8)]);
export type FrameCount = z.infer<typeof frameCountSchema>;

export const uploadResultSchema = z.object({
  uploadId: z.string().min(8),
  name: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
  sha256: z.string().length(64)
});

export type UploadResult = z.infer<typeof uploadResultSchema>;

export const pixelFrameSchema = z.object({
  id: z.string(),
  mood: moodSchema,
  label: z.string(),
  palette: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).length(4),
  cells: z.array(z.number().int().min(0).max(3)).length(64)
});

export type PixelFrame = z.infer<typeof pixelFrameSchema>;

export const generationRequestSchema = z.object({
  upload: uploadResultSchema,
  mood: moodSchema,
  frameCount: frameCountSchema
});

export type GenerationRequest = z.infer<typeof generationRequestSchema>;

export const generationResultSchema = z.object({
  id: z.string(),
  mode: z.enum(["mock", "real"]),
  frameCount: frameCountSchema,
  selectedMood: moodSchema,
  frames: z.array(pixelFrameSchema).min(4).max(8),
  createdAt: z.string(),
  source: uploadResultSchema
});

export type GenerationResult = z.infer<typeof generationResultSchema>;

export const exportPayloadSchema = z.object({
  result: generationResultSchema
});

export type ExportPayload = z.infer<typeof exportPayloadSchema>;
