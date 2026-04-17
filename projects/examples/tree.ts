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
import { defineExampleProject } from '../example-project.ts';

const WIDTH = 24;
const HEIGHT = 24;
const canopyNoise = createValueNoise2D(7129);
const foliageRamp = createColorRamp([rgba(26, 56, 28), rgba(57, 105, 55), rgba(102, 153, 76), rgba(181, 214, 129)]);

export const treeExampleProject = defineExampleProject({
  id: 'tree',
  width: WIDTH,
  height: HEIGHT,
  render: () => {
    const canvas = createCanvas(WIDTH, HEIGHT, rgba(168, 212, 240));

    fillRect(canvas, 0, 18, WIDTH, 6, rgba(111, 168, 93));
    fillRect(canvas, 10, 14, 4, 8, rgba(94, 60, 34));
    fillRect(canvas, 11, 12, 2, 3, rgba(122, 80, 46));

    for (let y = 3; y < 18; y += 1) {
      for (let x = 3; x < 21; x += 1) {
        const dx = (x - 12) / 7.5;
        const dy = (y - 10) / 6.5;
        const distance = Math.hypot(dx, dy);
        const noiseValue = sampleFractalNoise2D(canopyNoise, x / 7 + 0.11, y / 6 + 0.47, {
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

    setPixel(canvas, 9, 13, rgba(181, 214, 129));
    setPixel(canvas, 15, 9, rgba(181, 214, 129));

    return canvas;
  },
});
