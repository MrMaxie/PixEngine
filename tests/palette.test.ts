import { describe, expect, test } from 'bun:test';

import {
  createColorRamp,
  createPalette,
  quantizeToPalette,
  rgba,
  sampleColorRamp,
  samplePalette,
} from '../src/index.ts';

describe('palette helpers', () => {
  test('samplePalette selects the nearest indexed palette color', () => {
    const palette = createPalette([rgba(0, 0, 0), rgba(255, 0, 0), rgba(255, 255, 255)]);

    expect(samplePalette(palette, 0)).toEqual(rgba(0, 0, 0));
    expect(samplePalette(palette, 0.49)).toEqual(rgba(255, 0, 0));
    expect(samplePalette(palette, 1)).toEqual(rgba(255, 255, 255));
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
});
