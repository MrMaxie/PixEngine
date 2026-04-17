import { describe, expect, test } from "bun:test";

import { createValueNoise2D, sampleFractalNoise2D } from "../src/index.ts";

describe("value noise", () => {
	test("is deterministic for the same seed and coordinates", () => {
		const left = createValueNoise2D(1234);
		const right = createValueNoise2D(1234);

		expect(left.sample(2.25, 3.5)).toBeCloseTo(right.sample(2.25, 3.5), 12);
		expect(left.sample(2.25, 3.5)).toBeCloseTo(0.593664912856184, 12);
	});

	test("changes with seed and stays inside the unit interval", () => {
		const left = createValueNoise2D(1234);
		const right = createValueNoise2D(4321);
		const leftValue = left.sample(1.1, 4.2);
		const rightValue = right.sample(1.1, 4.2);

		expect(leftValue).toBeGreaterThanOrEqual(0);
		expect(leftValue).toBeLessThanOrEqual(1);
		expect(rightValue).toBeGreaterThanOrEqual(0);
		expect(rightValue).toBeLessThanOrEqual(1);
		expect(leftValue).not.toBeCloseTo(rightValue, 12);
	});

	test("supports deterministic octave layering through the fractal helper", () => {
		const noise = createValueNoise2D(9041);
		const value = sampleFractalNoise2D(noise, 1.8, 0.7, {
			octaves: 4,
			persistence: 0.55,
		});

		expect(value).toBeCloseTo(0.5565765985903238, 12);
	});
});
