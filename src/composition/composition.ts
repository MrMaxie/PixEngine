import { type ColorValue, Palette, type PaletteColorRef, resolveColorValue, samplePalette } from '../color/palette.ts';
import { type BlendMode, blendColors, Canvas, compositeCanvas } from '../core/canvas.ts';
import { type ColorInput, type RgbaColor, rgba, toRgba } from '../core/color.ts';
import { lerp } from '../core/scalar.ts';
import { type BayerMatrixSize, orderedDither } from '../effects/dithering.ts';

const TRANSPARENT = rgba(0, 0, 0, 0);
const DEFAULT_LAYER_SELECTOR: Selector = {
  type: 'channels',
  a: {
    min: 1,
  },
};

export type Point = Readonly<{
  readonly x: number;
  readonly y: number;
}>;

export type Rect = Readonly<{
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}>;

export type LineMode = 'loose' | 'pixelPerfect' | 'pixelPerfectFilledCorners';

export type ChannelRange = Readonly<{
  readonly min?: number;
  readonly max?: number;
}>;

export type Selector =
  | 'all'
  | Readonly<{
      readonly type: 'color';
      readonly color: ColorValue;
    }>
  | Readonly<{
      readonly type: 'channels';
      readonly r?: ChannelRange;
      readonly g?: ChannelRange;
      readonly b?: ChannelRange;
      readonly a?: ChannelRange;
    }>
  | Readonly<{
      readonly type: 'and';
      readonly selectors: readonly Selector[];
    }>
  | Readonly<{
      readonly type: 'or';
      readonly selectors: readonly Selector[];
    }>
  | Readonly<{
      readonly type: 'not';
      readonly selector: Selector;
    }>;

export type LayerReference = Layer | string | number;

export type BorderEffectOptions = Readonly<{
  readonly color: ColorValue;
  readonly selector?: Selector;
  readonly thickness?: number;
}>;

export type ColorMode = 'smooth' | 'palette' | 'steps';

export type DitherOptions = Readonly<{
  readonly matrixSize?: BayerMatrixSize;
}>;

export type ColorMappingOptions = Readonly<{
  readonly mode?: ColorMode;
  readonly palette?: string | Palette;
  readonly steps?: number;
  readonly dither?: BayerMatrixSize | DitherOptions;
  readonly from?: ColorValue;
  readonly to?: ColorValue;
}>;

export type ReplaceColorEffectOptions = Readonly<{
  readonly selector?: Selector;
  readonly color: ColorValue;
}>;

export type GradientEffectOptions = Readonly<{
  readonly selector?: Selector;
  readonly start: Point;
  readonly end: Point;
}> &
  ColorMappingOptions;

export type ToneSampleContext = Readonly<{
  readonly x: number;
  readonly y: number;
  readonly color: RgbaColor;
}>;

export type ToneEffectOptions = Readonly<{
  readonly selector?: Selector;
  readonly sample: (context: ToneSampleContext) => number;
}> &
  ColorMappingOptions;

export type CurvePathSegment =
  | Readonly<{
      readonly type: 'line';
      readonly to: Point;
    }>
  | Readonly<{
      readonly type: 'quadratic';
      readonly control: Point;
      readonly to: Point;
    }>
  | Readonly<{
      readonly type: 'cubic';
      readonly control1: Point;
      readonly control2: Point;
      readonly to: Point;
    }>;

export type FillCurveOptions = Readonly<{
  readonly start: Point;
  readonly segments: readonly CurvePathSegment[];
  readonly color: ColorValue;
  readonly samplesPerSegment?: number;
}>;

export type CompositionOptions = Readonly<{
  readonly width: number;
  readonly height: number;
  readonly background?: ColorInput;
  readonly palettes?: readonly (Palette | Readonly<{ id: string; palette: Palette }>)[];
}>;

export type LayerOptions = Readonly<{
  readonly id?: string;
  readonly name?: string;
  readonly blendMode?: BlendMode;
  readonly visible?: boolean;
}>;

export type CombineLayersOptions = Readonly<{
  readonly left: LayerReference;
  readonly right: LayerReference;
  readonly mode: BooleanLayerMode;
  readonly mask?: LayerReference;
  readonly id?: string;
  readonly name?: string;
  readonly blendMode?: BlendMode;
  readonly visible?: boolean;
}>;

export type MaskLayerOptions = Readonly<{
  readonly source: LayerReference;
  readonly mask: LayerReference;
  readonly id?: string;
  readonly name?: string;
  readonly blendMode?: BlendMode;
  readonly visible?: boolean;
}>;

type CurveStrokeOptions = Readonly<{
  readonly mode?: LineMode;
  readonly samples?: number;
}>;

type BooleanLayerMode = 'union' | 'intersect' | 'subtract' | 'xor';

type LayerOperation =
  | Readonly<{
      readonly type: 'setPixel';
      readonly x: number;
      readonly y: number;
      readonly color: ColorValue;
    }>
  | Readonly<{
      readonly type: 'fillRect';
      readonly x: number;
      readonly y: number;
      readonly width: number;
      readonly height: number;
      readonly color: ColorValue;
    }>
  | Readonly<{
      readonly type: 'fillCircle';
      readonly center: Point;
      readonly radius: number;
      readonly color: ColorValue;
    }>
  | Readonly<{
      readonly type: 'line';
      readonly x0: number;
      readonly y0: number;
      readonly x1: number;
      readonly y1: number;
      readonly color: ColorValue;
      readonly mode: LineMode;
    }>
  | Readonly<{
      readonly type: 'quadraticCurve';
      readonly start: Point;
      readonly control: Point;
      readonly end: Point;
      readonly color: ColorValue;
      readonly mode: LineMode;
      readonly samples?: number;
    }>
  | Readonly<{
      readonly type: 'cubicCurve';
      readonly start: Point;
      readonly control1: Point;
      readonly control2: Point;
      readonly end: Point;
      readonly color: ColorValue;
      readonly mode: LineMode;
      readonly samples?: number;
    }>
  | Readonly<{
      readonly type: 'fillCurve';
      readonly start: Point;
      readonly segments: readonly CurvePathSegment[];
      readonly color: ColorValue;
      readonly samplesPerSegment?: number;
    }>
  | Readonly<{
      readonly type: 'floodFill';
      readonly x: number;
      readonly y: number;
      readonly color: ColorValue;
    }>;

type LayerEffect =
  | Readonly<{
      readonly type: 'border';
      readonly color: ColorValue;
      readonly selector: Selector;
      readonly thickness: number;
    }>
  | Readonly<{
      readonly type: 'replaceColor';
      readonly selector: Selector;
      readonly color: ColorValue;
    }>
  | Readonly<
      {
        readonly type: 'gradient';
        readonly selector: Selector;
        readonly start: Point;
        readonly end: Point;
      } & ColorMappingOptions
    >
  | Readonly<
      {
        readonly type: 'tone';
        readonly selector: Selector;
        readonly sample: (context: ToneSampleContext) => number;
      } & ColorMappingOptions
    >;

type DerivedLayerSource =
  | Readonly<{
      readonly type: 'combine';
      readonly left: Layer;
      readonly right: Layer;
      readonly mode: BooleanLayerMode;
      readonly mask?: Layer;
    }>
  | Readonly<{
      readonly type: 'mask';
      readonly source: Layer;
      readonly mask: Layer;
    }>;

export class Composition {
  width: number;
  height: number;
  #background: RgbaColor;
  #layers: Layer[];
  #palettes: Map<string, Palette>;
  #snapshot: Canvas;
  #dirty: boolean;
  #layerCounter: number;
  #paletteCounter: number;
  #renderedPaletteVersions: Map<string, number>;

  constructor({ width, height, background = TRANSPARENT, palettes = [] }: CompositionOptions) {
    this.width = assertDimension('width', width);
    this.height = assertDimension('height', height);
    this.#background = toRgba(background);
    this.#layers = [];
    this.#palettes = new Map();
    this.#snapshot = new Canvas({
      width: this.width,
      height: this.height,
      background: this.#background,
    });
    this.#dirty = true;
    this.#layerCounter = 0;
    this.#paletteCounter = 0;
    this.#renderedPaletteVersions = new Map();

    for (const palette of palettes) {
      if (palette instanceof Palette) {
        this.addPalette(palette);
      } else {
        this.addPalette(palette.id, palette.palette);
      }
    }
  }

  get layers() {
    return [...this.#layers];
  }

  get palettes() {
    return new Map(this.#palettes);
  }

  setWidth(width: number) {
    return this.setSize(width, this.height);
  }

  setHeight(height: number) {
    return this.setSize(this.width, height);
  }

  setSize(width: number, height: number) {
    this.width = assertDimension('width', width);
    this.height = assertDimension('height', height);
    this.#snapshot = new Canvas({
      width: this.width,
      height: this.height,
      background: this.#background,
    });
    this.invalidate();

    return this;
  }

  createLayer(options: LayerOptions = {}) {
    const layer = new Layer(this, this.#createLayerId(options.id), options);

    this.#layers.push(layer);
    this.invalidate();

    return layer;
  }

  insertLayer(index: number, options: LayerOptions = {}) {
    const layer = new Layer(this, this.#createLayerId(options.id), options);
    const insertionIndex = clampIndex(index, this.#layers.length);

    this.#layers.splice(insertionIndex, 0, layer);
    this.invalidate();

    return layer;
  }

  removeLayer(reference: LayerReference) {
    const layer = this.getLayer(reference);
    const index = this.#layers.indexOf(layer);

    if (index === -1) {
      throw new Error(`Layer '${layer.id}' is not part of this composition.`);
    }

    this.#layers.splice(index, 1);
    this.invalidate();

    return this;
  }

  moveLayer(reference: LayerReference, index: number) {
    const layer = this.getLayer(reference);
    const currentIndex = this.#layers.indexOf(layer);

    if (currentIndex === -1) {
      throw new Error(`Layer '${layer.id}' is not part of this composition.`);
    }

    const [item] = this.#layers.splice(currentIndex, 1);

    if (item === undefined) {
      throw new Error(`Layer '${layer.id}' is not part of this composition.`);
    }

    this.#layers.splice(clampIndex(index, this.#layers.length), 0, item);
    this.invalidate();

    return this;
  }

  getLayer(reference: LayerReference) {
    if (reference instanceof Layer) {
      if (reference.composition !== this) {
        throw new Error(`Layer '${reference.id}' belongs to a different composition.`);
      }

      return reference;
    }

    if (typeof reference === 'number') {
      const layer = this.#layers[reference];

      if (layer === undefined) {
        throw new Error(`Unknown layer index ${reference}.`);
      }

      return layer;
    }

    const layer = this.#layers.find((candidate) => candidate.id === reference);

    if (layer === undefined) {
      throw new Error(`Unknown layer '${reference}'.`);
    }

    return layer;
  }

  addPalette(idOrPalette: string | Palette, palette?: Palette) {
    const resolvedPalette = typeof idOrPalette === 'string' ? palette : idOrPalette;

    if (resolvedPalette === undefined) {
      throw new Error('Palette instance is required.');
    }

    const paletteId =
      typeof idOrPalette === 'string' ? idOrPalette : (idOrPalette.id ?? `palette-${this.#paletteCounter++}`);

    this.#palettes.set(paletteId, resolvedPalette);
    this.invalidate();

    return resolvedPalette;
  }

  removePalette(reference: string | Palette) {
    if (reference instanceof Palette) {
      const entry = [...this.#palettes.entries()].find(([, palette]) => palette === reference);

      if (entry === undefined) {
        throw new Error('Palette is not registered in this composition.');
      }

      this.#palettes.delete(entry[0]);
    } else {
      if (!this.#palettes.delete(reference)) {
        throw new Error(`Unknown palette '${reference}'.`);
      }
    }

    this.invalidate();

    return this;
  }

  combineLayers(options: CombineLayersOptions) {
    const layer = this.createLayer(createLayerOptions(options));
    const mask = options.mask === undefined ? undefined : this.getLayer(options.mask);

    layer.setDerivedSource(
      mask === undefined
        ? {
            type: 'combine',
            left: this.getLayer(options.left),
            right: this.getLayer(options.right),
            mode: options.mode,
          }
        : {
            type: 'combine',
            left: this.getLayer(options.left),
            right: this.getLayer(options.right),
            mode: options.mode,
            mask,
          },
    );

    this.invalidate();

    return layer;
  }

  maskLayer(options: MaskLayerOptions) {
    const layer = this.createLayer(createLayerOptions(options));

    layer.setDerivedSource({
      type: 'mask',
      source: this.getLayer(options.source),
      mask: this.getLayer(options.mask),
    });

    this.invalidate();

    return layer;
  }

  render() {
    if (!this.#dirty && !this.#havePaletteChanges()) {
      return this;
    }

    const snapshot = new Canvas({
      width: this.width,
      height: this.height,
      background: this.#background,
    });
    const cache = new Map<string, Canvas>();
    const visiting = new Set<string>();

    for (const layer of this.#layers) {
      if (!layer.visible) {
        continue;
      }

      const renderedLayer = this.#renderLayer(layer, cache, visiting);

      compositeCanvas(snapshot, renderedLayer, layer.blendMode);
    }

    this.#snapshot = snapshot;
    this.#dirty = false;
    this.#renderedPaletteVersions = new Map(
      [...this.#palettes.entries()].map(([id, palette]) => [id, palette.version]),
    );

    return this;
  }

  apply(targets?: LayerReference | readonly LayerReference[]) {
    const layers =
      targets === undefined
        ? [...this.#layers]
        : [targets].flatMap((value) => (Array.isArray(value) ? value : [value])).map((value) => this.getLayer(value));
    const cache = new Map<string, Canvas>();
    const visiting = new Set<string>();

    for (const layer of layers) {
      layer.bake(this.#renderLayer(layer, cache, visiting));
    }

    this.invalidate();

    return this;
  }

  toCanvas() {
    this.render();

    return this.#snapshot.clone();
  }

  getPixel(x: number, y: number) {
    this.render();

    return this.#snapshot.getPixel(x, y);
  }

  invalidate() {
    this.#dirty = true;

    return this;
  }

  #renderLayer(layer: Layer, cache: Map<string, Canvas>, visiting: Set<string>): Canvas {
    const cached = cache.get(layer.id);

    if (cached !== undefined) {
      return cached;
    }

    if (visiting.has(layer.id)) {
      throw new Error(`Detected a cycle while rendering layer '${layer.id}'.`);
    }

    visiting.add(layer.id);

    const rendered = layer.renderToCanvas(
      (dependency) => this.#renderLayer(dependency, cache, visiting),
      this.#palettes,
      {
        width: this.width,
        height: this.height,
      },
    );

    visiting.delete(layer.id);
    cache.set(layer.id, rendered);

    return rendered;
  }

  #createLayerId(id?: string) {
    if (id !== undefined) {
      if (this.#layers.some((layer) => layer.id === id)) {
        throw new Error(`Layer '${id}' already exists.`);
      }

      return id;
    }

    let nextId = `layer-${this.#layerCounter++}`;

    while (this.#layers.some((layer) => layer.id === nextId)) {
      nextId = `layer-${this.#layerCounter++}`;
    }

    return nextId;
  }

  #havePaletteChanges() {
    if (this.#renderedPaletteVersions.size !== this.#palettes.size) {
      return true;
    }

    for (const [id, palette] of this.#palettes.entries()) {
      if (this.#renderedPaletteVersions.get(id) !== palette.version) {
        return true;
      }
    }

    return false;
  }
}

export class Layer {
  readonly composition: Composition;
  readonly id: string;
  readonly name: string | undefined;
  visible: boolean;
  blendMode: BlendMode;
  #bitmap: Canvas | null;
  #operations: LayerOperation[];
  #effects: LayerEffect[];
  #offsetX: number;
  #offsetY: number;
  #cropRect: Rect | null;
  #source: DerivedLayerSource | null;

  constructor(composition: Composition, id: string, options: LayerOptions = {}) {
    this.composition = composition;
    this.id = id;
    this.name = options.name;
    this.visible = options.visible ?? true;
    this.blendMode = options.blendMode ?? 'normal';
    this.#bitmap = null;
    this.#operations = [];
    this.#effects = [];
    this.#offsetX = 0;
    this.#offsetY = 0;
    this.#cropRect = null;
    this.#source = null;
  }

  move(dx: number, dy: number) {
    this.#offsetX += Math.trunc(dx);
    this.#offsetY += Math.trunc(dy);

    return this.#touch();
  }

  crop(x: number, y: number, width: number, height: number) {
    this.#cropRect = {
      x: Math.trunc(x),
      y: Math.trunc(y),
      width: assertDimension('crop width', width),
      height: assertDimension('crop height', height),
    };

    return this.#touch();
  }

  clearCrop() {
    this.#cropRect = null;

    return this.#touch();
  }

  setBlendMode(blendMode: BlendMode) {
    this.blendMode = blendMode;

    return this.#touch();
  }

  show() {
    this.visible = true;

    return this.#touch();
  }

  hide() {
    this.visible = false;

    return this.#touch();
  }

  setPixel(x: number, y: number, color: ColorValue) {
    this.#operations.push({
      type: 'setPixel',
      x,
      y,
      color,
    });

    return this.#touch();
  }

  fillRect(x: number, y: number, width: number, height: number, color: ColorValue) {
    this.#operations.push({
      type: 'fillRect',
      x,
      y,
      width,
      height,
      color,
    });

    return this.#touch();
  }

  fillCircle(centerX: number, centerY: number, radius: number, color: ColorValue) {
    this.#operations.push({
      type: 'fillCircle',
      center: {
        x: centerX,
        y: centerY,
      },
      radius,
      color,
    });

    return this.#touch();
  }

  line(x0: number, y0: number, x1: number, y1: number, color: ColorValue, options: CurveStrokeOptions = {}) {
    this.#operations.push({
      type: 'line',
      x0,
      y0,
      x1,
      y1,
      color,
      mode: options.mode ?? 'loose',
    });

    return this.#touch();
  }

  quadraticCurve(
    startX: number,
    startY: number,
    controlX: number,
    controlY: number,
    endX: number,
    endY: number,
    color: ColorValue,
    options: CurveStrokeOptions = {},
  ) {
    this.#operations.push({
      type: 'quadraticCurve',
      start: {
        x: startX,
        y: startY,
      },
      control: {
        x: controlX,
        y: controlY,
      },
      end: {
        x: endX,
        y: endY,
      },
      color,
      mode: options.mode ?? 'loose',
      ...(options.samples === undefined ? {} : { samples: options.samples }),
    });

    return this.#touch();
  }

  cubicCurve(
    startX: number,
    startY: number,
    control1X: number,
    control1Y: number,
    control2X: number,
    control2Y: number,
    endX: number,
    endY: number,
    color: ColorValue,
    options: CurveStrokeOptions = {},
  ) {
    this.#operations.push({
      type: 'cubicCurve',
      start: {
        x: startX,
        y: startY,
      },
      control1: {
        x: control1X,
        y: control1Y,
      },
      control2: {
        x: control2X,
        y: control2Y,
      },
      end: {
        x: endX,
        y: endY,
      },
      color,
      mode: options.mode ?? 'loose',
      ...(options.samples === undefined ? {} : { samples: options.samples }),
    });

    return this.#touch();
  }

  fillCurve(options: FillCurveOptions) {
    this.#operations.push({
      type: 'fillCurve',
      start: options.start,
      segments: options.segments,
      color: options.color,
      ...(options.samplesPerSegment === undefined ? {} : { samplesPerSegment: options.samplesPerSegment }),
    });

    return this.#touch();
  }

  floodFill(x: number, y: number, color: ColorValue) {
    this.#operations.push({
      type: 'floodFill',
      x,
      y,
      color,
    });

    return this.#touch();
  }

  border(options: BorderEffectOptions) {
    this.#effects.push({
      type: 'border',
      color: options.color,
      selector: options.selector ?? DEFAULT_LAYER_SELECTOR,
      thickness: assertThickness(options.thickness ?? 1),
    });

    return this.#touch();
  }

  replaceColor(options: ReplaceColorEffectOptions) {
    this.#effects.push({
      type: 'replaceColor',
      selector: options.selector ?? 'all',
      color: options.color,
    });

    return this.#touch();
  }

  gradient(options: GradientEffectOptions) {
    this.#effects.push({
      type: 'gradient',
      selector: options.selector ?? 'all',
      start: options.start,
      end: options.end,
      ...(options.from === undefined ? {} : { from: options.from }),
      ...(options.to === undefined ? {} : { to: options.to }),
      ...(options.palette === undefined ? {} : { palette: options.palette }),
      ...(options.mode === undefined ? {} : { mode: options.mode }),
      ...(options.steps === undefined ? {} : { steps: options.steps }),
      ...(options.dither === undefined ? {} : { dither: options.dither }),
    });

    return this.#touch();
  }

  tone(options: ToneEffectOptions) {
    this.#effects.push({
      type: 'tone',
      selector: options.selector ?? 'all',
      sample: options.sample,
      ...(options.from === undefined ? {} : { from: options.from }),
      ...(options.to === undefined ? {} : { to: options.to }),
      ...(options.palette === undefined ? {} : { palette: options.palette }),
      ...(options.mode === undefined ? {} : { mode: options.mode }),
      ...(options.steps === undefined ? {} : { steps: options.steps }),
      ...(options.dither === undefined ? {} : { dither: options.dither }),
    });

    return this.#touch();
  }

  apply() {
    this.composition.apply(this);

    return this;
  }

  getDependencies() {
    if (this.#source === null) {
      return [] as const;
    }

    switch (this.#source.type) {
      case 'combine':
        return compactReadonlyArray([this.#source.left, this.#source.right, this.#source.mask]);
      case 'mask':
        return [this.#source.source, this.#source.mask] as const;
    }
  }

  setDerivedSource(source: DerivedLayerSource) {
    this.#source = source;

    return this.#touch();
  }

  renderToCanvas(
    renderDependency: (layer: Layer) => Canvas,
    palettes: ReadonlyMap<string, Palette>,
    size: Readonly<{ width: number; height: number }>,
  ) {
    const canvas = new Canvas({
      width: size.width,
      height: size.height,
      background: TRANSPARENT,
    });

    if (this.#source !== null) {
      compositeCanvasWithOffset(
        canvas,
        renderDerivedSource(this.#source, renderDependency, size),
        'normal',
        this.#offsetX,
        this.#offsetY,
      );
    }

    if (this.#bitmap !== null) {
      compositeCanvasWithOffset(canvas, this.#bitmap, 'normal', this.#offsetX, this.#offsetY);
    }

    for (const operation of this.#operations) {
      applyOperation(canvas, operation, palettes, this.#offsetX, this.#offsetY);
    }

    for (const effect of this.#effects) {
      applyEffect(canvas, effect, palettes);
    }

    if (this.#cropRect !== null) {
      applyCrop(canvas, translateRect(this.#cropRect, this.#offsetX, this.#offsetY));
    }

    return canvas;
  }

  bake(rendered: Canvas) {
    this.#bitmap = rendered.clone();
    this.#operations = [];
    this.#effects = [];
    this.#source = null;
    this.#offsetX = 0;
    this.#offsetY = 0;
    this.#cropRect = null;

    return this.#touch();
  }

  #touch() {
    this.composition.invalidate();

    return this;
  }
}

const renderDerivedSource = (
  source: DerivedLayerSource,
  renderDependency: (layer: Layer) => Canvas,
  size: Readonly<{ width: number; height: number }>,
) => {
  switch (source.type) {
    case 'combine':
      return combineLayerCanvases(
        renderDependency(source.left),
        renderDependency(source.right),
        source.mode,
        size,
        source.mask === undefined ? undefined : renderDependency(source.mask),
      );
    case 'mask':
      return maskCanvas(renderDependency(source.source), renderDependency(source.mask), size);
  }
};

const applyOperation = (
  canvas: Canvas,
  operation: LayerOperation,
  palettes: ReadonlyMap<string, Palette>,
  offsetX: number,
  offsetY: number,
) => {
  switch (operation.type) {
    case 'setPixel':
      canvas.setPixel(operation.x + offsetX, operation.y + offsetY, resolveColorValue(operation.color, palettes));
      return;
    case 'fillRect':
      drawFilledRect(
        canvas,
        operation.x + offsetX,
        operation.y + offsetY,
        operation.width,
        operation.height,
        resolveColorValue(operation.color, palettes),
      );
      return;
    case 'fillCircle':
      drawFilledCircle(
        canvas,
        operation.center.x + offsetX,
        operation.center.y + offsetY,
        operation.radius,
        resolveColorValue(operation.color, palettes),
      );
      return;
    case 'line':
      drawLine(
        canvas,
        operation.x0 + offsetX,
        operation.y0 + offsetY,
        operation.x1 + offsetX,
        operation.y1 + offsetY,
        resolveColorValue(operation.color, palettes),
        operation.mode,
      );
      return;
    case 'quadraticCurve':
      drawCurve(
        canvas,
        sampleQuadraticCurve(operation.start, operation.control, operation.end, operation.samples),
        resolveColorValue(operation.color, palettes),
        operation.mode,
        offsetX,
        offsetY,
      );
      return;
    case 'cubicCurve':
      drawCurve(
        canvas,
        sampleCubicCurve(operation.start, operation.control1, operation.control2, operation.end, operation.samples),
        resolveColorValue(operation.color, palettes),
        operation.mode,
        offsetX,
        offsetY,
      );
      return;
    case 'fillCurve':
      fillCurvePath(canvas, operation, palettes, offsetX, offsetY);
      return;
    case 'floodFill':
      floodFill(canvas, operation.x + offsetX, operation.y + offsetY, resolveColorValue(operation.color, palettes));
      return;
  }
};

const drawFilledRect = (canvas: Canvas, x: number, y: number, width: number, height: number, color: RgbaColor) => {
  const startX = Math.trunc(x);
  const startY = Math.trunc(y);
  const rectWidth = Math.trunc(width);
  const rectHeight = Math.trunc(height);

  if (rectWidth <= 0 || rectHeight <= 0) {
    return;
  }

  for (let py = startY; py < startY + rectHeight; py += 1) {
    for (let px = startX; px < startX + rectWidth; px += 1) {
      canvas.setPixel(px, py, color);
    }
  }
};

const drawFilledCircle = (canvas: Canvas, centerX: number, centerY: number, radius: number, color: RgbaColor) => {
  const normalizedRadius = assertRadius(radius);
  const minX = Math.floor(centerX - normalizedRadius);
  const maxX = Math.ceil(centerX + normalizedRadius);
  const minY = Math.floor(centerY - normalizedRadius);
  const maxY = Math.ceil(centerY + normalizedRadius);
  const radiusSquared = normalizedRadius ** 2;

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const dx = x + 0.5 - centerX;
      const dy = y + 0.5 - centerY;

      if (dx ** 2 + dy ** 2 <= radiusSquared) {
        canvas.setPixel(x, y, color);
      }
    }
  }
};

const drawCurve = (
  canvas: Canvas,
  points: readonly Point[],
  color: RgbaColor,
  lineMode: LineMode,
  offsetX: number,
  offsetY: number,
) => {
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];

    if (previous === undefined || current === undefined) {
      continue;
    }

    drawLine(
      canvas,
      previous.x + offsetX,
      previous.y + offsetY,
      current.x + offsetX,
      current.y + offsetY,
      color,
      lineMode,
    );
  }
};

const fillCurvePath = (
  canvas: Canvas,
  operation: Extract<LayerOperation, { type: 'fillCurve' }>,
  palettes: ReadonlyMap<string, Palette>,
  offsetX: number,
  offsetY: number,
) => {
  const path = sampleCurvePath(operation.start, operation.segments, operation.samplesPerSegment);
  const translated = path.map((point) => ({
    x: point.x + offsetX,
    y: point.y + offsetY,
  }));
  const color = resolveColorValue(operation.color, palettes);

  fillPolygon(canvas, translated, color);

  for (let index = 1; index < translated.length; index += 1) {
    const previous = translated[index - 1];
    const current = translated[index];

    if (previous === undefined || current === undefined) {
      continue;
    }

    drawLine(canvas, previous.x, previous.y, current.x, current.y, color, 'loose');
  }

  const first = translated[0];
  const last = translated.at(-1);

  if (first !== undefined && last !== undefined) {
    drawLine(canvas, last.x, last.y, first.x, first.y, color, 'loose');
  }
};

const sampleCurvePath = (
  start: Point,
  segments: readonly CurvePathSegment[],
  samplesPerSegment: number | undefined,
) => {
  const points: Point[] = [roundPoint(start)];
  let current = start;

  for (const segment of segments) {
    switch (segment.type) {
      case 'line':
        points.push(roundPoint(segment.to));
        current = segment.to;
        break;
      case 'quadratic':
        points.push(...sampleQuadraticCurve(current, segment.control, segment.to, samplesPerSegment).slice(1));
        current = segment.to;
        break;
      case 'cubic':
        points.push(
          ...sampleCubicCurve(current, segment.control1, segment.control2, segment.to, samplesPerSegment).slice(1),
        );
        current = segment.to;
        break;
    }
  }

  return dedupeConsecutivePoints(points);
};

const sampleQuadraticCurve = (start: Point, control: Point, end: Point, samples: number | undefined) => {
  const pointCount = samples ?? estimateCurveSamples([start, control, end]);
  const points: Point[] = [];

  for (let index = 0; index <= pointCount; index += 1) {
    const t = pointCount === 0 ? 0 : index / pointCount;
    const inverse = 1 - t;

    points.push(
      roundPoint({
        x: inverse ** 2 * start.x + 2 * inverse * t * control.x + t ** 2 * end.x,
        y: inverse ** 2 * start.y + 2 * inverse * t * control.y + t ** 2 * end.y,
      }),
    );
  }

  return dedupeConsecutivePoints(points);
};

const sampleCubicCurve = (start: Point, control1: Point, control2: Point, end: Point, samples: number | undefined) => {
  const pointCount = samples ?? estimateCurveSamples([start, control1, control2, end]);
  const points: Point[] = [];

  for (let index = 0; index <= pointCount; index += 1) {
    const t = pointCount === 0 ? 0 : index / pointCount;
    const inverse = 1 - t;

    points.push(
      roundPoint({
        x:
          inverse ** 3 * start.x +
          3 * inverse ** 2 * t * control1.x +
          3 * inverse * t ** 2 * control2.x +
          t ** 3 * end.x,
        y:
          inverse ** 3 * start.y +
          3 * inverse ** 2 * t * control1.y +
          3 * inverse * t ** 2 * control2.y +
          t ** 3 * end.y,
      }),
    );
  }

  return dedupeConsecutivePoints(points);
};

const estimateCurveSamples = (points: readonly Point[]) => {
  let distance = 0;

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];

    if (previous === undefined || current === undefined) {
      continue;
    }

    distance += Math.hypot(current.x - previous.x, current.y - previous.y);
  }

  return Math.max(12, Math.ceil(distance * 1.5));
};

const fillPolygon = (canvas: Canvas, polygon: readonly Point[], color: RgbaColor) => {
  if (polygon.length < 3) {
    return;
  }

  const xs = polygon.map((point) => point.x);
  const ys = polygon.map((point) => point.y);
  const minX = Math.floor(Math.min(...xs));
  const maxX = Math.ceil(Math.max(...xs));
  const minY = Math.floor(Math.min(...ys));
  const maxY = Math.ceil(Math.max(...ys));

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      if (pointInPolygon(x + 0.5, y + 0.5, polygon)) {
        canvas.setPixel(x, y, color);
      }
    }
  }
};

const pointInPolygon = (x: number, y: number, polygon: readonly Point[]) => {
  let inside = false;

  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const currentPoint = polygon[index];
    const previousPoint = polygon[previous];

    if (currentPoint === undefined || previousPoint === undefined) {
      continue;
    }

    const intersects =
      currentPoint.y > y !== previousPoint.y > y &&
      x <
        ((previousPoint.x - currentPoint.x) * (y - currentPoint.y)) / (previousPoint.y - currentPoint.y || 1) +
          currentPoint.x;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
};

const floodFill = (canvas: Canvas, startX: number, startY: number, color: RgbaColor) => {
  const targetColor = canvas.getPixel(startX, startY);

  if (targetColor === null || isSameColor(targetColor, color)) {
    return;
  }

  const queue: Point[] = [{ x: Math.trunc(startX), y: Math.trunc(startY) }];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const point = queue.shift();

    if (point === undefined) {
      continue;
    }

    const key = `${point.x}:${point.y}`;

    if (visited.has(key)) {
      continue;
    }

    visited.add(key);

    const currentColor = canvas.getPixel(point.x, point.y);

    if (currentColor === null || !isSameColor(currentColor, targetColor)) {
      continue;
    }

    canvas.setPixel(point.x, point.y, color);
    queue.push(
      { x: point.x + 1, y: point.y },
      { x: point.x - 1, y: point.y },
      { x: point.x, y: point.y + 1 },
      { x: point.x, y: point.y - 1 },
    );
  }
};

const drawLine = (canvas: Canvas, x0: number, y0: number, x1: number, y1: number, color: RgbaColor, mode: LineMode) => {
  for (const point of rasterizeLine(Math.trunc(x0), Math.trunc(y0), Math.trunc(x1), Math.trunc(y1), mode)) {
    canvas.setPixel(point.x, point.y, color);
  }
};

const rasterizeLine = (x0: number, y0: number, x1: number, y1: number, mode: LineMode) => {
  const loosePoints = rasterizeLooseLine(x0, y0, x1, y1);

  if (mode === 'loose') {
    return loosePoints;
  }

  const filtered = filterPixelPerfectPoints(loosePoints);

  if (mode === 'pixelPerfect') {
    return filtered;
  }

  const extra = new Map<string, Point>();

  for (let index = 1; index < filtered.length; index += 1) {
    const previous = filtered[index - 1];
    const current = filtered[index];

    if (previous === undefined || current === undefined) {
      continue;
    }

    const deltaX = current.x - previous.x;
    const deltaY = current.y - previous.y;

    if (Math.abs(deltaX) === 1 && Math.abs(deltaY) === 1) {
      const fillPoint = {
        x: current.x,
        y: previous.y,
      };

      extra.set(`${fillPoint.x}:${fillPoint.y}`, fillPoint);
    }
  }

  return dedupeConsecutivePoints([...filtered, ...extra.values()].sort(comparePoints));
};

const rasterizeLooseLine = (x0: number, y0: number, x1: number, y1: number) => {
  const points: Point[] = [];
  let currentX = x0;
  let currentY = y0;
  const deltaX = Math.abs(x1 - currentX);
  const stepX = currentX < x1 ? 1 : -1;
  const deltaY = -Math.abs(y1 - currentY);
  const stepY = currentY < y1 ? 1 : -1;
  let error = deltaX + deltaY;

  while (true) {
    points.push({
      x: currentX,
      y: currentY,
    });

    if (currentX === x1 && currentY === y1) {
      return points;
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

const filterPixelPerfectPoints = (points: readonly Point[]) => {
  const filtered: Point[] = [];

  for (const point of points) {
    filtered.push(point);

    if (filtered.length < 3) {
      continue;
    }

    const last = filtered[filtered.length - 1];
    const middle = filtered[filtered.length - 2];
    const first = filtered[filtered.length - 3];

    if (last === undefined || middle === undefined || first === undefined) {
      continue;
    }

    if (formsCorner(first, middle, last)) {
      filtered.splice(filtered.length - 2, 1);
    }
  }

  return filtered;
};

const formsCorner = (first: Point, middle: Point, last: Point) => {
  const horizontalThenVertical =
    first.y === middle.y && middle.x === last.x && first.x !== middle.x && middle.y !== last.y;
  const verticalThenHorizontal =
    first.x === middle.x && middle.y === last.y && first.y !== middle.y && middle.x !== last.x;

  return horizontalThenVertical || verticalThenHorizontal;
};

const applyEffect = (canvas: Canvas, effect: LayerEffect, palettes: ReadonlyMap<string, Palette>) => {
  switch (effect.type) {
    case 'border':
      applyBorderEffect(canvas, effect, palettes);
      return;
    case 'replaceColor':
      applyReplaceColorEffect(canvas, effect, palettes);
      return;
    case 'gradient':
      applyGradientEffect(canvas, effect, palettes);
      return;
    case 'tone':
      applyToneEffect(canvas, effect, palettes);
      return;
  }
};

const applyBorderEffect = (
  canvas: Canvas,
  effect: Extract<LayerEffect, { type: 'border' }>,
  palettes: ReadonlyMap<string, Palette>,
) => {
  const source = canvas.clone();
  const nextColor = resolveColorValue(effect.color, palettes);

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const current = source.getPixel(x, y);

      if (current !== null && matchSelector(effect.selector, current, palettes)) {
        continue;
      }

      if (hasSelectedNeighbor(source, x, y, effect.thickness, effect.selector, palettes)) {
        canvas.setPixel(x, y, nextColor);
      }
    }
  }
};

const hasSelectedNeighbor = (
  canvas: Canvas,
  x: number,
  y: number,
  thickness: number,
  selector: Selector,
  palettes: ReadonlyMap<string, Palette>,
) => {
  for (let offsetY = -thickness; offsetY <= thickness; offsetY += 1) {
    for (let offsetX = -thickness; offsetX <= thickness; offsetX += 1) {
      if (offsetX === 0 && offsetY === 0) {
        continue;
      }

      const color = canvas.getPixel(x + offsetX, y + offsetY);

      if (color !== null && matchSelector(selector, color, palettes)) {
        return true;
      }
    }
  }

  return false;
};

const applyReplaceColorEffect = (
  canvas: Canvas,
  effect: Extract<LayerEffect, { type: 'replaceColor' }>,
  palettes: ReadonlyMap<string, Palette>,
) => {
  const nextColor = resolveColorValue(effect.color, palettes);

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const color = canvas.getPixel(x, y);

      if (color !== null && matchSelector(effect.selector, color, palettes)) {
        canvas.setPixel(x, y, nextColor);
      }
    }
  }
};

const applyGradientEffect = (
  canvas: Canvas,
  effect: Extract<LayerEffect, { type: 'gradient' }>,
  palettes: ReadonlyMap<string, Palette>,
) => {
  const vectorX = effect.end.x - effect.start.x;
  const vectorY = effect.end.y - effect.start.y;
  const lengthSquared = vectorX ** 2 + vectorY ** 2;

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const color = canvas.getPixel(x, y);

      if (color === null || !matchSelector(effect.selector, color, palettes)) {
        continue;
      }

      const amount =
        lengthSquared === 0
          ? 0
          : clampUnit(((x - effect.start.x) * vectorX + (y - effect.start.y) * vectorY) / lengthSquared);

      canvas.setPixel(x, y, resolveMappedColor(amount, x, y, effect, palettes));
    }
  }
};

const applyToneEffect = (
  canvas: Canvas,
  effect: Extract<LayerEffect, { type: 'tone' }>,
  palettes: ReadonlyMap<string, Palette>,
) => {
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const color = canvas.getPixel(x, y);

      if (color === null || !matchSelector(effect.selector, color, palettes)) {
        continue;
      }

      const amount = clampUnit(
        effect.sample({
          x,
          y,
          color,
        }),
      );

      canvas.setPixel(x, y, resolveMappedColor(amount, x, y, effect, palettes));
    }
  }
};

const matchSelector = (selector: Selector, color: RgbaColor, palettes: ReadonlyMap<string, Palette>): boolean => {
  if (selector === 'all') {
    return true;
  }

  switch (selector.type) {
    case 'color':
      return isSameColor(color, resolveColorValue(selector.color, palettes));
    case 'channels':
      return (
        matchChannelRange(color.r, selector.r) &&
        matchChannelRange(color.g, selector.g) &&
        matchChannelRange(color.b, selector.b) &&
        matchChannelRange(color.a, selector.a)
      );
    case 'and':
      return selector.selectors.every((child) => matchSelector(child, color, palettes));
    case 'or':
      return selector.selectors.some((child) => matchSelector(child, color, palettes));
    case 'not':
      return !matchSelector(selector.selector, color, palettes);
  }
};

const matchChannelRange = (value: number, range: ChannelRange | undefined) => {
  if (range === undefined) {
    return true;
  }

  const min = range.min ?? 0;
  const max = range.max ?? 255;

  return value >= min && value <= max;
};

const resolveMappedColor = (
  amount: number,
  x: number,
  y: number,
  options: ColorMappingOptions,
  palettes: ReadonlyMap<string, Palette>,
) => {
  const mode = resolveColorMode(options);
  const ditherSize = resolveDitherSize(options.dither);

  if (mode === 'palette') {
    const palette = resolveEffectPalette(options.palette, palettes);
    const value = ditherSize === null ? amount : orderedDither(amount, x, y, palette.length, ditherSize);

    return samplePalette(palette, value);
  }

  if (mode === 'steps') {
    const levels = resolveStepCount(options.steps, options.palette, palettes);
    const value =
      ditherSize === null ? quantizeAmount(amount, levels) : orderedDither(amount, x, y, levels, ditherSize);

    if (options.palette !== undefined) {
      return samplePalette(resolveEffectPalette(options.palette, palettes), value);
    }

    const from = resolveGradientEndpoint('from', options.from, palettes);
    const to = resolveGradientEndpoint('to', options.to, palettes);

    return mixColors(from, to, value);
  }

  const from = resolveGradientEndpoint('from', options.from, palettes);
  const to = resolveGradientEndpoint('to', options.to, palettes);

  return mixColors(from, to, amount);
};

const resolveColorMode = (options: ColorMappingOptions): ColorMode => {
  if (options.mode !== undefined) {
    return options.mode;
  }

  if (options.palette !== undefined) {
    return 'palette';
  }

  if (options.steps !== undefined) {
    return 'steps';
  }

  return 'smooth';
};

const resolveEffectPalette = (reference: string | Palette | undefined, palettes: ReadonlyMap<string, Palette>) => {
  if (reference instanceof Palette) {
    return reference;
  }

  if (typeof reference === 'string') {
    const palette = palettes.get(reference);

    if (palette === undefined) {
      throw new Error(`Unknown palette '${reference}'.`);
    }

    return palette;
  }

  if (palettes.size === 1) {
    const palette = palettes.values().next().value;

    if (palette !== undefined) {
      return palette;
    }
  }

  throw new Error('A palette-aware color mapping requires a palette reference.');
};

const resolveGradientEndpoint = (
  name: 'from' | 'to',
  value: ColorValue | undefined,
  palettes: ReadonlyMap<string, Palette>,
) => {
  if (value === undefined) {
    throw new Error(`Color mapping '${name}' value is required for this mode.`);
  }

  return resolveColorValue(value, palettes);
};

const resolveDitherSize = (value: BayerMatrixSize | DitherOptions | undefined): BayerMatrixSize | null => {
  if (value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    return value;
  }

  return value.matrixSize ?? 4;
};

const resolveStepCount = (
  requestedSteps: number | undefined,
  paletteReference: string | Palette | undefined,
  palettes: ReadonlyMap<string, Palette>,
) => {
  if (requestedSteps !== undefined) {
    return assertStepCount(requestedSteps);
  }

  if (paletteReference !== undefined) {
    return resolveEffectPalette(paletteReference, palettes).length;
  }

  return 4;
};

const quantizeAmount = (amount: number, levels: number) => {
  if (levels <= 1) {
    return 0;
  }

  return Math.round(clampUnit(amount) * (levels - 1)) / (levels - 1);
};

const mixColors = (from: RgbaColor, to: RgbaColor, amount: number) => {
  return rgba(
    lerp(from.r, to.r, amount),
    lerp(from.g, to.g, amount),
    lerp(from.b, to.b, amount),
    lerp(from.a, to.a, amount),
  );
};

const applyCrop = (canvas: Canvas, rect: Rect) => {
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      if (x < rect.x || y < rect.y || x >= rect.x + rect.width || y >= rect.y + rect.height) {
        canvas.setPixel(x, y, TRANSPARENT);
      }
    }
  }
};

const combineLayerCanvases = (
  left: Canvas,
  right: Canvas,
  mode: BooleanLayerMode,
  size: Readonly<{ width: number; height: number }>,
  mask?: Canvas,
) => {
  const canvas = new Canvas({
    width: size.width,
    height: size.height,
    background: TRANSPARENT,
  });

  for (let y = 0; y < size.height; y += 1) {
    for (let x = 0; x < size.width; x += 1) {
      const leftColor = left.getPixel(x, y) ?? TRANSPARENT;
      const rightColor = right.getPixel(x, y) ?? TRANSPARENT;
      const hasLeft = leftColor.a > 0;
      const hasRight = rightColor.a > 0;

      switch (mode) {
        case 'union':
          canvas.setPixel(x, y, blendColors(leftColor, rightColor, 'normal'));
          break;
        case 'intersect':
          canvas.setPixel(x, y, hasLeft && hasRight ? blendColors(leftColor, rightColor, 'normal') : TRANSPARENT);
          break;
        case 'subtract':
          canvas.setPixel(x, y, hasLeft && !hasRight ? leftColor : TRANSPARENT);
          break;
        case 'xor':
          canvas.setPixel(x, y, hasLeft === hasRight ? TRANSPARENT : hasLeft ? leftColor : rightColor);
          break;
      }
    }
  }

  return mask === undefined ? canvas : maskCanvas(canvas, mask, size);
};

const maskCanvas = (source: Canvas, mask: Canvas, size: Readonly<{ width: number; height: number }>) => {
  const canvas = new Canvas({
    width: size.width,
    height: size.height,
    background: TRANSPARENT,
  });

  for (let y = 0; y < size.height; y += 1) {
    for (let x = 0; x < size.width; x += 1) {
      const sourceColor = source.getPixel(x, y) ?? TRANSPARENT;
      const maskColor = mask.getPixel(x, y) ?? TRANSPARENT;

      if (maskColor.a === 0 || sourceColor.a === 0) {
        canvas.setPixel(x, y, TRANSPARENT);
        continue;
      }

      canvas.setPixel(x, y, rgba(sourceColor.r, sourceColor.g, sourceColor.b, sourceColor.a * (maskColor.a / 255)));
    }
  }

  return canvas;
};

const compositeCanvasWithOffset = (
  target: Canvas,
  source: Canvas,
  blendMode: BlendMode,
  offsetX: number,
  offsetY: number,
) => {
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const sourceColor = source.getPixel(x, y);
      const targetColor = target.getPixel(x + offsetX, y + offsetY);

      if (sourceColor === null || targetColor === null || sourceColor.a === 0) {
        continue;
      }

      target.setPixel(x + offsetX, y + offsetY, blendColors(targetColor, sourceColor, blendMode));
    }
  }

  return target;
};

const translateRect = (rect: Rect, dx: number, dy: number) => {
  return {
    x: rect.x + dx,
    y: rect.y + dy,
    width: rect.width,
    height: rect.height,
  };
};

const compactReadonlyArray = <Value>(values: readonly (Value | undefined)[]) => {
  return values.filter((value): value is Value => value !== undefined);
};

const createLayerOptions = (
  options: Readonly<{ id?: string; name?: string; blendMode?: BlendMode; visible?: boolean }>,
): LayerOptions => {
  return {
    ...(options.id === undefined ? {} : { id: options.id }),
    ...(options.name === undefined ? {} : { name: options.name }),
    ...(options.blendMode === undefined ? {} : { blendMode: options.blendMode }),
    ...(options.visible === undefined ? {} : { visible: options.visible }),
  };
};

const dedupeConsecutivePoints = (points: readonly Point[]) => {
  const result: Point[] = [];

  for (const point of points) {
    const previous = result.at(-1);

    if (previous === undefined || previous.x !== point.x || previous.y !== point.y) {
      result.push(point);
    }
  }

  return result;
};

const comparePoints = (left: Point, right: Point) => {
  if (left.y === right.y) {
    return left.x - right.x;
  }

  return left.y - right.y;
};

const roundPoint = (point: Point) => {
  return {
    x: Math.round(point.x),
    y: Math.round(point.y),
  };
};

const isSameColor = (left: RgbaColor, right: RgbaColor) => {
  return left.r === right.r && left.g === right.g && left.b === right.b && left.a === right.a;
};

const assertDimension = (name: string, value: number) => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer, received ${value}.`);
  }

  return value;
};

const assertThickness = (value: number) => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Border thickness must be a positive integer, received ${value}.`);
  }

  return value;
};

const assertRadius = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Circle radius must be a positive finite number, received ${value}.`);
  }

  return value;
};

const assertStepCount = (value: number) => {
  if (!Number.isInteger(value) || value < 2) {
    throw new Error(`Color step count must be an integer of at least 2, received ${value}.`);
  }

  return value;
};

const clampIndex = (value: number, max: number) => {
  return Math.min(Math.max(0, Math.trunc(value)), max);
};

const clampUnit = (value: number) => {
  return Math.min(1, Math.max(0, value));
};

export const paletteColor = (palette: string | Palette | undefined, nameOrIndex: string | number): PaletteColorRef => {
  return typeof nameOrIndex === 'number'
    ? {
        ...(palette === undefined ? {} : { palette }),
        index: nameOrIndex,
      }
    : {
        ...(palette === undefined ? {} : { palette }),
        name: nameOrIndex,
      };
};
