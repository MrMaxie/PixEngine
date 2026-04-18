import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';

import {
  createColorRamp,
  createPalette,
  loadPaletteFromGpl,
  loadPaletteFromHex,
  loadPaletteFromPng,
  quantizeToPalette,
  rgba,
  sampleColorRamp,
  samplePalette,
} from '../src/index.ts';

describe('palette helpers', () => {
  test('supports named and indexed colors', () => {
    const palette = createPalette([
      { name: 'shadow', color: rgba(0, 0, 0) },
      { name: 'accent', color: rgba(255, 0, 0) },
      { name: 'highlight', color: rgba(255, 255, 255) },
    ]);

    expect(palette.getColor(1)).toEqual(rgba(255, 0, 0));
    expect(palette.getColor('highlight')).toEqual(rgba(255, 255, 255));
    expect(samplePalette(palette, 0.49)).toEqual(rgba(255, 0, 0));
  });

  test('quantizeToPalette returns the nearest color by RGBA distance', () => {
    const palette = createPalette([rgba(20, 20, 20), rgba(150, 40, 20), rgba(240, 240, 240)]);

    expect(quantizeToPalette(rgba(160, 50, 25), palette)).toEqual(rgba(150, 40, 20));
  });

  test('sampleColorRamp interpolates explicit color stops', () => {
    const ramp = createColorRamp([
      { at: 0, color: rgba(0, 0, 0) },
      { at: 0.25, color: rgba(255, 0, 0) },
      { at: 1, color: rgba(255, 255, 255) },
    ]);

    expect(sampleColorRamp(ramp, 0.125)).toEqual(rgba(128, 0, 0));
    expect(sampleColorRamp(ramp, 0.625)).toEqual(rgba(255, 128, 128));
  });

  test('loads palettes from hex, GPL, and 1x PNG assets', async () => {
    const assetsDirectory = join(process.cwd(), 'assets');
    const hexPalette = await loadPaletteFromHex(join(assetsDirectory, 'pico-8.hex'));
    const gplPalette = await loadPaletteFromGpl(join(assetsDirectory, 'pico-8.gpl'));
    const pngPalette = await loadPaletteFromPng(join(assetsDirectory, 'pico-8-1x.png'));

    expect(hexPalette.length).toBe(16);
    expect(hexPalette.getEntry(0).name).toBe('color-0');
    expect(gplPalette.length).toBe(16);
    expect(gplPalette.getEntry(0).name).toBe('000000');
    expect(pngPalette.length).toBe(16);
    expect(pngPalette.getEntry(0).name).toBe('color-0');
    expect(pngPalette.getColor(0)).toEqual(hexPalette.getColor(0));
  });
});
