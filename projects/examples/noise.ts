import {
  createCanvas,
  createPalette,
  createValueNoise2D,
  orderedDither,
  rgba,
  sampleFractalNoise2D,
  samplePalette,
  setPixel,
} from '../../src/index.ts';
import { defineExampleProject, EXAMPLE_RENDER_SIZE } from '../example-project.ts';

const WIDTH = EXAMPLE_RENDER_SIZE;
const HEIGHT = EXAMPLE_RENDER_SIZE;
const noise = createValueNoise2D(9041);
const noisePalette = createPalette([rgba(9, 15, 32), rgba(34, 52, 84), rgba(78, 112, 146), rgba(160, 188, 208)]);
const SAMPLE_SCALE_X = 12;
const SAMPLE_SCALE_Y = 10;

export const noiseExampleProject = defineExampleProject({
  id: 'noise',
  width: EXAMPLE_RENDER_SIZE,
  height: EXAMPLE_RENDER_SIZE,
  render: () => {
    const canvas = createCanvas(WIDTH, HEIGHT, rgba(8, 12, 24));

    for (let y = 0; y < HEIGHT; y += 1) {
      for (let x = 0; x < WIDTH; x += 1) {
        const value = sampleFractalNoise2D(noise, x / SAMPLE_SCALE_X + 0.37, y / SAMPLE_SCALE_Y + 1.19, {
          octaves: 3,
          persistence: 0.62,
          lacunarity: 1.85,
        });
        const vignetteX = Math.abs(x - WIDTH / 2) / (WIDTH / 2);
        const highlight = Math.max(0, 1 - y / HEIGHT) * 0.14;
        const normalized = Math.max(0, Math.min(1, value + highlight - vignetteX * 0.08));
        const terraced = Math.round(normalized * 3) / 3;
        const dithered = orderedDither(terraced, x, y, noisePalette.length, 4);

        setPixel(canvas, x, y, samplePalette(noisePalette, dithered));
      }
    }

    return canvas;
  },
});
