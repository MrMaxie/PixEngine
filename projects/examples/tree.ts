import {
  Composition,
  createPalette,
  createValueNoise2D,
  paletteColor,
  rgba,
  type Selector,
  sampleFractalNoise2D,
} from '../../src/index.ts';
import { defineExampleProject, EXAMPLE_RENDER_SIZE } from '../example-project.ts';

const WIDTH = EXAMPLE_RENDER_SIZE;
const HEIGHT = EXAMPLE_RENDER_SIZE;
const canopyNoise = createValueNoise2D(7129);
const groundNoise = createValueNoise2D(3221);
const VISIBLE_PIXELS: Selector = {
  type: 'channels',
  a: {
    min: 1,
  },
};

const foliagePalette = createPalette([
  { name: 'shadow', color: rgba(28, 59, 30) },
  { name: 'mid-dark', color: rgba(59, 106, 55) },
  { name: 'mid-light', color: rgba(108, 157, 79) },
  { name: 'highlight', color: rgba(187, 218, 132) },
]);
const grassPalette = createPalette([
  { name: 'shadow', color: rgba(96, 143, 72) },
  { name: 'mid', color: rgba(124, 171, 88) },
  { name: 'highlight', color: rgba(156, 196, 110) },
]);
const barkPalette = createPalette([
  { name: 'shadow', color: rgba(85, 54, 31) },
  { name: 'mid', color: rgba(118, 77, 45) },
  { name: 'highlight', color: rgba(156, 108, 67) },
]);

export const treeExampleProject = defineExampleProject({
  id: 'tree',
  width: EXAMPLE_RENDER_SIZE,
  height: EXAMPLE_RENDER_SIZE,
  render: () => {
    const composition = new Composition({
      width: WIDTH,
      height: HEIGHT,
      palettes: [
        { id: 'foliage', palette: foliagePalette },
        { id: 'grass', palette: grassPalette },
        { id: 'bark', palette: barkPalette },
      ],
    });

    const ground = composition.createLayer({ id: 'ground' });

    ground.fillRect(0, 48, WIDTH, HEIGHT - 48, paletteColor('grass', 'shadow'));
    ground.tone({
      selector: VISIBLE_PIXELS,
      palette: 'grass',
      mode: 'palette',
      dither: { matrixSize: 4 },
      sample: ({ x, y }) => {
        const base = sampleFractalNoise2D(groundNoise, x / 9 + 0.14, y / 7 + 0.26, {
          octaves: 2,
          persistence: 0.5,
          lacunarity: 2,
        });
        const horizon = 1 - (y - 48) / 15;

        return Math.max(0, Math.min(1, base * 0.78 + horizon * 0.16));
      },
    });

    const shadow = composition.createLayer({ id: 'shadow' });

    shadow.fillCurve({
      start: { x: 20, y: 50 },
      color: rgba(23, 52, 21, 136),
      segments: [
        { type: 'line', to: { x: 24, y: 47 } },
        { type: 'line', to: { x: 40, y: 47 } },
        { type: 'line', to: { x: 44, y: 50 } },
        { type: 'line', to: { x: 40, y: 53 } },
        { type: 'line', to: { x: 24, y: 53 } },
        { type: 'line', to: { x: 20, y: 50 } },
      ],
    });

    const trunk = composition.createLayer({ id: 'trunk' });

    trunk.fillCurve({
      start: { x: 28, y: 30 },
      color: paletteColor('bark', 'shadow'),
      segments: [
        { type: 'line', to: { x: 36, y: 30 } },
        { type: 'line', to: { x: 37, y: 56 } },
        { type: 'line', to: { x: 27, y: 56 } },
        { type: 'line', to: { x: 28, y: 30 } },
      ],
    });
    trunk.tone({
      selector: VISIBLE_PIXELS,
      palette: 'bark',
      mode: 'steps',
      steps: 3,
      sample: ({ x, y }) => {
        const centered = 1 - Math.abs(x - 31.5) / 5;
        const heightFalloff = 1 - (y - 30) / 30;

        return Math.max(0, Math.min(1, 0.18 + centered * 0.52 + heightFalloff * 0.12));
      },
    });

    const branch = composition.createLayer({ id: 'branch' });

    branch.fillCurve({
      start: { x: 29, y: 24 },
      color: paletteColor('bark', 'shadow'),
      segments: [
        { type: 'line', to: { x: 34, y: 24 } },
        { type: 'line', to: { x: 36, y: 34 } },
        { type: 'line', to: { x: 28, y: 34 } },
        { type: 'line', to: { x: 29, y: 24 } },
      ],
    });
    branch.tone({
      selector: VISIBLE_PIXELS,
      palette: 'bark',
      mode: 'steps',
      steps: 3,
      sample: ({ x }) => {
        return Math.max(0, Math.min(1, 0.22 + (1 - Math.abs(x - 31.5) / 4) * 0.58));
      },
    });

    const canopy = composition.createLayer({ id: 'canopy' });

    canopy.fillCircle(32, 24, 16, paletteColor('foliage', 'shadow'));
    canopy.fillCircle(22, 28, 13, paletteColor('foliage', 'shadow'));
    canopy.fillCircle(42, 29, 12, paletteColor('foliage', 'shadow'));
    canopy.tone({
      selector: VISIBLE_PIXELS,
      palette: 'foliage',
      mode: 'palette',
      dither: { matrixSize: 4 },
      sample: ({ x, y }) => {
        const dx = (x - 32) / 18;
        const dy = (y - 26) / 15;
        const distance = Math.hypot(dx, dy);
        const noiseValue = sampleFractalNoise2D(canopyNoise, x / 15 + 0.11, y / 13 + 0.47, {
          octaves: 3,
          persistence: 0.6,
        });
        const silhouette = Math.max(0, 1 - distance);

        return Math.max(0, Math.min(1, 0.12 + silhouette * 0.34 + (1 - Math.max(0, dy)) * 0.26 + noiseValue * 0.22));
      },
    });

    const canopyHighlights = composition.createLayer({ id: 'canopy-highlights' });

    canopyHighlights.fillCircle(24, 24, 1.1, paletteColor('foliage', 'highlight'));
    canopyHighlights.fillCircle(43, 16, 1.1, paletteColor('foliage', 'highlight'));
    canopyHighlights.fillCircle(18, 32, 1.1, paletteColor('foliage', 'highlight'));
    canopyHighlights.fillCircle(36, 20, 1, paletteColor('foliage', 'mid-light'));
    canopyHighlights.fillCircle(40, 29, 1, paletteColor('foliage', 'mid-light'));

    return composition;
  },
});
