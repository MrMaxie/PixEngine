import { describe, expect, test } from 'bun:test';

import { getOrderedDitherThreshold, orderedDither } from '../src/index.ts';

describe('ordered dithering', () => {
  test('returns stable Bayer thresholds for a 2x2 matrix', () => {
    expect(getOrderedDitherThreshold(0, 0, 2)).toBe(0.125);
    expect(getOrderedDitherThreshold(1, 0, 2)).toBe(0.625);
    expect(getOrderedDitherThreshold(0, 1, 2)).toBe(0.875);
    expect(getOrderedDitherThreshold(1, 1, 2)).toBe(0.375);
  });

  test('repeats the Bayer pattern and quantizes values into discrete steps', () => {
    expect(orderedDither(0.45, 0, 0, 2, 2)).toBe(1);
    expect(orderedDither(0.45, 1, 0, 2, 2)).toBe(0);
    expect(orderedDither(0.45, 2, 0, 2, 2)).toBe(1);
    expect(orderedDither(0.6, 1, 1, 4, 2)).toBeCloseTo(2 / 3, 8);
  });
});
