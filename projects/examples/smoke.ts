import { createCanvas, fillRect, line, rgba, setPixel } from '../../src/index.ts';
import { defineExampleProject, EXAMPLE_RENDER_SIZE } from '../example-project.ts';

const SIZE = EXAMPLE_RENDER_SIZE;

export const smokeExampleProject = defineExampleProject({
  id: 'smoke',
  width: EXAMPLE_RENDER_SIZE,
  height: EXAMPLE_RENDER_SIZE,
  render: () => {
    const canvas = createCanvas(SIZE, SIZE, rgba(22, 28, 45));

    fillRect(canvas, 4, 4, SIZE - 8, SIZE - 8, rgba(35, 43, 67));
    fillRect(canvas, 8, 8, SIZE - 16, SIZE - 16, rgba(28, 35, 56));
    fillRect(canvas, 18, 18, 28, 28, rgba(228, 232, 240));
    fillRect(canvas, 24, 24, 16, 16, rgba(88, 190, 124));

    for (let y = 10; y < 54; y += 1) {
      const inset = Math.abs(32 - y) / 3;

      fillRect(canvas, Math.floor(12 + inset), y, Math.max(1, Math.ceil(40 - inset * 2)), 1, rgba(41, 50, 76, 110));
    }

    for (let y = 18; y < 46; y += 1) {
      for (let x = 18; x < 46; x += 1) {
        const dx = (x - 32) / 13;
        const dy = (y - 31) / 11;
        const distance = Math.hypot(dx, dy);

        if (distance > 1) {
          continue;
        }

        const ring = Math.max(0, 1 - distance);
        const color = ring > 0.58 ? rgba(235, 239, 246) : ring > 0.32 ? rgba(191, 201, 219) : rgba(126, 141, 170);
        setPixel(canvas, x, y, color);
      }
    }

    fillRect(canvas, 29, 28, 6, 8, rgba(76, 187, 118));
    fillRect(canvas, 27, 30, 10, 4, rgba(76, 187, 118));
    fillRect(canvas, 30, 25, 4, 14, rgba(94, 208, 137));
    line(canvas, 0, 0, SIZE - 1, SIZE - 1, rgba(255, 189, 89));
    line(canvas, SIZE - 1, 0, 0, SIZE - 1, rgba(255, 110, 90));

    return canvas;
  },
});

export const renderSmokeExample = () => smokeExampleProject.render();
