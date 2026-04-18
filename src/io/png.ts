import { PNG } from 'pngjs';

import { Composition } from '../composition/composition.ts';
import type { Canvas } from '../core/canvas.ts';

export type RenderableImage = Canvas | Composition;

export const encodePng = (image: RenderableImage) => {
  const canvas = image instanceof Composition ? image.toCanvas() : image;
  const png = new PNG({ width: canvas.width, height: canvas.height });

  png.data = Buffer.from(canvas.toUint8Array());

  return Uint8Array.from(PNG.sync.write(png));
};

export const writePng = async (image: RenderableImage, outputPath: string) => {
  return Bun.write(outputPath, encodePng(image));
};
