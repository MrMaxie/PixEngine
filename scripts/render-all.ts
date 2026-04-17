import { renderAllExampleProjects } from '../projects/render.ts';

const [outputDirectory] = process.argv.slice(2);
const renderedProjects = await renderAllExampleProjects(outputDirectory);

for (const renderedProject of renderedProjects) {
  console.log(`Rendered ${renderedProject.id} to ${renderedProject.outputPath}`);
}
