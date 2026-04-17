import {
	createCanvas,
	createPalette,
	fillRect,
	orderedDither,
	type PixelCanvas,
	rgba,
	samplePalette,
	setPixel,
} from "../../src/index.ts";
import type { ExampleProject } from "../example-project.ts";

const WIDTH = 32;
const HEIGHT = 20;
const palette = createPalette([
	rgba(18, 24, 38),
	rgba(69, 95, 118),
	rgba(160, 183, 196),
	rgba(240, 244, 247),
]);

export const ditheringExampleProject: ExampleProject = {
	id: "dithering",
	width: WIDTH,
	height: HEIGHT,
	render(): PixelCanvas {
		const canvas = createCanvas(WIDTH, HEIGHT, rgba(10, 14, 22));

		fillRect(canvas, 1, 1, WIDTH - 2, HEIGHT - 2, rgba(14, 20, 31));

		for (let y = 2; y < 7; y += 1) {
			for (let x = 2; x < WIDTH - 2; x += 1) {
				const value = (x - 2) / (WIDTH - 5);
				const color = samplePalette(palette, value);
				setPixel(canvas, x, y, color);
			}
		}

		for (let y = 8; y < 16; y += 1) {
			for (let x = 2; x < WIDTH - 2; x += 1) {
				const value = (x - 2) / (WIDTH - 5);
				const dithered = orderedDither(value, x, y, palette.length, 4);
				const color = samplePalette(palette, dithered);
				setPixel(canvas, x, y, color);
			}
		}

		for (let index = 0; index < palette.length; index += 1) {
			const swatchX = 2 + index * 7;
			const swatchColor = samplePalette(palette, index / (palette.length - 1));

			fillRect(canvas, swatchX, 17, 5, 2, swatchColor);
		}

		return canvas;
	},
};
