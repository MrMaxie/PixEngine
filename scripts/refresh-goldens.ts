import { join } from "node:path";

import { renderAllExampleProjects } from "../projects/render.ts";

const outputDirectory = join(process.cwd(), "tests", "golden");
const renderedProjects = await renderAllExampleProjects(outputDirectory);

for (const renderedProject of renderedProjects) {
	console.log(
		`Refreshed golden ${renderedProject.id} at ${renderedProject.outputPath}`,
	);
}
