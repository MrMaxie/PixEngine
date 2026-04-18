# PixEngine

## About & Why

PixEngine is a code-first TypeScript framework for deterministic
pixel-art rendering. The intended workflow is not "generate a bitmap directly",
but "write TypeScript that renders the image".

The project exists to explore a practical middle ground between graphics code,
repeatable tooling, and future AI-assisted generation workflows. Pixel art is a
good fit for that goal: outputs are compact, easy to inspect, and easy to
regression-test. What starts as a small rendering foundation can grow into a
more capable framework for building reusable generators, validating their
outputs, and evolving them without losing determinism.

## Examples

The rendered examples are part of the visual regression suite. Each preview
below is a committed golden image, and each source file is the generator used
to produce it.

| Preview | What it tests | Source |
| --- | --- | --- |
| ![Aurora example](./tests/golden/aurora.png) | Layer composition, live derived layers, masks, blend modes, palette refs, and lazy effects. | [`projects/examples/aurora.ts`](./projects/examples/aurora.ts) |
| ![Smoke example](./tests/golden/smoke.png) | Basic composition setup, fills, direct pixel writes, alpha layering, and line drawing. | [`projects/examples/smoke.ts`](./projects/examples/smoke.ts) |
| ![Dithering example](./tests/golden/dithering.png) | Palette sampling and ordered dithering across deterministic gradients. | [`projects/examples/dithering.ts`](./projects/examples/dithering.ts) |
| ![Shading example](./tests/golden/shading.png) | Palette shading and simple Lambert-style lighting on a single form. | [`projects/examples/shading.ts`](./projects/examples/shading.ts) |
| ![Noise example](./tests/golden/noise.png) | Seeded value noise, fractal sampling, terracing, and dithered palette mapping. | [`projects/examples/noise.ts`](./projects/examples/noise.ts) |
| ![Sword example](./tests/golden/sword.png) | Sprite-style composition with reusable drawing primitives and palette-based shading. | [`projects/examples/sword.ts`](./projects/examples/sword.ts) |
| ![Tree example](./tests/golden/tree.png) | Layered scene construction with noise, shading, dithering, and repeated palette use. | [`projects/examples/tree.ts`](./projects/examples/tree.ts) |

## Details

PixEngine currently focuses on deterministic rendering primitives, reusable
example projects, palette-aware composition authoring, and PNG output. The
repository is organized around a small set of composable modules instead of a
monolithic runtime.

### Requirements

- Bun `1.3.x`
- TypeScript `6`
- Biome as the formatter and linter authority

### Repository Layout

- `src/core` - low-level canvas primitives, blending, colors, seeded RNG, and noise helpers
- `src/color` - palettes, palette loaders, ramps, quantization, and shading helpers
- `src/composition` - `Composition`/`Layer` authoring, deferred drawing ops, selectors, masks, and effects
- `src/effects` - image-space effects such as ordered Bayer dithering
- `src/io` - PNG encoding and file output
- `projects` - example project definitions, registry, and render runners
- `tests` - unit tests and golden-image regression coverage
- `.docs` - durable engineering context kept in the repository
- `.results` - local generated output kept out of git

### Commands

```bash
# format code and docs with Biome
bun run format

# lint project files without writing changes
bun run lint

# run the TypeScript type checker
bun run typecheck

# run linting, typechecking, and the full test suite
bun run check

# render the smoke example into .results/renders
bun run render:smoke

# render one named example into .results/renders
bun run render:project sword

# render every registered example into .results/renders
bun run render:all
```

## Testing

PixEngine uses both regular unit tests and golden-image regression tests. The
unit tests cover the low-level rendering pieces such as canvas operations,
composition/layer behavior, selectors, palettes, noise, dithering, and PNG
encoding. The example projects are tested by rendering them and comparing the
output byte-for-byte with committed fixtures in `tests/golden/`.

When a rendering change is intentional, refresh the committed golden fixtures,
review the image diff, and then run the test suite again.

```bash
# run the full test suite
bun test

# run the full local quality gate
bun run check

# refresh committed golden PNG fixtures after an intentional visual change
bun run refresh:goldens
```

## License

PixEngine is licensed under the Apache License 2.0. See [LICENSE](./LICENSE)
for the full text.
