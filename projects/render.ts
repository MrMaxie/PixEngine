import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { writePng } from '../src/index.ts';
import type { ExampleProject } from './example-project.ts';
import { exampleProjects, getExampleProject } from './registry.ts';

export type RenderedExampleProject = Readonly<{
  readonly id: string;
  readonly outputPath: string;
}>;

export const getDefaultRenderOutputDirectory = (cwd = process.cwd()) => join(cwd, '.local', 'renders');

export const getExampleOutputPath = (projectId: string, outputDirectory = getDefaultRenderOutputDirectory()) => {
  return join(outputDirectory, `${projectId}.png`);
};

export const renderExampleProject = async (
  project: ExampleProject,
  outputDirectory = getDefaultRenderOutputDirectory(),
) => {
  const outputPath = getExampleOutputPath(project.id, outputDirectory);

  await mkdir(dirname(outputPath), { recursive: true });
  await writePng(project.render(), outputPath);

  return {
    id: project.id,
    outputPath,
  };
};

export const renderExampleProjectById = async (
  projectId: string,
  outputDirectory = getDefaultRenderOutputDirectory(),
) => {
  return renderExampleProject(getExampleProject(projectId), outputDirectory);
};

export const renderAllExampleProjects = (outputDirectory = getDefaultRenderOutputDirectory()) =>
  Promise.all(exampleProjects.map((project) => renderExampleProject(project, outputDirectory)));
