import {
  createCanvas,
  createColorRamp,
  createValueNoise2D,
  rgba,
  sampleFractalNoise2D,
  setPixel,
  shadeRamp,
} from '../../src/index.ts';
import { defineExampleProject } from '../example-project.ts';

const WIDTH = 32;
const HEIGHT = 20;
const noise = createValueNoise2D(9041);
const noiseRamp = createColorRamp([rgba(9, 15, 32), rgba(36, 63, 99), rgba(88, 135, 168), rgba(229, 240, 248)]);

export const noiseExampleProject = defineExampleProject({
  id: 'noise',
  width: WIDTH,
  height: HEIGHT,
  render: () => {
    const canvas = createCanvas(WIDTH, HEIGHT, rgba(8, 12, 24));

    for (let y = 0; y < HEIGHT; y += 1) {
      for (let x = 0; x < WIDTH; x += 1) {
        const value = sampleFractalNoise2D(noise, x / 11 + 0.37, y / 8 + 1.19, {
          octaves: 4,
          persistence: 0.55,
        });
        const highlight = Math.max(0, 1 - y / HEIGHT) * 0.15;
        const color = shadeRamp(noiseRamp, Math.min(1, value + highlight));

        setPixel(canvas, x, y, color);
      }
    }

    return canvas;
  },
});
