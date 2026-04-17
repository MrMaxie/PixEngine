# Project Overview

PixEngine is a system where AI writes TypeScript that generates pixel art rather
than producing pixel data directly.

## Core Loop

1. AI authors code against a constrained drawing API.
2. The code is executed to render a PNG pixel by pixel.
3. The output is evaluated for quality and usefulness.
4. AI iterates on the code based on the result.

## Why This Exists

Pixel art benefits from deterministic, pixel-accurate control:

- strict palette usage
- explicit structure and silhouettes
- reproducible outputs
- natural enforcement of constraints through code
