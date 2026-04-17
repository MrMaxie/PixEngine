import { createCanvas, createPalette, fillRect, lambertLight, rgba, setPixel, shadePalette } from '../../src/index.ts';
import { defineExampleProject, EXAMPLE_RENDER_SIZE } from '../example-project.ts';

const WIDTH = EXAMPLE_RENDER_SIZE;
const HEIGHT = EXAMPLE_RENDER_SIZE;
const CENTER_X = 32;
const CENTER_Y = 30;
const RADIUS = 17;

const orbPalette = createPalette([rgba(32, 40, 68), rgba(71, 97, 151), rgba(124, 176, 224), rgba(239, 247, 255)]);

export const shadingExampleProject = defineExampleProject({
  id: 'shading',
  width: EXAMPLE_RENDER_SIZE,
  height: EXAMPLE_RENDER_SIZE,
  render: () => {
    const canvas = createCanvas(WIDTH, HEIGHT);

    for (let y = 44; y < 50; y += 1) {
      const offset = Math.abs(47 - y) * 3;
      fillRect(canvas, 18 + offset, y, 28 - offset * 2, 1, rgba(8, 11, 18, 136));
    }

    for (let y = CENTER_Y - RADIUS; y <= CENTER_Y + RADIUS; y += 1) {
      for (let x = CENTER_X - RADIUS; x <= CENTER_X + RADIUS; x += 1) {
        const dx = (x - CENTER_X) / RADIUS;
        const dy = (y - CENTER_Y) / RADIUS;
        const distance = Math.hypot(dx, dy);

        if (distance > 1) {
          continue;
        }

        const radial = 1 - distance;
        const directLight = distance < 0.001 ? 1 : lambertLight(dx, dy, -0.9, -1, 0.2);
        const light = Math.min(1, directLight * 0.72 + radial * 0.22);

        setPixel(canvas, x, y, shadePalette(orbPalette, light));
      }
    }

    return canvas;
  },
});
