import { NextResponse } from "next/server";
import { exportPayloadSchema } from "@/lib/pet-contract";
import { renderSpriteSheetPng } from "@/lib/png";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = exportPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid export payload." }, { status: 400 });
  }

  const png = renderSpriteSheetPng(parsed.data.result.frames);
  const responseBody = new Uint8Array(png.byteLength);
  responseBody.set(png);
  return new Response(responseBody, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": "attachment; filename=\"sprite-sheet.png\"",
      "Cache-Control": "no-store"
    }
  });
}
