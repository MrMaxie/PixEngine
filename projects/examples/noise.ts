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
const detailNoise = createValueNoise2D(4157);
const noisePalette = createPalette([
  rgba(8, 12, 24),
  rgba(27, 42, 69),
  rgba(63, 89, 128),
  rgba(123, 160, 185),
  rgba(218, 233, 239),
]);
const SAMPLE_SCALE_X = 11;
const SAMPLE_SCALE_Y = 9;

export const noiseExampleProject = defineExampleProject({
  id: 'noise',
  width: EXAMPLE_RENDER_SIZE,
  height: EXAMPLE_RENDER_SIZE,
  render: () => {
    const canvas = createCanvas(WIDTH, HEIGHT);

    for (let y = 0; y < HEIGHT; y += 1) {
      for (let x = 0; x < WIDTH; x += 1) {
        const value = sampleFractalNoise2D(noise, x / SAMPLE_SCALE_X + 0.37, y / SAMPLE_SCALE_Y + 1.19, {
          octaves: 4,
          persistence: 0.58,
          lacunarity: 1.92,
        });
        const detail = sampleFractalNoise2D(detailNoise, x / 5.5 + 1.07, y / 5.1 + 0.41, {
          octaves: 2,
          persistence: 0.5,
          lacunarity: 2.1,
        });
        const vignetteX = Math.abs(x - WIDTH / 2) / (WIDTH / 2);
        const vignetteY = Math.abs(y - HEIGHT / 2) / (HEIGHT / 2);
        const contrast = (value - 0.5) * 1.38 + 0.5;
        const highlighted = contrast + (detail - 0.5) * 0.22 - vignetteX * 0.07 - vignetteY * 0.03;
        const normalized = Math.max(0, Math.min(1, highlighted));
        const terraced = Math.round(normalized * (noisePalette.length - 1)) / (noisePalette.length - 1);
        const dithered = orderedDither(terraced, x, y, noisePalette.length, 4);

        setPixel(canvas, x, y, samplePalette(noisePalette, dithered));
      }
    }

    return canvas;
  },
});
