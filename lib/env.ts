export type GeneratorMode = "mock" | "real";

export function getGeneratorMode(): GeneratorMode {
  return process.env.PET_GENERATE_MODE === "real" ? "real" : "mock";
}

export function getUploadLimitBytes(): number {
  const configured = Number(process.env.PET_GENERATE_MAX_UPLOAD_MB ?? "8");
  const safeMb = Number.isFinite(configured) && configured > 0 ? configured : 8;
  return safeMb * 1024 * 1024;
}
