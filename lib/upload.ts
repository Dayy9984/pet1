import { createHash } from "node:crypto";
import type { UploadResult } from "./pet-contract";

const allowedMimeTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}

export async function validateUpload(file: File, maxBytes: number): Promise<UploadResult> {
  if (!allowedMimeTypes.has(file.type)) {
    throw new UploadValidationError("Only PNG, JPEG, WebP, and GIF images are supported.");
  }

  if (file.size <= 0) {
    throw new UploadValidationError("The selected image is empty.");
  }

  if (file.size > maxBytes) {
    throw new UploadValidationError(`The selected image exceeds the ${Math.round(maxBytes / 1024 / 1024)} MB limit.`);
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const sha256 = createHash("sha256").update(bytes).digest("hex");

  return {
    uploadId: `upload_${sha256.slice(0, 16)}`,
    name: file.name,
    mimeType: file.type,
    size: file.size,
    sha256
  };
}
