export function assertFiniteNumber(name: string, value: number): void {
	if (!Number.isFinite(value)) {
		throw new Error(`${name} must be finite, received ${value}.`);
	}
}

export function clampUnit(value: number, name = "value"): number {
	assertFiniteNumber(name, value);

	return Math.min(1, Math.max(0, value));
}

export function lerp(start: number, end: number, amount: number): number {
	return start + (end - start) * amount;
}

export function smoothstep(value: number): number {
	return value * value * (3 - 2 * value);
}
