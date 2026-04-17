import { createCanvas, createPalette, orderedDither, rgba, samplePalette, setPixel } from '../../src/index.ts';
import { defineExampleProject, EXAMPLE_RENDER_SIZE } from '../example-project.ts';

const WIDTH = EXAMPLE_RENDER_SIZE;
const HEIGHT = EXAMPLE_RENDER_SIZE;
const palette = createPalette([rgba(16, 22, 34), rgba(62, 88, 112), rgba(153, 180, 196), rgba(241, 245, 248)]);
const SECTION_HEIGHTS = [20, 24, 20] as const;

export const ditheringExampleProject = defineExampleProject({
  id: 'dithering',
  width: EXAMPLE_RENDER_SIZE,
  height: EXAMPLE_RENDER_SIZE,
  render: () => {
    const canvas = createCanvas(WIDTH, HEIGHT);
    let sectionStartY = 0;

    for (let index = 0; index < SECTION_HEIGHTS.length; index += 1) {
      const sectionHeight = SECTION_HEIGHTS[index];

      if (sectionHeight === undefined) {
        continue;
      }

      const sectionEndY = sectionStartY + sectionHeight;

      for (let y = sectionStartY; y < sectionEndY; y += 1) {
        const localY = y - sectionStartY;

        for (let x = 0; x < WIDTH; x += 1) {
          const horizontal = x / (WIDTH - 1);
          const vertical = sectionHeight <= 1 ? 0 : localY / (sectionHeight - 1);
          const diagonal = Math.min(1, Math.max(0, horizontal * 0.82 + vertical * 0.18));
          let tone = diagonal;

          if (index === 1) {
            tone = orderedDither(diagonal, x, y, palette.length, 4);
          }

          if (index === 2) {
            const mirrored = 1 - Math.abs(horizontal - 0.5) * 2;
            const blended = Math.max(0, Math.min(1, mirrored * 0.8 + vertical * 0.2));
            tone = orderedDither(blended, x, y, palette.length, 4);
          }

          setPixel(canvas, x, y, samplePalette(palette, tone));
        }
      }

      sectionStartY = sectionEndY;
    }

    return canvas;
  },
});
