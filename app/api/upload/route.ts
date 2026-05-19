import { NextResponse } from "next/server";
import { getUploadLimitBytes } from "@/lib/env";
import { UploadValidationError, validateUpload } from "@/lib/upload";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("image");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing image file." }, { status: 400 });
  }

  try {
    const upload = await validateUpload(file, getUploadLimitBytes());
    return NextResponse.json({ upload });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    const status = error instanceof UploadValidationError ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
