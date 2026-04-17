import {
  createCanvas,
  createColorRamp,
  createPalette,
  fillRect,
  line,
  orderedDither,
  rgba,
  samplePalette,
  setPixel,
  shadeRamp,
} from '../../src/index.ts';
import { defineExampleProject, EXAMPLE_RENDER_SIZE } from '../example-project.ts';

const WIDTH = EXAMPLE_RENDER_SIZE;
const HEIGHT = EXAMPLE_RENDER_SIZE;
const bladeRamp = createColorRamp([rgba(71, 86, 108), rgba(156, 178, 201), rgba(238, 244, 250)]);
const hiltPalette = createPalette([rgba(60, 33, 18), rgba(109, 71, 39), rgba(179, 130, 71)]);

export const swordExampleProject = defineExampleProject({
  id: 'sword',
  width: EXAMPLE_RENDER_SIZE,
  height: EXAMPLE_RENDER_SIZE,
  render: () => {
    const canvas = createCanvas(WIDTH, HEIGHT, rgba(17, 20, 28));

    fillRect(canvas, 3, 3, WIDTH - 6, HEIGHT - 6, rgba(22, 27, 37));

    for (let y = 12; y < 41; y += 1) {
      const bladeHalfWidth = Math.max(1, Math.floor((42 - y) / 3));

      for (let x = 32 - bladeHalfWidth; x <= 31 + bladeHalfWidth; x += 1) {
        const distanceFromCenter = Math.abs(x - 31.5) / Math.max(1, bladeHalfWidth);
        const verticalFade = (41 - y) / 29;
        const light = Math.min(1, 0.2 + verticalFade * 0.45 + (1 - distanceFromCenter) * 0.45);

        setPixel(canvas, x, y, shadeRamp(bladeRamp, light));
      }
    }

    line(canvas, 31, 12, 31, 40, rgba(238, 244, 250));
    line(canvas, 32, 12, 32, 40, rgba(156, 178, 201));
    setPixel(canvas, 31, 9, rgba(235, 242, 248));
    setPixel(canvas, 32, 9, rgba(235, 242, 248));
    setPixel(canvas, 30, 10, rgba(156, 178, 201));
    setPixel(canvas, 33, 10, rgba(156, 178, 201));
    setPixel(canvas, 29, 11, rgba(120, 142, 169));
    setPixel(canvas, 34, 11, rgba(120, 142, 169));
    fillRect(canvas, 22, 40, 20, 3, rgba(180, 138, 72));
    fillRect(canvas, 24, 43, 16, 2, rgba(136, 92, 48));
    fillRect(canvas, 28, 45, 8, 3, rgba(83, 51, 28));

    for (let y = 48; y < 58; y += 1) {
      const handleInset = Math.floor(Math.abs(52.5 - y) / 3);
      const left = 28 + handleInset;
      const width = 8 - handleInset * 2;

      for (let x = left; x < left + width; x += 1) {
        const dithered = orderedDither((x - left) / Math.max(1, width - 1), x, y, hiltPalette.length, 4);

        setPixel(canvas, x, y, samplePalette(hiltPalette, dithered));
      }
    }

    fillRect(canvas, 29, 58, 6, 2, rgba(183, 131, 63));
    fillRect(canvas, 30, 60, 4, 2, rgba(183, 131, 63));

    return canvas;
  },
});
