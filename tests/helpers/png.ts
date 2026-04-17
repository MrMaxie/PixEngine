import { readFile } from "node:fs/promises";

import { PNG } from "pngjs";

export function decodePngData(data: Uint8Array | Buffer): PNG {
	return PNG.sync.read(Buffer.from(data));
}

export async function readDecodedPng(filePath: string): Promise<PNG> {
	return decodePngData(await readFile(filePath));
}
