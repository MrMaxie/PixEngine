import { expect, test } from "bun:test";

import { createCanvas, line, rgba } from "../src/index.ts";

test("line clips naturally through out-of-bounds setPixel writes", () => {
	const canvas = createCanvas(4, 3, rgba(0, 0, 0, 0));
	const written = line(canvas, -1, 1, 2, 1, rgba(255, 0, 0));

	expect(written).toBe(3);
	expect(canvas.getPixel(0, 1)).toEqual(rgba(255, 0, 0, 255));
	expect(canvas.getPixel(1, 1)).toEqual(rgba(255, 0, 0, 255));
	expect(canvas.getPixel(2, 1)).toEqual(rgba(255, 0, 0, 255));
	expect(canvas.getPixel(3, 1)).toEqual(rgba(0, 0, 0, 0));
});
