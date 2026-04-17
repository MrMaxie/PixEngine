# PixEngine

PixEngine is a code-first pixel art engine. The target workflow is not "generate
an image directly", but "write TypeScript that renders the image".

## Current MVP

The bootstrap in this repository focuses on a small, deterministic core:

- `src/core`: canvas, color helpers, seeded RNG
- `src/api`: pixel-level drawing primitives
- `src/io`: PNG encoding and writing with `pngjs`
- `projects/examples`: deterministic example renders
- `.docs/spec`: durable project context and MVP boundaries

`runtime`, `evaluator`, and the iterative pipeline are documented, but not yet
implemented as code modules.

## Commands

```bash
bun install
bun run check
bun run render:smoke
```

`bun run render:smoke` writes a deterministic PNG to
`.local/renders/smoke.png`.

## Development Notes

- Bun `1.3.x`
- Biome is the single formatter/linter entrypoint
- `.local/` is private workspace state and stays out of git
- `.docs/` is committed as durable project context

## Next Steps

- expand the drawing API beyond the current pixel, line, and rectangle helpers
- define the execution boundary for AI-authored generation code
- add evaluator heuristics and a score-driven iteration loop
