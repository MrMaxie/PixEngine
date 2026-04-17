# Current MVP

## In Scope

- a deterministic pixel canvas
- basic color normalization helpers
- a seeded random source for future controlled variation
- a minimal drawing API with `setPixel`, `line`, and `fillRect`
- PNG encoding and file writing with `pngjs`
- one deterministic smoke render under `projects/examples`

## Deferred Areas

The following areas are intentionally documented but not implemented yet:

- `runtime`: execution boundary for AI-authored code
- `evaluator`: scoring heuristics for palette, noise, structure, and similar
- `pipeline`: orchestrating generate -> render -> score -> refine

## Working Boundary

The initial public TypeScript surface only exposes what is needed to create a
canvas, draw on it, and write the result to PNG. Broader system concerns should
stay out of code until the first rendering foundation proves stable.
