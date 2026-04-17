import {
  createCanvas,
  createColorRamp,
  createValueNoise2D,
  fillRect,
  rgba,
  sampleFractalNoise2D,
  setPixel,
  shadeRamp,
} from '../../src/index.ts';
import { defineExampleProject, EXAMPLE_RENDER_SIZE } from '../example-project.ts';

const WIDTH = EXAMPLE_RENDER_SIZE;
const HEIGHT = EXAMPLE_RENDER_SIZE;
const canopyNoise = createValueNoise2D(7129);
const foliageRamp = createColorRamp([rgba(26, 56, 28), rgba(57, 105, 55), rgba(102, 153, 76), rgba(181, 214, 129)]);

export const treeExampleProject = defineExampleProject({
  id: 'tree',
  width: EXAMPLE_RENDER_SIZE,
  height: EXAMPLE_RENDER_SIZE,
  render: () => {
    const canvas = createCanvas(WIDTH, HEIGHT, rgba(168, 212, 240));

    fillRect(canvas, 0, 50, WIDTH, 14, rgba(111, 168, 93));
    fillRect(canvas, 27, 33, 10, 23, rgba(94, 60, 34));
    fillRect(canvas, 29, 27, 6, 10, rgba(122, 80, 46));

    for (let y = 8; y < 50; y += 1) {
      for (let x = 8; x < 56; x += 1) {
        const dx = (x - 32) / 18;
        const dy = (y - 26) / 15;
        const distance = Math.hypot(dx, dy);
        const noiseValue = sampleFractalNoise2D(canopyNoise, x / 15 + 0.11, y / 13 + 0.47, {
          octaves: 3,
          persistence: 0.6,
        });
        const shape = 1 - distance + (noiseValue - 0.5) * 0.35;

        if (shape <= 0) {
          continue;
        }

        const light = Math.min(1, 0.25 + (1 - Math.max(0, dy)) * 0.45 + noiseValue * 0.3);

        setPixel(canvas, x, y, shadeRamp(foliageRamp, light));
      }
    }

    fillRect(canvas, 23, 50, 18, 3, rgba(94, 134, 70));
    setPixel(canvas, 24, 24, rgba(181, 214, 129));
    setPixel(canvas, 43, 16, rgba(181, 214, 129));
    setPixel(canvas, 18, 32, rgba(181, 214, 129));

    return canvas;
  },
});
