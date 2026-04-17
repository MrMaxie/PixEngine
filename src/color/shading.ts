import type { RgbaColor } from "../core/color.ts";
import { clampUnit } from "../core/scalar.ts";
import {
	type ColorRamp,
	type Palette,
	sampleColorRamp,
	samplePalette,
} from "./palette.ts";

export function shadeRamp(ramp: ColorRamp, light: number): RgbaColor {
	return sampleColorRamp(ramp, light);
}

export function shadePalette(palette: Palette, light: number): RgbaColor {
	return samplePalette(palette, light);
}

export function lambertLight(
	normalX: number,
	normalY: number,
	lightX: number,
	lightY: number,
	ambient = 0,
): number {
	const normal = normalizeVector(normalX, normalY, "normal");
	const light = normalizeVector(lightX, lightY, "light");
	const ambientLight = clampUnit(ambient, "ambient");
	const directLight = Math.max(0, normal.x * light.x + normal.y * light.y);

	return clampUnit(ambientLight + directLight * (1 - ambientLight));
}

function normalizeVector(
	x: number,
	y: number,
	name: string,
): Readonly<{ x: number; y: number }> {
	if (!Number.isFinite(x) || !Number.isFinite(y)) {
		throw new Error(`${name} vector must be finite.`);
	}

	const length = Math.hypot(x, y);

	if (length === 0) {
		throw new Error(`${name} vector must not be zero-length.`);
	}

	return {
		x: x / length,
		y: y / length,
	};
}
