import { expect, test } from "bun:test";
import { PNG } from "pngjs";

import { createCanvas, encodePng, fillRect, rgba } from "../src/index.ts";

test("encodePng returns a valid PNG payload", () => {
	const canvas = createCanvas(2, 3, rgba(0, 0, 0, 0));
	fillRect(canvas, 0, 0, 1, 1, rgba(255, 0, 0));

	const encoded = encodePng(canvas);
	const decoded = PNG.sync.read(Buffer.from(encoded));

	expect(decoded.width).toBe(2);
	expect(decoded.height).toBe(3);
	expect(Array.from(decoded.data.subarray(0, 4))).toEqual([255, 0, 0, 255]);
});
