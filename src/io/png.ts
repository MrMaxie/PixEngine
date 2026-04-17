import { PNG } from "pngjs";

import type { PixelCanvas } from "../core/canvas.ts";

export function encodePng(canvas: PixelCanvas): Uint8Array {
	const png = new PNG({ width: canvas.width, height: canvas.height });
	png.data = Buffer.from(canvas.toUint8Array());

	return Uint8Array.from(PNG.sync.write(png));
}

export async function writePng(
	canvas: PixelCanvas,
	outputPath: string,
): Promise<number> {
	return Bun.write(outputPath, encodePng(canvas));
}
