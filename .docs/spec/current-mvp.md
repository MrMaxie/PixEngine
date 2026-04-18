# Current MVP

## In Scope

- a deterministic low-level `Canvas`
- a composition-first authoring API with `Composition` and `Layer`
- basic color normalization helpers
- a seeded random source for future controlled variation
- reusable palette, palette-loader, color ramp, quantization, and shading helpers
- deterministic 2D value noise sampling
- ordered Bayer dithering as a reusable effect
- deferred drawing operations on layers, including pixels, rectangles, lines, curves, and flood fill
- live layer effects such as borders, selectors, masks, and gradients
- live derived layers via boolean combination and masking
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

The public TypeScript surface now covers composition authoring, low-level
canvas export, reusable rendering helpers for color selection, shading,
dithering, and procedural sampling in addition to the PNG path. Broader system
concerns such as execution control, evaluation, and iterative orchestration
still stay out of code until the rendering foundation proves stable.
