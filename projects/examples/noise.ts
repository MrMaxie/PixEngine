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
const noise = createValueNoise2D(9041);
const detailNoise = createValueNoise2D(4157);
const SAMPLE_SCALE_X = 11;
const SAMPLE_SCALE_Y = 9;
const VISIBLE_PIXELS: Selector = {
  type: 'channels',
  a: {
    min: 1,
  },
};

const noisePalette = createPalette([
  { name: 'deep', color: rgba(8, 12, 24) },
  { name: 'shadow', color: rgba(27, 42, 69) },
  { name: 'mid', color: rgba(63, 89, 128) },
  { name: 'light', color: rgba(123, 160, 185) },
  { name: 'foam', color: rgba(218, 233, 239) },
]);

export const noiseExampleProject = defineExampleProject({
  id: 'noise',
  width: EXAMPLE_RENDER_SIZE,
  height: EXAMPLE_RENDER_SIZE,
  render: () => {
    const composition = new Composition({
      width: WIDTH,
      height: HEIGHT,
      palettes: [
        {
          id: 'noise',
          palette: noisePalette,
        },
      ],
    });
    const layer = composition.createLayer({ id: 'noise-field' });

    layer.fillRect(0, 0, WIDTH, HEIGHT, paletteColor('noise', 'deep'));
    layer.tone({
      selector: VISIBLE_PIXELS,
      palette: 'noise',
      mode: 'palette',
      dither: { matrixSize: 4 },
      sample: ({ x, y }) => {
        const value = sampleFractalNoise2D(noise, x / SAMPLE_SCALE_X + 0.37, y / SAMPLE_SCALE_Y + 1.19, {
          octaves: 4,
          persistence: 0.58,
          lacunarity: 1.92,
        });
        const detail = sampleFractalNoise2D(detailNoise, x / 5.5 + 1.07, y / 5.1 + 0.41, {
          octaves: 2,
          persistence: 0.5,
          lacunarity: 2.1,
        });
        const vignetteX = Math.abs(x - WIDTH / 2) / (WIDTH / 2);
        const vignetteY = Math.abs(y - HEIGHT / 2) / (HEIGHT / 2);
        const contrast = (value - 0.5) * 1.38 + 0.5;
        const highlighted = contrast + (detail - 0.5) * 0.22 - vignetteX * 0.07 - vignetteY * 0.03;

        return Math.max(0, Math.min(1, highlighted));
      },
    });

    return composition;
  },
});
