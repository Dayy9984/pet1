import { expect, test } from "@playwright/test";

test("generates a sprite set from an uploaded image", async ({ page }) => {
  await page.goto("/");

  const fileBuffer = Buffer.from("fake png bytes");
  await page.getByLabel("Generation options").getByRole("button", { name: "cool" }).click();
  await page.getByLabel("Toggle frame count").click();
  await page.setInputFiles("input[type=file]", {
    name: "pet.png",
    mimeType: "image/png",
    buffer: fileBuffer
  });

  await expect(page.getByText("Sprite set ready.")).toBeVisible();
  await expect(page.getByLabel("Generated sprite frames").locator(".frame-tile")).toHaveCount(8);
  await expect(page.getByRole("button", { name: "sprite-sheet.png" })).toBeVisible();
  await expect(page.getByRole("button", { name: "manifest.json" })).toBeVisible();
});
