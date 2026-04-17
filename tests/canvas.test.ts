import { describe, expect, test } from "bun:test";

import { createCanvas, rgba } from "../src/index.ts";

describe("PixelCanvas", () => {
	test("fills the canvas with the initial color", () => {
		const canvas = createCanvas(2, 2, rgba(12, 34, 56));

		expect(canvas.getPixel(0, 0)).toEqual(rgba(12, 34, 56, 255));
		expect(canvas.getPixel(1, 1)).toEqual(rgba(12, 34, 56, 255));
	});
});
