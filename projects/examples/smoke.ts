import {
	createCanvas,
	fillRect,
	line,
	type PixelCanvas,
	rgba,
} from "../../src/index.ts";

const SIZE = 16;

export function renderSmokeExample(): PixelCanvas {
	const canvas = createCanvas(SIZE, SIZE, rgba(22, 28, 45));

	fillRect(canvas, 1, 1, 14, 14, rgba(36, 44, 68));
	fillRect(canvas, 4, 4, 8, 8, rgba(232, 235, 242));
	fillRect(canvas, 6, 6, 4, 4, rgba(82, 193, 119));
	line(canvas, 0, 0, SIZE - 1, SIZE - 1, rgba(255, 189, 89));
	line(canvas, SIZE - 1, 0, 0, SIZE - 1, rgba(255, 110, 90));

	return canvas;
}
