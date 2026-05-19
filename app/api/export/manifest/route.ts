import { NextResponse } from "next/server";
import { exportPayloadSchema } from "@/lib/pet-contract";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = exportPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid manifest payload." }, { status: 400 });
  }

  const { result } = parsed.data;
  return NextResponse.json({
    id: result.id,
    mode: result.mode,
    source: result.source,
    frameCount: result.frameCount,
    selectedMood: result.selectedMood,
    frames: result.frames.map((frame, index) => ({
      index,
      id: frame.id,
      label: frame.label,
      mood: frame.mood,
      palette: frame.palette
    })),
    createdAt: result.createdAt
  });
}
