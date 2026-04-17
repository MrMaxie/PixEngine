import type { ExampleProject } from "./example-project.ts";
import { ditheringExampleProject } from "./examples/dithering.ts";
import { noiseExampleProject } from "./examples/noise.ts";
import { shadingExampleProject } from "./examples/shading.ts";
import { smokeExampleProject } from "./examples/smoke.ts";
import { swordExampleProject } from "./examples/sword.ts";
import { treeExampleProject } from "./examples/tree.ts";

export const exampleProjects = [
	ditheringExampleProject,
	noiseExampleProject,
	shadingExampleProject,
	smokeExampleProject,
	swordExampleProject,
	treeExampleProject,
] as const satisfies readonly ExampleProject[];

const exampleProjectMap = new Map(
	exampleProjects.map((project) => [project.id, project]),
);

export function getExampleProject(projectId: string): ExampleProject {
	const project = exampleProjectMap.get(projectId);

	if (project === undefined) {
		const knownIds = exampleProjects.map(({ id }) => id).join(", ");

		throw new Error(
			`Unknown example project "${projectId}". Known IDs: ${knownIds}.`,
		);
	}

	return project;
}

export function listExampleProjectIds(): readonly string[] {
	return exampleProjects.map(({ id }) => id);
}
