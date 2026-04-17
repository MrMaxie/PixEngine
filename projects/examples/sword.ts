import {
  createCanvas,
  createColorRamp,
  createPalette,
  fillRect,
  orderedDither,
  rgba,
  samplePalette,
  setPixel,
  shadeRamp,
} from '../../src/index.ts';
import { defineExampleProject } from '../example-project.ts';

const WIDTH = 20;
const HEIGHT = 20;
const bladeRamp = createColorRamp([rgba(71, 86, 108), rgba(156, 178, 201), rgba(238, 244, 250)]);
const hiltPalette = createPalette([rgba(60, 33, 18), rgba(109, 71, 39), rgba(179, 130, 71)]);

export const swordExampleProject = defineExampleProject({
  id: 'sword',
  width: WIDTH,
  height: HEIGHT,
  render: () => {
    const canvas = createCanvas(WIDTH, HEIGHT, rgba(17, 20, 28));

    fillRect(canvas, 1, 1, WIDTH - 2, HEIGHT - 2, rgba(22, 27, 37));
    fillRect(canvas, 9, 4, 2, 9, rgba(90, 108, 132));

    for (let y = 4; y < 13; y += 1) {
      for (let x = 8; x < 12; x += 1) {
        const distanceFromCenter = Math.abs(x - 9.5) / 1.5;
        const verticalFade = (13 - y) / 9;
        const light = Math.min(1, 0.2 + verticalFade * 0.4 + (1 - distanceFromCenter) * 0.5);

        setPixel(canvas, x, y, shadeRamp(bladeRamp, light));
      }
    }

    setPixel(canvas, 9, 2, rgba(235, 242, 248));
    setPixel(canvas, 10, 2, rgba(235, 242, 248));
    setPixel(canvas, 8, 3, rgba(156, 178, 201));
    setPixel(canvas, 11, 3, rgba(156, 178, 201));
    fillRect(canvas, 6, 12, 8, 1, rgba(180, 138, 72));
    fillRect(canvas, 8, 13, 4, 1, rgba(136, 92, 48));
    fillRect(canvas, 8, 14, 4, 3, rgba(83, 51, 28));

    for (let y = 14; y < 17; y += 1) {
      for (let x = 8; x < 12; x += 1) {
        const dithered = orderedDither((x - 8) / 3, x, y, hiltPalette.length, 4);

        setPixel(canvas, x, y, samplePalette(hiltPalette, dithered));
      }
    }

    fillRect(canvas, 8, 17, 4, 1, rgba(183, 131, 63));
    setPixel(canvas, 9, 18, rgba(183, 131, 63));
    setPixel(canvas, 10, 18, rgba(183, 131, 63));

    return canvas;
  },
});
