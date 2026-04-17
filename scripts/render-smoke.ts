import { renderExampleProjectById } from "../projects/render.ts";

const renderedProject = await renderExampleProjectById("smoke");

console.log(`Rendered ${renderedProject.id} to ${renderedProject.outputPath}`);
