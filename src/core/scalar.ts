export const assertFiniteNumber = (name: string, value: number) => {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be finite, received ${value}.`);
  }
};

export const clampUnit = (value: number, name = 'value') => {
  assertFiniteNumber(name, value);

  return Math.min(1, Math.max(0, value));
};

export const lerp = (start: number, end: number, amount: number) => start + (end - start) * amount;

export const smoothstep = (value: number) => value * value * (3 - 2 * value);
