import { readFile } from 'node:fs/promises';
import { PNG } from 'pngjs';
import { type ColorInput, type RgbaColor, rgba, toRgba } from '../core/color.ts';
import { clampUnit, lerp } from '../core/scalar.ts';

export type PaletteEntry = Readonly<{
  readonly name?: string;
  readonly color: RgbaColor;
}>;

export type PaletteEntryInput =
  | ColorInput
  | Readonly<{
      readonly name?: string;
      readonly color: ColorInput;
    }>;

export type PaletteColorRef = Readonly<{
  readonly palette?: string | Palette;
  readonly name?: string;
  readonly index?: number;
}>;

export type ColorValue = ColorInput | PaletteColorRef;

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

export class Palette {
  readonly id: string | undefined;
  readonly name: string | undefined;
  #entries: PaletteEntry[];
  #version: number;

  constructor(entries: readonly PaletteEntryInput[], options?: Readonly<{ id?: string; name?: string }>) {
    if (entries.length === 0) {
      throw new Error('Palette requires at least one color.');
    }

    this.id = options?.id;
    this.name = options?.name;
    this.#entries = entries.map((entry) => normalizePaletteEntry(entry));
    this.#version = 0;
  }

  get length() {
    return this.#entries.length;
  }

  get version() {
    return this.#version;
  }

  get entries() {
    return this.#entries.map((entry) =>
      createPaletteEntry(rgba(entry.color.r, entry.color.g, entry.color.b, entry.color.a), entry.name),
    );
  }

  getEntry(reference: number | string) {
    if (typeof reference === 'number') {
      return getPaletteEntry(this.#entries, reference);
    }

    const entry = this.#entries.find((candidate) => candidate.name === reference);

    if (entry === undefined) {
      throw new Error(`Unknown palette entry '${reference}'.`);
    }

    return entry;
  }

  getColor(reference: number | string) {
    return this.getEntry(reference).color;
  }

  setColor(reference: number | string, color: ColorInput) {
    const normalized = toRgba(color);

    if (typeof reference === 'number') {
      const entry = getPaletteEntry(this.#entries, reference);
      const index = this.#entries.indexOf(entry);

      this.#entries[index] = createPaletteEntry(normalized, entry.name);
      this.#version += 1;

      return this;
    }

    const index = this.#entries.findIndex((entry) => entry.name === reference);

    if (index === -1) {
      throw new Error(`Unknown palette entry '${reference}'.`);
    }

    const entry = this.#entries[index];

    if (entry === undefined) {
      throw new Error(`Unknown palette entry '${reference}'.`);
    }

    this.#entries[index] = createPaletteEntry(normalized, entry.name);
    this.#version += 1;

    return this;
  }

  rename(reference: number | string, name?: string) {
    const index =
      typeof reference === 'number' ? reference : this.#entries.findIndex((entry) => entry.name === reference);
    const entry = this.#entries[index];

    if (entry === undefined) {
      throw new Error(`Unknown palette entry '${String(reference)}'.`);
    }

    this.#entries[index] = createPaletteEntry(entry.color, name);
    this.#version += 1;

    return this;
  }

  add(color: ColorInput, name?: string) {
    this.#entries.push(createPaletteEntry(toRgba(color), name));
    this.#version += 1;

    return this;
  }

  remove(reference: number | string) {
    if (this.#entries.length === 1) {
      throw new Error('Palette requires at least one color.');
    }

    const index =
      typeof reference === 'number' ? reference : this.#entries.findIndex((entry) => entry.name === reference);

    if (index < 0 || index >= this.#entries.length) {
      throw new Error(`Unknown palette entry '${String(reference)}'.`);
    }

    this.#entries.splice(index, 1);
    this.#version += 1;

    return this;
  }

  clone() {
    return new Palette(this.entries, {
      ...(this.id === undefined ? {} : { id: this.id }),
      ...(this.name === undefined ? {} : { name: this.name }),
    });
  }

  toArray() {
    return this.#entries.map((entry) => entry.color);
  }
}

export const createPalette = (
  entries: readonly PaletteEntryInput[],
  options?: Readonly<{ id?: string; name?: string }>,
) => new Palette(entries, options);

export const samplePalette = (palette: Palette, value: number) => {
  assertPalette(palette);

  if (palette.length === 1) {
    return palette.getColor(0);
  }

  const index = Math.round(clampUnit(value) * (palette.length - 1));

  return palette.getColor(index);
};

export const quantizeToPalette = (color: ColorInput, palette: Palette) => {
  assertPalette(palette);

  const target = toRgba(color);
  let bestColor = palette.getColor(0);
  let bestDistance = getColorDistanceSquared(target, bestColor);

  for (let index = 1; index < palette.length; index += 1) {
    const candidate = palette.getColor(index);
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

export const loadPaletteFromHex = async (filePath: string, options?: Readonly<{ id?: string; name?: string }>) => {
  return parseHexPalette(await readFile(filePath, 'utf8'), options);
};

export const loadPaletteFromGpl = async (filePath: string, options?: Readonly<{ id?: string; name?: string }>) => {
  return parseGimpPalette(await readFile(filePath, 'utf8'), options);
};

export const loadPaletteFromPng = async (filePath: string, options?: Readonly<{ id?: string; name?: string }>) => {
  return parsePalettePng(await readFile(filePath), options);
};

export const parseHexPalette = (input: string, options?: Readonly<{ id?: string; name?: string }>) => {
  const entries = input
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line, index) => createPaletteEntry(parseHexColor(line), `color-${index}`));

  return createPalette(entries, options);
};

export const parseGimpPalette = (input: string, options?: Readonly<{ id?: string; name?: string }>) => {
  const entries = input
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#') && line !== 'GIMP Palette')
    .map((line) => {
      const match = line.match(/^(\d+)\s+(\d+)\s+(\d+)\s+(.+)$/u);

      if (match === null) {
        throw new Error(`Invalid GIMP palette line '${line}'.`);
      }

      const [, r, g, b, name] = match;

      if (name === undefined) {
        throw new Error(`Invalid GIMP palette line '${line}'.`);
      }

      return createPaletteEntry(rgba(Number(r), Number(g), Number(b)), name.trim());
    });

  return createPalette(entries, options);
};

export const parsePalettePng = (input: Uint8Array | Buffer, options?: Readonly<{ id?: string; name?: string }>) => {
  const png = PNG.sync.read(Buffer.from(input));
  const entries: PaletteEntry[] = [];
  const seen = new Set<string>();

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const offset = (y * png.width + x) * 4;
      const color = rgba(
        png.data[offset] ?? 0,
        png.data[offset + 1] ?? 0,
        png.data[offset + 2] ?? 0,
        png.data[offset + 3] ?? 255,
      );
      const key = `${color.r}:${color.g}:${color.b}:${color.a}`;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      entries.push(createPaletteEntry(color, `color-${entries.length}`));
    }
  }

  return createPalette(entries, options);
};

export const resolveColorValue = (value: ColorValue, palettes?: ReadonlyMap<string, Palette>) => {
  if (!isPaletteColorRef(value)) {
    return toRgba(value);
  }

  const palette = resolvePalette(value.palette, palettes);

  if (value.name !== undefined) {
    return palette.getColor(value.name);
  }

  if (value.index !== undefined) {
    return palette.getColor(value.index);
  }

  throw new Error('Palette color ref requires either name or index.');
};

export const isPaletteColorRef = (value: ColorValue): value is PaletteColorRef => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    ('palette' in value || 'name' in value || 'index' in value)
  );
};

const resolvePalette = (source: string | Palette | undefined, palettes: ReadonlyMap<string, Palette> | undefined) => {
  if (source instanceof Palette) {
    return source;
  }

  if (typeof source === 'string') {
    const palette = palettes?.get(source);

    if (palette === undefined) {
      throw new Error(`Unknown palette '${source}'.`);
    }

    return palette;
  }

  if (palettes !== undefined && palettes.size === 1) {
    const palette = palettes.values().next().value;

    if (palette !== undefined) {
      return palette;
    }
  }

  throw new Error('Palette ref must specify a palette when more than one palette is available.');
};

const normalizePaletteEntry = (entry: PaletteEntryInput): PaletteEntry => {
  if (isPaletteEntryInput(entry)) {
    return createPaletteEntry(toRgba(entry.color), entry.name);
  }

  return createPaletteEntry(toRgba(entry));
};

const isPaletteEntryInput = (entry: PaletteEntryInput): entry is Exclude<PaletteEntryInput, ColorInput> => {
  return (
    typeof entry === 'object' &&
    entry !== null &&
    !Array.isArray(entry) &&
    'color' in entry &&
    !('r' in entry && 'g' in entry && 'b' in entry)
  );
};

const parseHexColor = (input: string) => {
  const normalized = input.replace(/^#/u, '');

  if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/u.test(normalized)) {
    throw new Error(`Invalid hex color '${input}'.`);
  }

  const [r, g, b, a = 'ff'] = normalized.match(/../gu) ?? [];

  if (r === undefined || g === undefined || b === undefined) {
    throw new Error(`Invalid hex color '${input}'.`);
  }

  return rgba(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16), parseInt(a, 16));
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

const getPaletteEntry = (entries: readonly PaletteEntry[], index: number) => {
  const entry = entries[index];

  if (entry === undefined) {
    throw new Error(`Palette color index ${index} is out of bounds.`);
  }

  return entry;
};

const getColorDistanceSquared = (left: RgbaColor, right: RgbaColor) => {
  return (left.r - right.r) ** 2 + (left.g - right.g) ** 2 + (left.b - right.b) ** 2 + (left.a - right.a) ** 2;
};

const createPaletteEntry = (color: RgbaColor, name?: string): PaletteEntry => {
  return name === undefined ? { color } : { name, color };
};

const isRampStopInput = (value: ColorInput | ColorRampStopInput | undefined): value is ColorRampStopInput => {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && 'color' in value && 'at' in value;
};
