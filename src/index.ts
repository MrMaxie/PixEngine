export {
  type ColorRamp,
  type ColorRampStop,
  type ColorRampStopInput,
  type ColorValue,
  createColorRamp,
  createPalette,
  loadPaletteFromGpl,
  loadPaletteFromHex,
  loadPaletteFromPng,
  Palette,
  type PaletteColorRef,
  type PaletteEntry,
  type PaletteEntryInput,
  parseGimpPalette,
  parseHexPalette,
  parsePalettePng,
  quantizeToPalette,
  resolveColorValue,
  sampleColorRamp,
  samplePalette,
} from './color/palette.ts';
export { lambertLight, shadePalette, shadeRamp } from './color/shading.ts';
export {
  type BorderEffectOptions,
  type ChannelRange,
  type ColorMappingOptions,
  type ColorMode,
  type CombineLayersOptions,
  Composition,
  type CompositionOptions,
  type CurvePathSegment,
  type DitherOptions,
  type FillCurveOptions,
  type GradientEffectOptions,
  Layer,
  type LayerOptions,
  type LayerReference,
  type LineMode,
  type MaskLayerOptions,
  type Point,
  paletteColor,
  type Rect,
  type ReplaceColorEffectOptions,
  type Selector,
  type ToneEffectOptions,
  type ToneSampleContext,
} from './composition/composition.ts';
export { type BlendMode, blendColors, Canvas, compositeCanvas } from './core/canvas.ts';
export { type ColorInput, type RgbaColor, rgba, toRgba } from './core/color.ts';
export {
  createValueNoise2D,
  type FractalNoiseOptions,
  sampleFractalNoise2D,
  ValueNoise2D,
} from './core/noise.ts';
export { SeededRng } from './core/rng.ts';
export {
  type BayerMatrixSize,
  getBayerMatrix,
  getOrderedDitherThreshold,
  orderedDither,
} from './effects/dithering.ts';
export { encodePng, type RenderableImage, writePng } from './io/png.ts';
