import { describe, expect, it } from "vitest";
import { UploadValidationError, validateUpload } from "@/lib/upload";

describe("upload validation", () => {
  it("accepts supported images and returns a sha256 id", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "pet.png", { type: "image/png" });
    const result = await validateUpload(file, 1024);

    expect(result.uploadId).toMatch(/^upload_/);
    expect(result.sha256).toHaveLength(64);
    expect(result.mimeType).toBe("image/png");
  });

  it("rejects unsupported files", async () => {
    const file = new File(["hello"], "pet.txt", { type: "text/plain" });
    await expect(validateUpload(file, 1024)).rejects.toBeInstanceOf(UploadValidationError);
  });
});
