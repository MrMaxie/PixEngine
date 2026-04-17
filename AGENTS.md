# PixEngine Agent Guide

PixEngine is a Bun-first TypeScript framework for deterministic pixel-art
rendering.

## Read Order

1. explicit human instruction
2. `.local/AGENTS.md`
3. `.docs/AGENTS.md`
4. `.docs/spec/_toc.md`, then the relevant linked files
5. `.docs/practices/_toc.md`, then the relevant linked files
6. the codebase and current diff

## Working Rules

- use Bun for installs, scripts, and tests
- install dependencies from the terminal with exact versions
- treat `.local/` as private local state and `.docs/` as durable project context
- keep README product-facing; keep durable engineering rules in `.docs/`
- prefer `type` aliases over `interface`
- prefer arrow functions for free functions and object-literal methods
- prefer inferred return types unless TypeScript needs an explicit annotation
- define example projects through `defineExampleProject(...)`
- use Biome as the formatter and linter authority
- use conventional commits without scopes, in the form `type: subject`
