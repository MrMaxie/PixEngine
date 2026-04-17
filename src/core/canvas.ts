import { type ColorInput, rgba, toRgba } from './color.ts';

const TRANSPARENT = rgba(0, 0, 0, 0);

export class PixelCanvas {
  readonly width: number;
  readonly height: number;
  readonly #pixels: Uint8ClampedArray;

  constructor(width: number, height: number, background: ColorInput = TRANSPARENT) {
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

  clear(color: ColorInput) {
    const nextColor = toRgba(color);

    for (let index = 0; index < this.#pixels.length; index += 4) {
      this.#pixels[index] = nextColor.r;
      this.#pixels[index + 1] = nextColor.g;
      this.#pixels[index + 2] = nextColor.b;
      this.#pixels[index + 3] = nextColor.a;
    }
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

  toUint8Array() {
    return this.#pixels.slice();
  }
}

export const createCanvas = (width: number, height: number, background?: ColorInput) => {
  if (background === undefined) {
    return new PixelCanvas(width, height);
  }

  return new PixelCanvas(width, height, background);
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

const getOffset = (width: number, x: number, y: number) => (y * width + x) * 4;

const getChannel = (data: Uint8ClampedArray, index: number) => {
  const channel = data.at(index);

  if (channel === undefined) {
    throw new Error(`Pixel channel index ${index} is out of bounds.`);
  }

  return channel;
};
