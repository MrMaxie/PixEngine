import { describe, expect, test } from 'bun:test';

import { Composition, paletteColor, rgba, type Selector } from '../src/index.ts';
import { pico8Palette } from './helpers/pico8.ts';

const VISIBLE_PIXELS: Selector = {
  type: 'channels',
  a: {
    min: 1,
  },
};

describe('Composition and Layer', () => {
  test('render keeps lazy effects live until apply', () => {
    const palette = pico8Palette.clone();
    const composition = new Composition({
      width: 6,
      height: 4,
      palettes: [{ id: 'pico8', palette }],
    });
    const layer = composition.createLayer();

    layer.setPixel(2, 1, paletteColor('pico8', 8));
    layer.border({ color: paletteColor('pico8', 12) });

    expect(composition.getPixel(1, 1)).toEqual(palette.getColor(12));

    layer.setPixel(4, 1, paletteColor('pico8', 8));
    expect(composition.getPixel(5, 1)).toEqual(palette.getColor(12));

    layer.apply();
    layer.setPixel(0, 3, paletteColor('pico8', 8));

    expect(composition.getPixel(1, 3)).toEqual(rgba(0, 0, 0, 0));
  });

  test('derived layers stay live until they are applied', () => {
    const palette = pico8Palette.clone();
    const composition = new Composition({
      width: 6,
      height: 4,
      palettes: [{ id: 'pico8', palette }],
    });
    const left = composition.createLayer({ id: 'left' });
    const right = composition.createLayer({ id: 'right' });

    left.fillRect(0, 1, 2, 2, paletteColor('pico8', 8));
    right.fillRect(1, 1, 2, 2, paletteColor('pico8', 11));
    left.hide();
    right.hide();

    const overlap = composition.combineLayers({
      left,
      right,
      mode: 'intersect',
      id: 'overlap',
    });

    expect(composition.getPixel(1, 1)).toEqual(palette.getColor(11));

    right.move(2, 0);
    expect(composition.getPixel(1, 1)).toEqual(rgba(0, 0, 0, 0));

    overlap.apply();
    right.move(-2, 0);

    expect(composition.getPixel(1, 1)).toEqual(rgba(0, 0, 0, 0));
  });

  test('palette refs and palette mutation are resolved at render time', () => {
    const palette = pico8Palette.clone();
    const composition = new Composition({
      width: 3,
      height: 1,
      palettes: [{ id: 'pico8', palette }],
    });
    const layer = composition.createLayer();

    layer.setPixel(0, 0, paletteColor('pico8', 8));
    layer.setPixel(1, 0, paletteColor('pico8', 12));
    layer.setPixel(2, 0, rgba(255, 0, 77, 128));
    layer.replaceColor({
      selector: {
        type: 'and',
        selectors: [
          {
            type: 'channels',
            r: { min: 200 },
            a: { min: 200 },
          },
          {
            type: 'not',
            selector: {
              type: 'color',
              color: paletteColor('pico8', 12),
            },
          },
        ],
      },
      color: paletteColor('pico8', 11),
    });

    expect(composition.getPixel(0, 0)).toEqual(palette.getColor(11));
    expect(composition.getPixel(1, 0)).toEqual(palette.getColor(12));
    expect(composition.getPixel(2, 0)).toEqual(rgba(255, 0, 77, 128));

    palette.setColor(11, palette.getColor(10));

    expect(composition.getPixel(0, 0)).toEqual(palette.getColor(11));
  });

  test('supports move, crop, and layer removal', () => {
    const palette = pico8Palette.clone();
    const composition = new Composition({
      width: 6,
      height: 3,
      palettes: [{ id: 'pico8', palette }],
    });
    const base = composition.createLayer();
    const overlay = composition.createLayer();

    base.fillRect(0, 0, 6, 3, paletteColor('pico8', 8));
    overlay.fillRect(0, 0, 4, 3, paletteColor('pico8', 11));
    overlay.move(1, 0);
    overlay.crop(1, 0, 2, 3);

    expect(composition.getPixel(1, 1)).toEqual(palette.getColor(8));
    expect(composition.getPixel(2, 1)).toEqual(palette.getColor(11));
    expect(composition.getPixel(3, 1)).toEqual(palette.getColor(11));
    expect(composition.getPixel(4, 1)).toEqual(palette.getColor(8));

    composition.removeLayer(overlay);

    expect(composition.getPixel(2, 1)).toEqual(palette.getColor(8));
  });

  test('uses circle fills and procedural tone mapping with palette-first outputs', () => {
    const palette = pico8Palette.clone();
    const composition = new Composition({
      width: 12,
      height: 12,
      palettes: [{ id: 'pico8', palette }],
    });
    const circle = composition.createLayer({ id: 'circle' });

    circle.fillCircle(6, 6, 4.2, paletteColor('pico8', 1));
    circle.tone({
      selector: VISIBLE_PIXELS,
      palette: 'pico8',
      mode: 'steps',
      steps: 4,
      sample: ({ x, y }) => {
        const dx = (x - 6) / 4.2;
        const dy = (y - 6) / 4.2;
        const distance = Math.hypot(dx, dy);

        return Math.max(0, Math.min(1, 1 - distance));
      },
    });

    const ribbon = composition.createLayer({ id: 'ribbon' });

    ribbon.fillCurve({
      start: { x: 1, y: 10 },
      color: paletteColor('pico8', 2),
      segments: [
        { type: 'quadratic', control: { x: 5, y: 1 }, to: { x: 10, y: 8 } },
        { type: 'line', to: { x: 10, y: 11 } },
        { type: 'line', to: { x: 1, y: 11 } },
        { type: 'line', to: { x: 1, y: 10 } },
      ],
    });
    ribbon.gradient({
      selector: VISIBLE_PIXELS,
      palette: 'pico8',
      mode: 'palette',
      dither: { matrixSize: 4 },
      start: { x: 1, y: 10 },
      end: { x: 10, y: 2 },
    });

    const mask = composition.createLayer({ id: 'mask' });

    mask.fillRect(4, 0, 4, 12, paletteColor('pico8', 7));
    mask.hide();

    const masked = composition.maskLayer({
      id: 'masked',
      source: ribbon,
      mask,
      blendMode: 'screen',
    });

    expect(composition.getPixel(8, 6)).toEqual(palette.getColor(10));
    expect(composition.getPixel(0, 6)).toEqual(rgba(0, 0, 0, 0));
    expect(composition.getPixel(2, 8)).toEqual(palette.getColor(3));

    masked.apply();
    ribbon.hide();

    expect(composition.getPixel(5, 8)?.a).toBeGreaterThan(0);
    expect(composition.getPixel(2, 8)).toEqual(rgba(0, 0, 0, 0));
  });
});
