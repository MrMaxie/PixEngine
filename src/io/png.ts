import { PNG } from 'pngjs';

import type { PixelCanvas } from '../core/canvas.ts';

export const encodePng = (canvas: PixelCanvas) => {
  const png = new PNG({ width: canvas.width, height: canvas.height });
  png.data = Buffer.from(canvas.toUint8Array());

  return Uint8Array.from(PNG.sync.write(png));
};

export const writePng = async (canvas: PixelCanvas, outputPath: string) => Bun.write(outputPath, encodePng(canvas));
