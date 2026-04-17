import { readFile } from 'node:fs/promises';

import { PNG } from 'pngjs';

export const decodePngData = (data: Uint8Array | Buffer) => PNG.sync.read(Buffer.from(data));

export const readDecodedPng = async (filePath: string) => decodePngData(await readFile(filePath));
