import { expect, test } from 'bun:test';
import { PNG } from 'pngjs';

import { Composition, encodePng, rgba } from '../src/index.ts';

test('encodePng returns a valid PNG payload for a composition render', () => {
  const composition = new Composition({ width: 2, height: 3 });

  composition.createLayer().fillRect(0, 0, 1, 1, rgba(255, 0, 0));

  const encoded = encodePng(composition);
  const decoded = PNG.sync.read(Buffer.from(encoded));

  expect(decoded.width).toBe(2);
  expect(decoded.height).toBe(3);
  expect(Array.from(decoded.data.subarray(0, 4))).toEqual([255, 0, 0, 255]);
});
