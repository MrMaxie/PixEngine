import type { PixelCanvas } from '../src/index.ts';

export type ExampleProject = Readonly<{
  readonly id: string;
  readonly width: number;
  readonly height: number;
  render: () => PixelCanvas;
}>;

export const defineExampleProject = <const Project extends ExampleProject>(project: Project) => project;
