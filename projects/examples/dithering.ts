import { Composition, createPalette, paletteColor, rgba, type Selector } from '../../src/index.ts';
import { defineExampleProject, EXAMPLE_RENDER_SIZE } from '../example-project.ts';

const WIDTH = EXAMPLE_RENDER_SIZE;
const HEIGHT = EXAMPLE_RENDER_SIZE;
const SECTION_HEIGHTS = [20, 24, 20] as const;
const VISIBLE_PIXELS: Selector = {
  type: 'channels',
  a: {
    min: 1,
  },
};

const tonalPalette = createPalette([
  { name: 'shadow', color: rgba(16, 22, 34) },
  { name: 'mid-dark', color: rgba(62, 88, 112) },
  { name: 'mid-light', color: rgba(153, 180, 196) },
  { name: 'highlight', color: rgba(241, 245, 248) },
]);

export const ditheringExampleProject = defineExampleProject({
  id: 'dithering',
  width: EXAMPLE_RENDER_SIZE,
  height: EXAMPLE_RENDER_SIZE,
  render: () => {
    const composition = new Composition({
      width: WIDTH,
      height: HEIGHT,
      palettes: [
        {
          id: 'tones',
          palette: tonalPalette,
        },
      ],
    });

    const [smoothHeight = 20, ditheredHeight = 24, steppedHeight = 20] = SECTION_HEIGHTS;
    const smooth = composition.createLayer({ id: 'smooth-gradient' });

    smooth.fillRect(0, 0, WIDTH, smoothHeight, paletteColor('tones', 'shadow'));
    smooth.gradient({
      selector: VISIBLE_PIXELS,
      from: paletteColor('tones', 'shadow'),
      to: paletteColor('tones', 'highlight'),
      start: { x: 0, y: 0 },
      end: { x: WIDTH - 1, y: smoothHeight - 1 },
      mode: 'smooth',
    });

    const dithered = composition.createLayer({ id: 'palette-dither' });
    const ditheredStartY = smoothHeight;

    dithered.fillRect(0, ditheredStartY, WIDTH, ditheredHeight, paletteColor('tones', 'shadow'));
    dithered.gradient({
      selector: VISIBLE_PIXELS,
      palette: 'tones',
      mode: 'palette',
      dither: { matrixSize: 4 },
      start: { x: 0, y: ditheredStartY },
      end: { x: WIDTH - 1, y: ditheredStartY + ditheredHeight - 1 },
    });

    const stepped = composition.createLayer({ id: 'stepped-bands' });
    const steppedStartY = ditheredStartY + ditheredHeight;

    stepped.fillRect(0, steppedStartY, WIDTH, steppedHeight, paletteColor('tones', 'shadow'));
    stepped.gradient({
      selector: VISIBLE_PIXELS,
      palette: 'tones',
      mode: 'steps',
      steps: 3,
      start: { x: 0, y: steppedStartY },
      end: { x: WIDTH - 1, y: steppedStartY + steppedHeight - 1 },
    });

    return composition;
  },
});
