import {
  createCanvas,
  createPalette,
  createValueNoise2D,
  fillRect,
  orderedDither,
  rgba,
  sampleFractalNoise2D,
  samplePalette,
  setPixel,
  shadePalette,
} from '../../src/index.ts';
import { defineExampleProject, EXAMPLE_RENDER_SIZE } from '../example-project.ts';

const WIDTH = EXAMPLE_RENDER_SIZE;
const HEIGHT = EXAMPLE_RENDER_SIZE;
const canopyNoise = createValueNoise2D(7129);
const groundNoise = createValueNoise2D(3221);
const foliagePalette = createPalette([rgba(28, 59, 30), rgba(59, 106, 55), rgba(108, 157, 79), rgba(187, 218, 132)]);
const grassPalette = createPalette([rgba(96, 143, 72), rgba(124, 171, 88), rgba(156, 196, 110)]);
const barkPalette = createPalette([rgba(85, 54, 31), rgba(118, 77, 45), rgba(156, 108, 67)]);
const FOLIAGE_BRIGHT = samplePalette(foliagePalette, 1);
const FOLIAGE_MID = samplePalette(foliagePalette, 2 / 3);

export const treeExampleProject = defineExampleProject({
  id: 'tree',
  width: EXAMPLE_RENDER_SIZE,
  height: EXAMPLE_RENDER_SIZE,
  render: () => {
    const canvas = createCanvas(WIDTH, HEIGHT);

    for (let y = 48; y < HEIGHT; y += 1) {
      for (let x = 0; x < WIDTH; x += 1) {
        const base = sampleFractalNoise2D(groundNoise, x / 9 + 0.14, y / 7 + 0.26, {
          octaves: 2,
          persistence: 0.5,
          lacunarity: 2,
        });
        const tone = orderedDither(base * 0.75 + (1 - (y - 48) / 15) * 0.15, x, y, grassPalette.length, 4);
        setPixel(canvas, x, y, shadePalette(grassPalette, tone));
      }
    }

    for (let y = 47; y < 53; y += 1) {
      const offset = Math.abs(50 - y) * 3;
      fillRect(canvas, 20 + offset, y, 24 - offset * 2, 1, rgba(23, 52, 21, 136));
    }

    for (let y = 30; y < 56; y += 1) {
      const trunkInset = y < 36 ? 1 : 0;

      for (let x = 27 + trunkInset; x < 37 - trunkInset; x += 1) {
        const barkLight = 0.22 + (1 - Math.abs(x - 31.5) / 5) * 0.65 - (y - 30) / 40;
        setPixel(canvas, x, y, shadePalette(barkPalette, barkLight));
      }
    }

    for (let y = 24; y < 34; y += 1) {
      for (let x = 29; x < 35; x += 1) {
        const branchLight = 0.28 + (1 - Math.abs(x - 31.5) / 3) * 0.55;
        setPixel(canvas, x, y, shadePalette(barkPalette, branchLight));
      }
    }

    for (let y = 8; y < 50; y += 1) {
      for (let x = 8; x < 56; x += 1) {
        const dx = (x - 32) / 18;
        const dy = (y - 26) / 15;
        const distance = Math.hypot(dx, dy);
        const noiseValue = sampleFractalNoise2D(canopyNoise, x / 15 + 0.11, y / 13 + 0.47, {
          octaves: 3,
          persistence: 0.6,
        });
        const shape = 1 - distance + (noiseValue - 0.5) * 0.28;

        if (shape <= 0) {
          continue;
        }

        const light = Math.max(0, Math.min(1, 0.18 + (1 - Math.max(0, dy)) * 0.44 + noiseValue * 0.18 - dx * 0.05));

        setPixel(canvas, x, y, shadePalette(foliagePalette, light));
      }
    }

    setPixel(canvas, 24, 24, FOLIAGE_BRIGHT);
    setPixel(canvas, 43, 16, FOLIAGE_BRIGHT);
    setPixel(canvas, 18, 32, FOLIAGE_BRIGHT);
    setPixel(canvas, 36, 20, FOLIAGE_MID);
    setPixel(canvas, 40, 29, FOLIAGE_MID);

    return canvas;
  },
});
