import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

import { writePng } from "../src/index.ts";
import type { ExampleProject } from "./example-project.ts";
import { exampleProjects, getExampleProject } from "./registry.ts";

export interface RenderedExampleProject {
	readonly id: string;
	readonly outputPath: string;
}

export function getDefaultRenderOutputDirectory(cwd = process.cwd()): string {
	return join(cwd, ".local", "renders");
}

export function getExampleOutputPath(
	projectId: string,
	outputDirectory = getDefaultRenderOutputDirectory(),
): string {
	return join(outputDirectory, `${projectId}.png`);
}

export async function renderExampleProject(
	project: ExampleProject,
	outputDirectory = getDefaultRenderOutputDirectory(),
): Promise<RenderedExampleProject> {
	const outputPath = getExampleOutputPath(project.id, outputDirectory);

	await mkdir(dirname(outputPath), { recursive: true });
	await writePng(project.render(), outputPath);

	return {
		id: project.id,
		outputPath,
	};
}

export async function renderExampleProjectById(
	projectId: string,
	outputDirectory = getDefaultRenderOutputDirectory(),
): Promise<RenderedExampleProject> {
	return renderExampleProject(getExampleProject(projectId), outputDirectory);
}

export async function renderAllExampleProjects(
	outputDirectory = getDefaultRenderOutputDirectory(),
): Promise<RenderedExampleProject[]> {
	const renderedProjects: RenderedExampleProject[] = [];

	for (const project of exampleProjects) {
		renderedProjects.push(await renderExampleProject(project, outputDirectory));
	}

	return renderedProjects;
}
