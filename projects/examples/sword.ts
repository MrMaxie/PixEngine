import { Composition, createPalette, paletteColor, rgba, type Selector } from '../../src/index.ts';
import { defineExampleProject, EXAMPLE_RENDER_SIZE } from '../example-project.ts';

const WIDTH = EXAMPLE_RENDER_SIZE;
const HEIGHT = EXAMPLE_RENDER_SIZE;
const CENTER_X = 31.5;
const VISIBLE_PIXELS: Selector = {
  type: 'channels',
  a: {
    min: 1,
  },
};

const bladePalette = createPalette([
  { name: 'shadow', color: rgba(72, 87, 109) },
  { name: 'mid', color: rgba(142, 163, 188) },
  { name: 'highlight', color: rgba(235, 242, 248) },
]);
const guardPalette = createPalette([
  { name: 'shadow', color: rgba(112, 78, 40) },
  { name: 'mid', color: rgba(176, 128, 68) },
  { name: 'highlight', color: rgba(231, 191, 112) },
]);
const handlePalette = createPalette([
  { name: 'shadow', color: rgba(67, 39, 22) },
  { name: 'mid', color: rgba(111, 73, 42) },
  { name: 'highlight', color: rgba(164, 116, 67) },
]);

export const swordExampleProject = defineExampleProject({
  id: 'sword',
  width: EXAMPLE_RENDER_SIZE,
  height: EXAMPLE_RENDER_SIZE,
  render: () => {
    const composition = new Composition({
      width: WIDTH,
      height: HEIGHT,
      palettes: [
        { id: 'blade', palette: bladePalette },
        { id: 'guard', palette: guardPalette },
        { id: 'handle', palette: handlePalette },
      ],
    });

    const blade = composition.createLayer({ id: 'blade' });

    blade.fillCurve({
      start: { x: 31, y: 8 },
      color: paletteColor('blade', 'shadow'),
      segments: [
        { type: 'line', to: { x: 34, y: 14 } },
        { type: 'line', to: { x: 36, y: 43 } },
        { type: 'line', to: { x: 27, y: 43 } },
        { type: 'line', to: { x: 29, y: 14 } },
        { type: 'line', to: { x: 31, y: 8 } },
      ],
    });
    blade.tone({
      selector: VISIBLE_PIXELS,
      palette: 'blade',
      mode: 'steps',
      steps: 3,
      sample: ({ x, y }) => {
        const width = Math.max(1, 4 - Math.max(0, (y - 8) / 9) * 0.65);
        const centeredX = Math.abs(x - CENTER_X) / width;
        const edgeFalloff = 1 - Math.min(1, centeredX * 1.9);
        const tipLight = Math.max(0, 1 - (y - 8) / 38);

        return Math.max(0, Math.min(1, 0.18 + edgeFalloff * 0.6 + tipLight * 0.12));
      },
    });

    const bladeSpecular = composition.createLayer({ id: 'blade-specular' });

    bladeSpecular.fillRect(31, 9, 2, 1, paletteColor('blade', 'highlight'));

    const guard = composition.createLayer({ id: 'guard' });

    guard.fillRect(23, 43, 18, 4, paletteColor('guard', 'shadow'));
    guard.tone({
      selector: VISIBLE_PIXELS,
      palette: 'guard',
      mode: 'steps',
      steps: 3,
      sample: ({ x, y }) => {
        const horizontal = 1 - Math.abs(x - CENTER_X) / 10;
        const vertical = 1 - Math.abs(y - 44.5) / 2.5;

        return Math.max(0, Math.min(1, horizontal * 0.68 + vertical * 0.22));
      },
    });

    const handle = composition.createLayer({ id: 'handle' });

    handle.fillRect(29, 47, 6, 16, paletteColor('handle', 'shadow'));
    handle.tone({
      selector: VISIBLE_PIXELS,
      palette: 'handle',
      mode: 'steps',
      steps: 3,
      sample: ({ x, y }) => {
        const grip = ((x + y) % 4) / 3;
        const center = 1 - Math.abs(x - CENTER_X) / 3.5;

        return Math.max(0, Math.min(1, 0.15 + grip * 0.45 + center * 0.2));
      },
    });

    const pommel = composition.createLayer({ id: 'pommel' });

    pommel.fillRect(29, 59, 6, 4, paletteColor('guard', 'shadow'));
    pommel.tone({
      selector: VISIBLE_PIXELS,
      palette: 'guard',
      mode: 'steps',
      steps: 3,
      sample: ({ x, y }) => {
        const horizontal = 1 - Math.abs(x - CENTER_X) / 4;
        const vertical = 1 - Math.abs(y - 60.5) / 2;

        return Math.max(0, Math.min(1, horizontal * 0.55 + vertical * 0.25));
      },
    });

    return composition;
  },
});
