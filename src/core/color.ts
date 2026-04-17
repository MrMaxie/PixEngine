export interface RgbaColor {
	readonly r: number;
	readonly g: number;
	readonly b: number;
	readonly a: number;
}

type ColorObject = Readonly<{
	r: number;
	g: number;
	b: number;
	a?: number;
}>;

type ColorTuple =
	| readonly [number, number, number]
	| readonly [number, number, number, number];

export type ColorInput = ColorObject | ColorTuple;

const DEFAULT_ALPHA = 255;
const MIN_CHANNEL = 0;
const MAX_CHANNEL = 255;

export function rgba(
	r: number,
	g: number,
	b: number,
	a = DEFAULT_ALPHA,
): RgbaColor {
	return {
		r: clampChannel(r),
		g: clampChannel(g),
		b: clampChannel(b),
		a: clampChannel(a),
	};
}

export function toRgba(color: ColorInput): RgbaColor {
	if (isColorTuple(color)) {
		return rgba(color[0], color[1], color[2], color[3] ?? DEFAULT_ALPHA);
	}

	return rgba(color.r, color.g, color.b, color.a ?? DEFAULT_ALPHA);
}

function clampChannel(value: number): number {
	if (!Number.isFinite(value)) {
		throw new Error(`Color channel must be finite, received ${value}.`);
	}

	return Math.min(MAX_CHANNEL, Math.max(MIN_CHANNEL, Math.round(value)));
}

function isColorTuple(color: ColorInput): color is ColorTuple {
	return Array.isArray(color);
}
