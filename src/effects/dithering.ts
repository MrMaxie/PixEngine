import { clampUnit } from '../core/scalar.ts';

export type BayerMatrixSize = 2 | 4 | 8;

const BAYER_2 = [
  [0, 2],
  [3, 1],
] as const;

const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
] as const;

const BAYER_8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
] as const;

export const getBayerMatrix = (size: BayerMatrixSize = 4) => {
  switch (size) {
    case 2:
      return BAYER_2;
    case 4:
      return BAYER_4;
    case 8:
      return BAYER_8;
    default:
      throw new Error(`Unsupported Bayer matrix size: ${size}.`);
  }
};

export const getOrderedDitherThreshold = (x: number, y: number, size: BayerMatrixSize = 4) => {
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new Error('Ordered dithering coordinates must be finite.');
  }

  const matrix = getBayerMatrix(size);
  const px = positiveMod(Math.trunc(x), size);
  const py = positiveMod(Math.trunc(y), size);
  const row = matrix[py];
  const cell = row?.[px];

  if (cell === undefined) {
    throw new Error(`Missing Bayer matrix cell at (${px}, ${py}).`);
  }

  return (cell + 0.5) / (size * size);
};

export const orderedDither = (value: number, x: number, y: number, levels: number, size: BayerMatrixSize = 4) => {
  if (!Number.isInteger(levels) || levels < 2) {
    throw new Error('Ordered dithering requires at least two levels.');
  }

  const normalized = clampUnit(value);
  const scaled = normalized * (levels - 1);
  const baseIndex = Math.floor(scaled);
  const threshold = getOrderedDitherThreshold(x, y, size);
  const fractional = scaled - baseIndex;
  const nextIndex = baseIndex + Number(fractional >= threshold);
  const clampedIndex = Math.min(levels - 1, nextIndex);

  return clampedIndex / (levels - 1);
};

const positiveMod = (value: number, modulus: number) => {
  const remainder = value % modulus;

  return remainder < 0 ? remainder + modulus : remainder;
};
