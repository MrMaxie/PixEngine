import { Composition, createPalette, paletteColor, rgba, type Selector } from '../../src/index.ts';
import { defineExampleProject, EXAMPLE_RENDER_SIZE } from '../example-project.ts';

const WIDTH = EXAMPLE_RENDER_SIZE;
const HEIGHT = EXAMPLE_RENDER_SIZE;
const VISIBLE_PIXELS: Selector = {
  type: 'channels',
  a: {
    min: 1,
  },
};

const scenePalette = createPalette([
  { name: 'night', color: rgba(8, 10, 22) },
  { name: 'outline', color: rgba(24, 28, 54) },
  { name: 'highlight', color: rgba(240, 250, 255, 220) },
]);
const mintRibbonPalette = createPalette([
  { name: 'shadow', color: rgba(46, 120, 116) },
  { name: 'mid', color: rgba(78, 188, 170) },
  { name: 'light', color: rgba(126, 236, 214) },
]);
const violetRibbonPalette = createPalette([
  { name: 'shadow', color: rgba(82, 76, 161) },
  { name: 'mid', color: rgba(132, 114, 212) },
  { name: 'light', color: rgba(188, 155, 244) },
]);

export const auroraExampleProject = defineExampleProject({
  id: 'aurora',
  width: EXAMPLE_RENDER_SIZE,
  height: EXAMPLE_RENDER_SIZE,
  render: () => {
    const composition = new Composition({
      width: WIDTH,
      height: HEIGHT,
      palettes: [
        { id: 'scene', palette: scenePalette },
        { id: 'mint-ribbon', palette: mintRibbonPalette },
        { id: 'violet-ribbon', palette: violetRibbonPalette },
      ],
    });

    const background = composition.createLayer({ id: 'background' });

    background.fillRect(0, 0, WIDTH, HEIGHT, paletteColor('scene', 'night'));

    for (let index = 0; index < 12; index += 1) {
      const x = 6 + index * 5;
      const y = 6 + (index % 3) * 4;

      background.fillCircle(x, y, 0.7, rgba(255, 255, 255, 180));
    }

    const leftRibbon = composition.createLayer({ id: 'left-ribbon', blendMode: 'screen' });

    leftRibbon.fillCurve({
      start: { x: 8, y: 42 },
      color: paletteColor('mint-ribbon', 'shadow'),
      segments: [
        { type: 'quadratic', control: { x: 16, y: 12 }, to: { x: 24, y: 24 } },
        { type: 'quadratic', control: { x: 32, y: 38 }, to: { x: 36, y: 16 } },
        { type: 'line', to: { x: 34, y: 34 } },
        { type: 'quadratic', control: { x: 22, y: 48 }, to: { x: 12, y: 46 } },
      ],
    });
    leftRibbon.gradient({
      selector: VISIBLE_PIXELS,
      palette: 'mint-ribbon',
      mode: 'steps',
      steps: 3,
      dither: { matrixSize: 4 },
      start: { x: 8, y: 42 },
      end: { x: 36, y: 14 },
    });
    leftRibbon.border({ color: paletteColor('scene', 'outline') });

    const rightRibbon = composition.createLayer({ id: 'right-ribbon', blendMode: 'screen' });

    rightRibbon.fillCurve({
      start: { x: 28, y: 44 },
      color: paletteColor('violet-ribbon', 'shadow'),
      segments: [
        { type: 'quadratic', control: { x: 40, y: 10 }, to: { x: 54, y: 24 } },
        { type: 'quadratic', control: { x: 58, y: 36 }, to: { x: 52, y: 18 } },
        { type: 'line', to: { x: 50, y: 38 } },
        { type: 'quadratic', control: { x: 40, y: 50 }, to: { x: 30, y: 46 } },
      ],
    });
    rightRibbon.gradient({
      selector: VISIBLE_PIXELS,
      palette: 'violet-ribbon',
      mode: 'steps',
      steps: 3,
      dither: { matrixSize: 4 },
      start: { x: 28, y: 44 },
      end: { x: 56, y: 12 },
    });
    rightRibbon.border({ color: paletteColor('scene', 'outline') });

    const stripes = composition.createLayer({ id: 'mask-stripes' });

    for (let x = 0; x < WIDTH; x += 4) {
      stripes.fillRect(x, 0, 2, HEIGHT, rgba(255, 255, 255, x % 8 === 0 ? 220 : 140));
    }

    stripes.hide();

    const overlap = composition.combineLayers({
      id: 'overlap',
      left: leftRibbon,
      right: rightRibbon,
      mode: 'intersect',
      blendMode: 'add',
    });

    overlap.gradient({
      selector: VISIBLE_PIXELS,
      palette: 'mint-ribbon',
      mode: 'palette',
      dither: { matrixSize: 4 },
      start: { x: 20, y: 42 },
      end: { x: 46, y: 12 },
    });

    const maskedGlow = composition.maskLayer({
      id: 'masked-glow',
      source: overlap,
      mask: stripes,
      blendMode: 'screen',
    });

    maskedGlow.border({ color: paletteColor('scene', 'highlight') });

    return composition;
  },
});
