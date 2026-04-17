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
import { defineExampleProject } from '../example-project.ts';

const WIDTH = 32;
const HEIGHT = 20;
const noise = createValueNoise2D(9041);
const noisePalette = createPalette([rgba(9, 15, 32), rgba(34, 52, 84), rgba(78, 112, 146), rgba(160, 188, 208)]);
const BLOCK_SIZE = 2;
const SAMPLE_SCALE_X = 5.5;
const SAMPLE_SCALE_Y = 4.5;

export const noiseExampleProject = defineExampleProject({
  id: 'noise',
  width: WIDTH,
  height: HEIGHT,
  render: () => {
    const canvas = createCanvas(WIDTH, HEIGHT, rgba(8, 12, 24));

    for (let y = 0; y < HEIGHT; y += 1) {
      for (let x = 0; x < WIDTH; x += 1) {
        const clusterX = Math.floor(x / BLOCK_SIZE);
        const clusterY = Math.floor(y / BLOCK_SIZE);
        const value = sampleFractalNoise2D(noise, clusterX / SAMPLE_SCALE_X + 0.37, clusterY / SAMPLE_SCALE_Y + 1.19, {
          octaves: 3,
          persistence: 0.62,
          lacunarity: 1.85,
        });
        const highlight = Math.max(0, 1 - clusterY / (HEIGHT / BLOCK_SIZE)) * 0.12;
        const terraced = Math.round(Math.min(1, value + highlight) * 3) / 3;
        const dithered = orderedDither(terraced, x, y, noisePalette.length, 4);
        const color = samplePalette(noisePalette, dithered);

        setPixel(canvas, x, y, color);
      }
    }

    return canvas;
  },
});
