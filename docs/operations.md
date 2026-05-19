# Operations

## Modes

`mock` mode is the default and is deterministic for local validation. It derives a palette and frame offsets from the uploaded file metadata, requested mood, and frame count.

`real` mode is intentionally behind `PET_GENERATE_MODE=real` and `OPENAI_API_KEY`. The route returns a controlled `503` if the key is missing. This prevents accidental production calls during benchmark runs.

## Input limits

- Accepted MIME types: `image/png`, `image/jpeg`, `image/webp`, `image/gif`
- Default max size: `8 MB`
- Upload validation runs server-side in `/api/upload`

## Export contract

- `/api/export/sprite-sheet` accepts the current frame payload and returns a PNG sprite sheet.
- `/api/export/manifest` accepts the same payload and returns JSON metadata.

## Evidence

Record validation output, browser screenshots, and generated artifacts in the benchmark lane evidence directory:

`/Users/qts/bench/pet-generate/pet_1-lhp/evidence`
