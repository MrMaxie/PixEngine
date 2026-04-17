import { createCanvas, createColorRamp, fillRect, lambertLight, rgba, setPixel, shadeRamp } from '../../src/index.ts';
import { defineExampleProject } from '../example-project.ts';

const WIDTH = 24;
const HEIGHT = 24;
const CENTER_X = 12;
const CENTER_Y = 11;
const RADIUS = 8;

const orbRamp = createColorRamp([rgba(33, 40, 65), rgba(66, 92, 143), rgba(121, 182, 233), rgba(235, 245, 255)]);

export const shadingExampleProject = defineExampleProject({
  id: 'shading',
  width: WIDTH,
  height: HEIGHT,
  render: () => {
    const canvas = createCanvas(WIDTH, HEIGHT, rgba(14, 18, 29));

    fillRect(canvas, 1, 1, WIDTH - 2, HEIGHT - 2, rgba(20, 26, 42));

    for (let y = 3; y < HEIGHT - 3; y += 1) {
      for (let x = 3; x < WIDTH - 3; x += 1) {
        const dx = (x - CENTER_X) / RADIUS;
        const dy = (y - CENTER_Y) / RADIUS;
        const distance = Math.hypot(dx, dy);

        if (distance > 1) {
          continue;
        }

        const radial = 1 - distance;
        const directLight = distance < 0.001 ? 1 : lambertLight(dx, dy, -0.8, -1, 0.15);
        const light = Math.min(1, directLight * 0.75 + radial * 0.35);
        const color = shadeRamp(orbRamp, light);

        setPixel(canvas, x, y, color);
      }
    }

    fillRect(canvas, 8, 18, 8, 2, rgba(10, 13, 20));
    fillRect(canvas, 9, 19, 6, 1, rgba(7, 9, 14));

    return canvas;
  },
});
