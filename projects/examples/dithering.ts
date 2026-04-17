import {
  createCanvas,
  createPalette,
  fillRect,
  orderedDither,
  rgba,
  samplePalette,
  setPixel,
} from '../../src/index.ts';
import { defineExampleProject, EXAMPLE_RENDER_SIZE } from '../example-project.ts';

const WIDTH = EXAMPLE_RENDER_SIZE;
const HEIGHT = EXAMPLE_RENDER_SIZE;
const palette = createPalette([rgba(18, 24, 38), rgba(69, 95, 118), rgba(160, 183, 196), rgba(240, 244, 247)]);

export const ditheringExampleProject = defineExampleProject({
  id: 'dithering',
  width: EXAMPLE_RENDER_SIZE,
  height: EXAMPLE_RENDER_SIZE,
  render: () => {
    const canvas = createCanvas(WIDTH, HEIGHT, rgba(10, 14, 22));

    fillRect(canvas, 2, 2, WIDTH - 4, HEIGHT - 4, rgba(14, 20, 31));
    fillRect(canvas, 6, 6, WIDTH - 12, HEIGHT - 12, rgba(17, 24, 38));

    for (let y = 10; y < 22; y += 1) {
      for (let x = 8; x < WIDTH - 8; x += 1) {
        const value = (x - 8) / (WIDTH - 17);
        setPixel(canvas, x, y, samplePalette(palette, value));
      }
    }

    for (let y = 26; y < 46; y += 1) {
      for (let x = 8; x < WIDTH - 8; x += 1) {
        const value = (x - 8) / (WIDTH - 17);
        const dithered = orderedDither(value, x, y, palette.length, 4);
        setPixel(canvas, x, y, samplePalette(palette, dithered));
      }
    }

    for (let y = 48; y < 54; y += 1) {
      for (let x = 8; x < WIDTH - 8; x += 1) {
        const gradient = (x - 8) / (WIDTH - 17);
        const dithered = orderedDither(Math.abs(gradient - 0.5) * 2, x, y, palette.length, 4);
        setPixel(canvas, x, y, samplePalette(palette, 1 - dithered));
      }
    }

    for (let index = 0; index < palette.length; index += 1) {
      const swatchX = 10 + index * 11;
      const swatchColor = samplePalette(palette, index / (palette.length - 1));

      fillRect(canvas, swatchX, 56, 8, 4, swatchColor);
    }

    return canvas;
  },
});
