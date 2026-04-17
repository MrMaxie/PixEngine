# PixEngine

PixEngine is a code-first pixel art engine. The target workflow is not "generate
an image directly", but "write TypeScript that renders the image".

## Current MVP

The current MVP is still a deterministic rendering-first foundation, but it now
has enough reusable surface to behave like a small framework:

- `src/core`: canvas, color helpers, seeded RNG, deterministic value noise
- `src/color`: palettes, ramps, quantization, and shading helpers
- `src/effects`: ordered Bayer dithering
- `src/api`: pixel-level drawing primitives
- `src/io`: PNG encoding and writing with `pngjs`
- `projects`: named example projects, registry, and reusable render runners
- `tests/golden`: committed PNG fixtures for visual regression coverage

`runtime`, `evaluator`, and the iterative pipeline are still documented but not
yet implemented as code modules.

## Commands

```bash
bun install
bun run check
bun run render:smoke
bun run render:project sword
bun run render:all
bun run refresh:goldens
```

Rendered examples are written to `.results/renders/<id>.png`. Golden fixtures are
stored under `tests/golden/`.

## Development Notes

- Bun `1.3.x`
- Biome is the single formatter/linter entrypoint
- `.local/` is private Lotus workspace state and stays out of git
- `.results/` holds local generated output and stays out of git
- `.docs/` is committed as durable project context

## Examples

The registry currently ships with these deterministic projects:

- `smoke`
- `dithering`
- `shading`
- `noise`
- `sword`
- `tree`

## Next Steps

- expand the drawing API with more reusable shape and composition primitives
- define the execution boundary for AI-authored generation code
- add evaluator heuristics and a score-driven iteration loop
