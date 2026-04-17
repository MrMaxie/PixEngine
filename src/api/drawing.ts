import type { PixelCanvas } from '../core/canvas.ts';
import type { ColorInput } from '../core/color.ts';

export const setPixel = (canvas: PixelCanvas, x: number, y: number, color: ColorInput) => canvas.setPixel(x, y, color);

export const fillRect = (
  canvas: PixelCanvas,
  x: number,
  y: number,
  width: number,
  height: number,
  color: ColorInput,
) => {
  const startX = Math.trunc(x);
  const startY = Math.trunc(y);
  const rectWidth = Math.trunc(width);
  const rectHeight = Math.trunc(height);

  if (rectWidth <= 0 || rectHeight <= 0) {
    return 0;
  }

  let written = 0;

  for (let py = startY; py < startY + rectHeight; py += 1) {
    for (let px = startX; px < startX + rectWidth; px += 1) {
      written += Number(canvas.setPixel(px, py, color));
    }
  }

  return written;
};

export const line = (canvas: PixelCanvas, x0: number, y0: number, x1: number, y1: number, color: ColorInput) => {
  let currentX = Math.trunc(x0);
  let currentY = Math.trunc(y0);
  const targetX = Math.trunc(x1);
  const targetY = Math.trunc(y1);

  const deltaX = Math.abs(targetX - currentX);
  const stepX = currentX < targetX ? 1 : -1;
  const deltaY = -Math.abs(targetY - currentY);
  const stepY = currentY < targetY ? 1 : -1;

  let error = deltaX + deltaY;
  let written = 0;

  while (true) {
    written += Number(canvas.setPixel(currentX, currentY, color));

    if (currentX === targetX && currentY === targetY) {
      return written;
    }

    const doubledError = 2 * error;

    if (doubledError >= deltaY) {
      error += deltaY;
      currentX += stepX;
    }

    if (doubledError <= deltaX) {
      error += deltaX;
      currentY += stepY;
    }
  }
};
