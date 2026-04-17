import { listExampleProjectIds } from '../projects/registry.ts';
import { renderExampleProjectById } from '../projects/render.ts';

const [projectId, outputDirectory] = process.argv.slice(2);

if (projectId === undefined) {
  throw new Error(`Missing example project ID. Known IDs: ${listExampleProjectIds().join(', ')}.`);
}

const renderedProject = await renderExampleProjectById(projectId, outputDirectory);

console.log(`Rendered ${renderedProject.id} to ${renderedProject.outputPath}`);
