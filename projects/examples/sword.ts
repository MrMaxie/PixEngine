import { createCanvas, createPalette, fillRect, rgba, samplePalette, setPixel, shadePalette } from '../../src/index.ts';
import { defineExampleProject, EXAMPLE_RENDER_SIZE } from '../example-project.ts';

const WIDTH = EXAMPLE_RENDER_SIZE;
const HEIGHT = EXAMPLE_RENDER_SIZE;
const bladePalette = createPalette([rgba(72, 87, 109), rgba(142, 163, 188), rgba(235, 242, 248)]);
const guardPalette = createPalette([rgba(112, 78, 40), rgba(176, 128, 68), rgba(231, 191, 112)]);
const handlePalette = createPalette([rgba(67, 39, 22), rgba(111, 73, 42), rgba(164, 116, 67)]);
const CENTER_X = 31;
const BLADE_TOP = 8;
const BLADE_BOTTOM = 43;
const GUARD_MID = samplePalette(guardPalette, 0.5);
const GUARD_BRIGHT = samplePalette(guardPalette, 1);
const GUARD_DARK = samplePalette(guardPalette, 0);

export const swordExampleProject = defineExampleProject({
  id: 'sword',
  width: EXAMPLE_RENDER_SIZE,
  height: EXAMPLE_RENDER_SIZE,
  render: () => {
    const canvas = createCanvas(WIDTH, HEIGHT);

    for (let y = BLADE_TOP; y <= BLADE_BOTTOM; y += 1) {
      const tipProgress = Math.min(1, (y - BLADE_TOP) / 8);
      const shoulderInset = y > BLADE_BOTTOM - 3 ? 1 : 0;
      const bladeHalfWidth = Math.max(0, Math.min(4, Math.floor(tipProgress * 5)) - shoulderInset);

      for (let x = CENTER_X - bladeHalfWidth; x <= CENTER_X + bladeHalfWidth + 1; x += 1) {
        const width = Math.max(1, bladeHalfWidth * 2 + 1);
        const centeredX = Math.abs(x - (CENTER_X + 0.5)) / width;
        const edgeFalloff = 1 - Math.min(1, centeredX * 2.3);
        const light = Math.max(0, Math.min(1, 0.24 + edgeFalloff * 0.68));

        setPixel(canvas, x, y, shadePalette(bladePalette, light));
      }
    }

    setPixel(canvas, 31, 9, rgba(235, 242, 248));
    setPixel(canvas, 32, 9, rgba(235, 242, 248));
    fillRect(canvas, 23, 43, 18, 2, GUARD_MID);
    fillRect(canvas, 25, 42, 14, 1, GUARD_BRIGHT);
    fillRect(canvas, 26, 45, 12, 2, GUARD_DARK);

    for (let y = 47; y < 59; y += 1) {
      const left = 29;
      const width = 6;

      for (let x = left; x < left + width; x += 1) {
        const grip = ((x + y) % 4) / 3;
        setPixel(canvas, x, y, shadePalette(handlePalette, 0.2 + grip * 0.65));
      }
    }

    fillRect(canvas, 29, 59, 6, 2, GUARD_MID);
    fillRect(canvas, 30, 61, 4, 2, GUARD_BRIGHT);

    return canvas;
  },
});
