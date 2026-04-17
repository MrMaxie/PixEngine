const DEFAULT_SEED = 0x6d2b79f5;

export class SeededRng {
  #state: number;

  constructor(seed: number) {
    if (!Number.isFinite(seed)) {
      throw new Error(`Seed must be finite, received ${seed}.`);
    }

    this.#state = Math.trunc(seed) >>> 0 || DEFAULT_SEED;
  }

  next() {
    this.#state += DEFAULT_SEED;
    let state = this.#state;
    state = Math.imul(state ^ (state >>> 15), state | 1);
    state ^= state + Math.imul(state ^ (state >>> 7), state | 61);

    return ((state ^ (state >>> 14)) >>> 0) / 4_294_967_296;
  }

  nextInt(minInclusive: number, maxExclusive: number) {
    if (!Number.isInteger(minInclusive) || !Number.isInteger(maxExclusive)) {
      throw new Error('nextInt bounds must be integers.');
    }

    if (maxExclusive <= minInclusive) {
      throw new Error('nextInt requires maxExclusive > minInclusive.');
    }

    const range = maxExclusive - minInclusive;

    return minInclusive + Math.floor(this.next() * range);
  }

  pick<T>(values: readonly T[]) {
    if (values.length === 0) {
      throw new Error('pick requires at least one value.');
    }

    const selectedValue = values[this.nextInt(0, values.length)];

    if (selectedValue === undefined) {
      throw new Error('pick selected an out-of-bounds index.');
    }

    return selectedValue;
  }
}
