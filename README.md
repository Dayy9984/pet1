# Pet Generate

Pet Generate is currently reset to a UI-only benchmark starting point.

This repository intentionally contains only the static Next.js UI mock. Upload handling, generation, export, validation, persistence, tests, and production behavior must be implemented by the assigned harness from the Linear ticket set.

## Run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## Verify

```bash
npm run typecheck
npm run build
```

## LHP lane

This repository is the `pet1` LHP Harness lane. The implementation must be produced by the LHP harness command flow, not by manual direct implementation.

Linear ticket set:

- AGE-548, AGE-580: foundation and domain contract
- AGE-549, AGE-581: upload API and pixel generation pipeline
- AGE-550, AGE-582: upload controls and result gallery
- AGE-553, AGE-583: animation preview and export APIs
- AGE-554, AGE-584: real/mock adapter, error handling, operations docs
- AGE-555, AGE-585: unit, integration, E2E, evidence

The UI mock is the visual source of truth for the autonomous harness run.
