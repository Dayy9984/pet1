# Pet Generate

Pet Generate converts an uploaded image into a compact pixel sprite set with mood variants, animation preview, and export files.

## Run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## Verify

```bash
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

## Environment

- `PET_GENERATE_MODE=mock`: deterministic local generator. Default.
- `PET_GENERATE_MODE=real`: reserved adapter mode for an image-generation backend. Requires `OPENAI_API_KEY`; otherwise the API returns a controlled error.
- `PET_GENERATE_MAX_UPLOAD_MB=8`: upload limit.

## LHP lane

This repository is the `pet1` LHP Harness lane.

Linear ticket set:

- AGE-548, AGE-580: foundation and domain contract
- AGE-549, AGE-581: upload API and pixel generation pipeline
- AGE-550, AGE-582: upload controls and result gallery
- AGE-553, AGE-583: animation preview and export APIs
- AGE-554, AGE-584: real/mock adapter, error handling, operations docs
- AGE-555, AGE-585: unit, integration, E2E, evidence

The implementation keeps the UI-only reference as the visual source of truth and does not include code from the Google Drive reference project.
