import { type ColorInput, rgba, toRgba } from './color.ts';

const TRANSPARENT = rgba(0, 0, 0, 0);

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'add'
  | 'subtract'
  | 'difference';

export type CanvasOptions = Readonly<{
  readonly width: number;
  readonly height: number;
  readonly background?: ColorInput;
}>;

export class Canvas {
  width: number;
  height: number;
  #pixels: Uint8ClampedArray;

  constructor({ width, height, background = TRANSPARENT }: CanvasOptions) {
    assertDimension('width', width);
    assertDimension('height', height);

    this.width = width;
    this.height = height;
    this.#pixels = new Uint8ClampedArray(width * height * 4);
    this.clear(background);
  }

  contains(x: number, y: number) {
    const px = normalizeCoordinate(x);
    const py = normalizeCoordinate(y);

    if (px === null || py === null) {
      return false;
    }

    return px >= 0 && px < this.width && py >= 0 && py < this.height;
  }

  clear(color: ColorInput = TRANSPARENT) {
    const nextColor = toRgba(color);

    for (let index = 0; index < this.#pixels.length; index += 4) {
      this.#pixels[index] = nextColor.r;
      this.#pixels[index + 1] = nextColor.g;
      this.#pixels[index + 2] = nextColor.b;
      this.#pixels[index + 3] = nextColor.a;
    }

    return this;
  }

  setWidth(width: number, background: ColorInput = TRANSPARENT) {
    return this.setSize(width, this.height, background);
  }

  setHeight(height: number, background: ColorInput = TRANSPARENT) {
    return this.setSize(this.width, height, background);
  }

  setSize(width: number, height: number, background: ColorInput = TRANSPARENT) {
    assertDimension('width', width);
    assertDimension('height', height);

    const nextPixels = createFilledPixelBuffer(width, height, background);
    const copyWidth = Math.min(this.width, width);
    const copyHeight = Math.min(this.height, height);

    for (let y = 0; y < copyHeight; y += 1) {
      for (let x = 0; x < copyWidth; x += 1) {
        const sourceOffset = getOffset(this.width, x, y);
        const targetOffset = getOffset(width, x, y);

        nextPixels[targetOffset] = this.#pixels[sourceOffset] ?? 0;
        nextPixels[targetOffset + 1] = this.#pixels[sourceOffset + 1] ?? 0;
        nextPixels[targetOffset + 2] = this.#pixels[sourceOffset + 2] ?? 0;
        nextPixels[targetOffset + 3] = this.#pixels[sourceOffset + 3] ?? 0;
      }
    }

    this.width = width;
    this.height = height;
    this.#pixels = nextPixels;

    return this;
  }

  crop(x: number, y: number, width: number, height: number) {
    const startX = normalizeRequiredCoordinate(x, 'crop x');
    const startY = normalizeRequiredCoordinate(y, 'crop y');

    assertDimension('crop width', width);
    assertDimension('crop height', height);

    const nextCanvas = new Canvas({ width, height, background: TRANSPARENT });

    for (let targetY = 0; targetY < height; targetY += 1) {
      for (let targetX = 0; targetX < width; targetX += 1) {
        const color = this.getPixel(startX + targetX, startY + targetY);

        if (color !== null) {
          nextCanvas.setPixel(targetX, targetY, color);
        }
      }
    }

    this.width = nextCanvas.width;
    this.height = nextCanvas.height;
    this.#pixels = nextCanvas.#pixels;

    return this;
  }

  setPixel(x: number, y: number, color: ColorInput) {
    const px = normalizeCoordinate(x);
    const py = normalizeCoordinate(y);

    if (px === null || py === null || !this.contains(px, py)) {
      return false;
    }

    const offset = getOffset(this.width, px, py);
    const nextColor = toRgba(color);

    this.#pixels[offset] = nextColor.r;
    this.#pixels[offset + 1] = nextColor.g;
    this.#pixels[offset + 2] = nextColor.b;
    this.#pixels[offset + 3] = nextColor.a;

    return true;
  }

  getPixel(x: number, y: number) {
    const px = normalizeCoordinate(x);
    const py = normalizeCoordinate(y);

    if (px === null || py === null || !this.contains(px, py)) {
      return null;
    }

    const offset = getOffset(this.width, px, py);

    return rgba(
      getChannel(this.#pixels, offset),
      getChannel(this.#pixels, offset + 1),
      getChannel(this.#pixels, offset + 2),
      getChannel(this.#pixels, offset + 3),
    );
  }

  clone() {
    const clone = new Canvas({ width: this.width, height: this.height, background: TRANSPARENT });

    clone.#pixels = this.#pixels.slice();

    return clone;
  }

  toUint8Array() {
    return this.#pixels.slice();
  }
}

export const compositeCanvas = (target: Canvas, source: Canvas, blendMode: BlendMode = 'normal') => {
  const width = Math.min(target.width, source.width);
  const height = Math.min(target.height, source.height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sourceColor = source.getPixel(x, y);
      const targetColor = target.getPixel(x, y);

      if (sourceColor === null || targetColor === null) {
        continue;
      }

      target.setPixel(x, y, blendColors(targetColor, sourceColor, blendMode));
    }
  }

  return target;
};

export const blendColors = (backdrop: ColorInput, source: ColorInput, blendMode: BlendMode = 'normal') => {
  const background = normalizeUnitColor(backdrop);
  const foreground = normalizeUnitColor(source);
  const alpha = foreground.a + background.a * (1 - foreground.a);

  if (alpha === 0) {
    return TRANSPARENT;
  }

  const blend = {
    r: blendChannel(background.r, foreground.r, blendMode),
    g: blendChannel(background.g, foreground.g, blendMode),
    b: blendChannel(background.b, foreground.b, blendMode),
  };

  const denominator = alpha === 0 ? 1 : alpha;

  return rgba(
    (((1 - foreground.a) * background.a * background.r +
      (1 - background.a) * foreground.a * foreground.r +
      foreground.a * background.a * blend.r) *
      255) /
      denominator,
    (((1 - foreground.a) * background.a * background.g +
      (1 - background.a) * foreground.a * foreground.g +
      foreground.a * background.a * blend.g) *
      255) /
      denominator,
    (((1 - foreground.a) * background.a * background.b +
      (1 - background.a) * foreground.a * foreground.b +
      foreground.a * background.a * blend.b) *
      255) /
      denominator,
    alpha * 255,
  );
};

const createFilledPixelBuffer = (width: number, height: number, background: ColorInput) => {
  const nextPixels = new Uint8ClampedArray(width * height * 4);
  const color = toRgba(background);

  for (let index = 0; index < nextPixels.length; index += 4) {
    nextPixels[index] = color.r;
    nextPixels[index + 1] = color.g;
    nextPixels[index + 2] = color.b;
    nextPixels[index + 3] = color.a;
  }

  return nextPixels;
};

const assertDimension = (name: string, value: number) => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer, received ${value}.`);
  }
};

const normalizeCoordinate = (value: number) => {
  if (!Number.isFinite(value)) {
    return null;
  }

  return Math.trunc(value);
};

const normalizeRequiredCoordinate = (value: number, name: string) => {
  const coordinate = normalizeCoordinate(value);

  if (coordinate === null) {
    throw new Error(`${name} must be finite.`);
  }

  return coordinate;
};

const getOffset = (width: number, x: number, y: number) => (y * width + x) * 4;

const getChannel = (data: Uint8ClampedArray, index: number) => {
  const channel = data.at(index);

  if (channel === undefined) {
    throw new Error(`Pixel channel index ${index} is out of bounds.`);
  }

  return channel;
};

const normalizeUnitColor = (color: ColorInput) => {
  const nextColor = toRgba(color);

  return {
    r: nextColor.r / 255,
    g: nextColor.g / 255,
    b: nextColor.b / 255,
    a: nextColor.a / 255,
  };
};

const blendChannel = (backdrop: number, source: number, blendMode: BlendMode) => {
  switch (blendMode) {
    case 'normal':
      return source;
    case 'multiply':
      return backdrop * source;
    case 'screen':
      return backdrop + source - backdrop * source;
    case 'overlay':
      return backdrop <= 0.5 ? 2 * backdrop * source : 1 - 2 * (1 - backdrop) * (1 - source);
    case 'darken':
      return Math.min(backdrop, source);
    case 'lighten':
      return Math.max(backdrop, source);
    case 'add':
      return clampUnit(backdrop + source);
    case 'subtract':
      return clampUnit(backdrop - source);
    case 'difference':
      return Math.abs(backdrop - source);
  }
};

const clampUnit = (value: number) => {
  return Math.min(1, Math.max(0, value));
};
