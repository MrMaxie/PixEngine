# Current MVP

## In Scope

- a deterministic pixel canvas
- basic color normalization helpers
- a seeded random source for future controlled variation
- reusable palette, color ramp, quantization, and shading helpers
- deterministic 2D value noise sampling
- ordered Bayer dithering as a reusable effect
- a minimal drawing API with `setPixel`, `line`, and `fillRect`
- PNG encoding and file writing with `pngjs`
- named deterministic example projects under `projects/examples`
- project registry and render runners for single-project and all-project output
- committed golden PNG fixtures for render regression tests

## Deferred Areas

The following areas are intentionally documented but not implemented yet:

- `runtime`: execution boundary for AI-authored code
- `evaluator`: scoring heuristics for palette, noise, structure, and similar
- `pipeline`: orchestrating generate -> render -> score -> refine

## Working Boundary

The public TypeScript surface now covers reusable rendering helpers for color
selection, shading, dithering, and procedural sampling in addition to the core
canvas and PNG path. Broader system concerns such as execution control,
evaluation, and iterative orchestration still stay out of code until the
rendering foundation proves stable.
