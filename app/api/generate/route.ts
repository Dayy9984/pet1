import { NextResponse } from "next/server";
import { generationRequestSchema } from "@/lib/pet-contract";
import { generatePixelSet } from "@/lib/pixel-generator";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = generationRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid generation request." }, { status: 400 });
  }

  try {
    const result = await generatePixelSet(parsed.data);
    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed.";
    const status = message.includes("OPENAI_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
