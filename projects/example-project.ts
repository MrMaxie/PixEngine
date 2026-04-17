import type { PixelCanvas } from "../src/index.ts";

export interface ExampleProject {
	readonly id: string;
	readonly width: number;
	readonly height: number;
	render(): PixelCanvas;
}
