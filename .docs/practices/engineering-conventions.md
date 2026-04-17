# Engineering Conventions

## Runtime and Package Management

- PixEngine is Bun-first.
- Use Bun for installs, script execution, and tests.
- Install dependencies from the terminal with exact versions.
- Prefer `bun add --exact` and `bun add --exact --dev` over manual dependency
  edits.

## TypeScript Style

- prefer `type` aliases over `interface`
- prefer arrow functions for free functions and object-literal methods
- keep classes when they are the right model; do not convert class methods to
  arrow fields just to satisfy the free-function style
- prefer inferred return types unless TypeScript needs an explicit annotation,
  such as type predicates or difficult inference boundaries
- use single quotes in code
- define example projects with `defineExampleProject(...)` instead of annotating
  object literals with `ExampleProject`

## Formatting and Validation

- Biome is the single formatter and linter authority
- run formatting and tests before committing
- keep docs and code aligned with the Bun-first workflow and repository
  conventions

## Commit Policy

- use conventional commits without scopes
- valid example: `feat: add example project helper`
- invalid example: `feat(projects): add example project helper`
- Husky runs formatting and tests in `pre-commit`
- Husky runs commitlint in `commit-msg`
