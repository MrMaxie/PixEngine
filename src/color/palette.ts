import { type ColorInput, type RgbaColor, rgba, toRgba } from '../core/color.ts';
import { clampUnit, lerp } from '../core/scalar.ts';

export type Palette = readonly RgbaColor[];

export type ColorRampStop = Readonly<{
  readonly at: number;
  readonly color: RgbaColor;
}>;

export type ColorRamp = Readonly<{
  readonly stops: readonly ColorRampStop[];
}>;

export type ColorRampStopInput = Readonly<{
  readonly at: number;
  readonly color: ColorInput;
}>;

export const createPalette = (colors: readonly ColorInput[]) => {
  if (colors.length === 0) {
    throw new Error('Palette requires at least one color.');
  }

  return colors.map((color) => toRgba(color));
};

export const samplePalette = (palette: Palette, value: number) => {
  assertPalette(palette);

  if (palette.length === 1) {
    return getPaletteColor(palette, 0);
  }

  const index = Math.round(clampUnit(value) * (palette.length - 1));

  return getPaletteColor(palette, index);
};

export const quantizeToPalette = (color: ColorInput, palette: Palette) => {
  assertPalette(palette);

  const target = toRgba(color);
  let bestColor = getPaletteColor(palette, 0);
  let bestDistance = getColorDistanceSquared(target, bestColor);

  for (let index = 1; index < palette.length; index += 1) {
    const candidate = getPaletteColor(palette, index);
    const distance = getColorDistanceSquared(target, candidate);

    if (distance < bestDistance) {
      bestColor = candidate;
      bestDistance = distance;
    }
  }

  return bestColor;
};

export const createColorRamp = (input: readonly ColorInput[] | readonly ColorRampStopInput[]) => {
  if (input.length === 0) {
    throw new Error('Color ramp requires at least one color stop.');
  }

  const firstValue = input[0];

  if (firstValue !== undefined && isRampStopInput(firstValue)) {
    const stopInputs = input as readonly ColorRampStopInput[];
    const sortedStops = [...stopInputs]
      .map((stop) => ({
        at: clampUnit(stop.at, 'Color ramp stop position'),
        color: toRgba(stop.color),
      }))
      .sort((left, right) => left.at - right.at);

    assertStrictlyIncreasingStops(sortedStops);

    return { stops: sortedStops };
  }

  const colorInputs = input as readonly ColorInput[];

  if (colorInputs.length === 1) {
    if (firstValue === undefined || isRampStopInput(firstValue)) {
      throw new Error('Color ramp requires a color input.');
    }

    return {
      stops: [
        {
          at: 0,
          color: toRgba(firstValue),
        },
      ],
    };
  }

  return {
    stops: colorInputs.map((color, index) => ({
      at: index / (colorInputs.length - 1),
      color: toRgba(color),
    })),
  };
};

export const sampleColorRamp = (ramp: ColorRamp, value: number) => {
  assertRamp(ramp);

  const normalized = clampUnit(value);
  const firstStop = ramp.stops[0];

  if (firstStop === undefined) {
    throw new Error('Color ramp requires at least one stop.');
  }

  if (normalized <= firstStop.at || ramp.stops.length === 1) {
    return firstStop.color;
  }

  for (let index = 1; index < ramp.stops.length; index += 1) {
    const nextStop = ramp.stops[index];
    const previousStop = ramp.stops[index - 1];

    if (nextStop === undefined || previousStop === undefined) {
      throw new Error(`Color ramp stop ${index} is missing.`);
    }

    if (normalized <= nextStop.at) {
      const span = nextStop.at - previousStop.at;
      const amount = span === 0 ? 0 : (normalized - previousStop.at) / span;

      return rgba(
        lerp(previousStop.color.r, nextStop.color.r, amount),
        lerp(previousStop.color.g, nextStop.color.g, amount),
        lerp(previousStop.color.b, nextStop.color.b, amount),
        lerp(previousStop.color.a, nextStop.color.a, amount),
      );
    }
  }

  const lastStop = ramp.stops.at(-1);

  if (lastStop === undefined) {
    throw new Error('Color ramp requires at least one stop.');
  }

  return lastStop.color;
};

const assertPalette = (palette: Palette) => {
  if (palette.length === 0) {
    throw new Error('Palette requires at least one color.');
  }
};

const assertRamp = (ramp: ColorRamp) => {
  if (ramp.stops.length === 0) {
    throw new Error('Color ramp requires at least one stop.');
  }
};

const assertStrictlyIncreasingStops = (stops: readonly ColorRampStop[]) => {
  for (let index = 1; index < stops.length; index += 1) {
    const current = stops[index];
    const previous = stops[index - 1];

    if (current === undefined || previous === undefined) {
      throw new Error(`Color ramp stop ${index} is missing.`);
    }

    if (current.at <= previous.at) {
      throw new Error('Color ramp stop positions must be strictly increasing.');
    }
  }
};

const getPaletteColor = (palette: Palette, index: number) => {
  const color = palette[index];

  if (color === undefined) {
    throw new Error(`Palette color index ${index} is out of bounds.`);
  }

  return color;
};

const getColorDistanceSquared = (left: RgbaColor, right: RgbaColor) => {
  return (left.r - right.r) ** 2 + (left.g - right.g) ** 2 + (left.b - right.b) ** 2 + (left.a - right.a) ** 2;
};

const isRampStopInput = (value: ColorInput | ColorRampStopInput | undefined): value is ColorRampStopInput => {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && 'color' in value && 'at' in value;
};
