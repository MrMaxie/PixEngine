import { createCanvas, createColorRamp, fillRect, lambertLight, rgba, setPixel, shadeRamp } from '../../src/index.ts';
import { defineExampleProject, EXAMPLE_RENDER_SIZE } from '../example-project.ts';

const WIDTH = EXAMPLE_RENDER_SIZE;
const HEIGHT = EXAMPLE_RENDER_SIZE;
const CENTER_X = 32;
const CENTER_Y = 28;
const RADIUS = 20;

const orbRamp = createColorRamp([rgba(33, 40, 65), rgba(66, 92, 143), rgba(121, 182, 233), rgba(235, 245, 255)]);

export const shadingExampleProject = defineExampleProject({
  id: 'shading',
  width: EXAMPLE_RENDER_SIZE,
  height: EXAMPLE_RENDER_SIZE,
  render: () => {
    const canvas = createCanvas(WIDTH, HEIGHT, rgba(14, 18, 29));

    fillRect(canvas, 3, 3, WIDTH - 6, HEIGHT - 6, rgba(20, 26, 42));

    for (let y = 6; y < HEIGHT - 8; y += 1) {
      for (let x = 6; x < WIDTH - 6; x += 1) {
        const dx = (x - CENTER_X) / RADIUS;
        const dy = (y - CENTER_Y) / RADIUS;
        const distance = Math.hypot(dx, dy);

        if (distance > 1) {
          continue;
        }

        const radial = 1 - distance;
        const directLight = distance < 0.001 ? 1 : lambertLight(dx, dy, -0.8, -1, 0.15);
        const light = Math.min(1, directLight * 0.75 + radial * 0.35);

        setPixel(canvas, x, y, shadeRamp(orbRamp, light));
      }
    }

    for (let y = 43; y < 49; y += 1) {
      const shadowInset = Math.abs(46 - y) * 2;

      fillRect(canvas, 18 + shadowInset, y, 28 - shadowInset * 2, 1, rgba(10, 13, 20, 180));
    }

    return canvas;
  },
});
