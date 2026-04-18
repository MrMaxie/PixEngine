import { Composition, createPalette, lambertLight, paletteColor, rgba, type Selector } from '../../src/index.ts';
import { defineExampleProject, EXAMPLE_RENDER_SIZE } from '../example-project.ts';

const WIDTH = EXAMPLE_RENDER_SIZE;
const HEIGHT = EXAMPLE_RENDER_SIZE;
const CENTER_X = 32;
const CENTER_Y = 30;
const RADIUS = 17;
const VISIBLE_PIXELS: Selector = {
  type: 'channels',
  a: {
    min: 1,
  },
};

const orbPalette = createPalette([
  { name: 'shadow', color: rgba(32, 40, 68) },
  { name: 'mid', color: rgba(71, 97, 151) },
  { name: 'light', color: rgba(124, 176, 224) },
  { name: 'highlight', color: rgba(239, 247, 255) },
]);

export const shadingExampleProject = defineExampleProject({
  id: 'shading',
  width: EXAMPLE_RENDER_SIZE,
  height: EXAMPLE_RENDER_SIZE,
  render: () => {
    const composition = new Composition({
      width: WIDTH,
      height: HEIGHT,
      palettes: [
        {
          id: 'orb',
          palette: orbPalette,
        },
      ],
    });
    const shadow = composition.createLayer({ id: 'shadow' });

    shadow.fillCurve({
      start: { x: 18, y: 47 },
      color: rgba(8, 11, 18, 136),
      segments: [
        { type: 'line', to: { x: 24, y: 44 } },
        { type: 'line', to: { x: 40, y: 44 } },
        { type: 'line', to: { x: 46, y: 47 } },
        { type: 'line', to: { x: 40, y: 50 } },
        { type: 'line', to: { x: 24, y: 50 } },
        { type: 'line', to: { x: 18, y: 47 } },
      ],
    });

    const orb = composition.createLayer({ id: 'orb' });

    orb.fillCircle(CENTER_X, CENTER_Y, RADIUS, paletteColor('orb', 'shadow'));
    orb.tone({
      selector: VISIBLE_PIXELS,
      palette: 'orb',
      mode: 'steps',
      steps: 4,
      sample: ({ x, y }) => {
        const dx = (x - CENTER_X) / RADIUS;
        const dy = (y - CENTER_Y) / RADIUS;
        const distance = Math.hypot(dx, dy);

        if (distance > 1) {
          return 0;
        }

        const radial = 1 - distance;
        const directLight = distance < 0.001 ? 1 : lambertLight(dx, dy, -0.9, -1, 0.2);

        return Math.min(1, directLight * 0.72 + radial * 0.22);
      },
    });

    return composition;
  },
});
