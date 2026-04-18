import { describe, expect, test } from 'bun:test';

import { Composition, paletteColor, rgba } from '../src/index.ts';
import { pico8Palette } from './helpers/pico8.ts';

describe('drawing operations', () => {
  test('line modes produce deterministic coverage', () => {
    const loose = new Composition({ width: 5, height: 5, palettes: [{ id: 'pico8', palette: pico8Palette }] });
    loose.createLayer().line(0, 0, 3, 3, paletteColor('pico8', 8), { mode: 'loose' });

    const pixelPerfect = new Composition({ width: 5, height: 5, palettes: [{ id: 'pico8', palette: pico8Palette }] });
    pixelPerfect.createLayer().line(0, 0, 3, 3, paletteColor('pico8', 8), { mode: 'pixelPerfect' });

    const filledCorners = new Composition({
      width: 5,
      height: 5,
      palettes: [{ id: 'pico8', palette: pico8Palette }],
    });
    filledCorners.createLayer().line(0, 0, 3, 3, paletteColor('pico8', 8), { mode: 'pixelPerfectFilledCorners' });

    expect(countColoredPixels(loose.toCanvas())).toBe(4);
    expect(countColoredPixels(pixelPerfect.toCanvas())).toBe(4);
    expect(countColoredPixels(filledCorners.toCanvas())).toBe(7);
    expect(filledCorners.getPixel(1, 0)).toEqual(pico8Palette.getColor(8));
    expect(filledCorners.getPixel(2, 1)).toEqual(pico8Palette.getColor(8));
  });

  test('flood fill respects contiguous boundaries', () => {
    const composition = new Composition({ width: 6, height: 6, palettes: [{ id: 'pico8', palette: pico8Palette }] });
    const layer = composition.createLayer();

    layer.line(1, 1, 4, 1, paletteColor('pico8', 8));
    layer.line(4, 1, 4, 4, paletteColor('pico8', 8));
    layer.line(4, 4, 1, 4, paletteColor('pico8', 8));
    layer.line(1, 4, 1, 1, paletteColor('pico8', 8));
    layer.floodFill(2, 2, paletteColor('pico8', 11));

    expect(composition.getPixel(2, 2)).toEqual(pico8Palette.getColor(11));
    expect(composition.getPixel(0, 0)).toEqual(rgba(0, 0, 0, 0));
    expect(composition.getPixel(1, 1)).toEqual(pico8Palette.getColor(8));
  });
});

const countColoredPixels = (canvas: ReturnType<Composition['toCanvas']>) => {
  let total = 0;

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const color = canvas.getPixel(x, y);

      if (color !== null && color.a > 0) {
        total += 1;
      }
    }
  }

  return total;
};
