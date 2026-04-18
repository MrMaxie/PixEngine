import { describe, expect, test } from 'bun:test';

import { blendColors, Canvas, rgba } from '../src/index.ts';
import { pico8Palette } from './helpers/pico8.ts';

describe('Canvas', () => {
  test('fills the canvas with the initial color and preserves pixels across resize', () => {
    const canvas = new Canvas({ width: 2, height: 2, background: pico8Palette.getColor(1) });

    canvas.setPixel(1, 1, pico8Palette.getColor(7));
    canvas.setWidth(3);
    canvas.setHeight(3);

    expect(canvas.getPixel(0, 0)).toEqual(pico8Palette.getColor(1));
    expect(canvas.getPixel(1, 1)).toEqual(pico8Palette.getColor(7));
    expect(canvas.getPixel(2, 2)).toEqual(rgba(0, 0, 0, 0));
  });

  test('crops to the requested region', () => {
    const canvas = new Canvas({ width: 4, height: 4 });

    canvas.setPixel(2, 2, pico8Palette.getColor(8));
    canvas.crop(1, 1, 2, 2);

    expect(canvas.width).toBe(2);
    expect(canvas.height).toBe(2);
    expect(canvas.getPixel(1, 1)).toEqual(pico8Palette.getColor(8));
    expect(canvas.getPixel(0, 0)).toEqual(rgba(0, 0, 0, 0));
  });

  test('supports the documented blend modes for opaque colors', () => {
    const backdrop = rgba(100, 150, 200);
    const source = rgba(50, 100, 150);

    expect(blendColors(backdrop, source, 'normal')).toEqual(rgba(50, 100, 150, 255));
    expect(blendColors(backdrop, source, 'multiply')).toEqual(rgba(20, 59, 118, 255));
    expect(blendColors(backdrop, source, 'screen')).toEqual(rgba(130, 191, 232, 255));
    expect(blendColors(backdrop, source, 'overlay')).toEqual(rgba(39, 127, 210, 255));
    expect(blendColors(backdrop, source, 'darken')).toEqual(rgba(50, 100, 150, 255));
    expect(blendColors(backdrop, source, 'lighten')).toEqual(rgba(100, 150, 200, 255));
    expect(blendColors(backdrop, source, 'add')).toEqual(rgba(150, 250, 255, 255));
    expect(blendColors(backdrop, source, 'subtract')).toEqual(rgba(50, 50, 50, 255));
    expect(blendColors(backdrop, source, 'difference')).toEqual(rgba(50, 50, 50, 255));
  });
});
