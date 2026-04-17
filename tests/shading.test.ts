import { describe, expect, test } from 'bun:test';

import { createColorRamp, createPalette, lambertLight, rgba, shadePalette, shadeRamp } from '../src/index.ts';

describe('shading helpers', () => {
  test('maps light values to ramp colors', () => {
    const ramp = createColorRamp([rgba(0, 0, 0), rgba(128, 128, 128), rgba(255, 255, 255)]);

    expect(shadeRamp(ramp, 0.5)).toEqual(rgba(128, 128, 128));
  });

  test('maps light values to discrete palette colors', () => {
    const palette = createPalette([rgba(12, 16, 24), rgba(92, 112, 141), rgba(232, 238, 245)]);

    expect(shadePalette(palette, 0.9)).toEqual(rgba(232, 238, 245));
  });

  test('computes normalized lambert lighting with ambient light', () => {
    expect(lambertLight(0, -1, 0, -10, 0.2)).toBe(1);
    expect(lambertLight(1, 0, -1, 0, 0.1)).toBe(0.1);
  });
});
