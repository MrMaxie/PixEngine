import { join } from 'node:path';

import { loadPaletteFromGpl } from '../../src/index.ts';

export const pico8Palette = await loadPaletteFromGpl(join(process.cwd(), 'assets', 'pico-8.gpl'), {
  id: 'pico8',
  name: 'PICO-8',
});
