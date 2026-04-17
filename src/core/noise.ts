import { SeededRng } from './rng.ts';
import { assertFiniteNumber, lerp, smoothstep } from './scalar.ts';

export type FractalNoiseOptions = Readonly<{
  readonly octaves: number;
  readonly persistence?: number;
  readonly lacunarity?: number;
}>;

export class ValueNoise2D {
  readonly seed: number;

  constructor(seed: number) {
    assertFiniteNumber('seed', seed);

    this.seed = Math.trunc(seed);
  }

  sample(x: number, y: number) {
    assertFiniteNumber('x', x);
    assertFiniteNumber('y', y);

    const left = Math.floor(x);
    const top = Math.floor(y);
    const right = left + 1;
    const bottom = top + 1;
    const localX = smoothstep(x - left);
    const localY = smoothstep(y - top);
    const topLeft = this.#corner(left, top);
    const topRight = this.#corner(right, top);
    const bottomLeft = this.#corner(left, bottom);
    const bottomRight = this.#corner(right, bottom);
    const topBlend = lerp(topLeft, topRight, localX);
    const bottomBlend = lerp(bottomLeft, bottomRight, localX);

    return lerp(topBlend, bottomBlend, localY);
  }

  #corner(x: number, y: number) {
    const mixedSeed = mixSeed(this.seed, x, y);

    return new SeededRng(mixedSeed).next();
  }
}

export const createValueNoise2D = (seed: number) => new ValueNoise2D(seed);

export const sampleFractalNoise2D = (
  noise: Pick<ValueNoise2D, 'sample'>,
  x: number,
  y: number,
  options: FractalNoiseOptions,
) => {
  assertFiniteNumber('x', x);
  assertFiniteNumber('y', y);

  if (!Number.isInteger(options.octaves) || options.octaves <= 0) {
    throw new Error('Fractal noise requires at least one octave.');
  }

  const persistence = options.persistence ?? 0.5;
  const lacunarity = options.lacunarity ?? 2;

  assertFiniteNumber('persistence', persistence);
  assertFiniteNumber('lacunarity', lacunarity);

  let total = 0;
  let amplitude = 1;
  let frequency = 1;
  let amplitudeSum = 0;

  for (let octave = 0; octave < options.octaves; octave += 1) {
    total += noise.sample(x * frequency, y * frequency) * amplitude;
    amplitudeSum += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return total / amplitudeSum;
};

const mixSeed = (seed: number, x: number, y: number) => {
  let state = Math.trunc(seed) >>> 0;
  state ^= Math.imul(x, 0x1f123bb5);
  state = Math.imul(state ^ (state >>> 15), 0x85ebca6b);
  state ^= Math.imul(y, 0x5bd1e995);
  state ^= state >>> 13;

  return state >>> 0;
};
