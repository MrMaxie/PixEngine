import { describe, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { exampleProjects } from "../projects/registry.ts";
import {
	getDefaultRenderOutputDirectory,
	renderAllExampleProjects,
	renderExampleProjectById,
} from "../projects/render.ts";
import { encodePng } from "../src/index.ts";
import { decodePngData, readDecodedPng } from "./helpers/png.ts";

const goldenDirectory = join(process.cwd(), "tests", "golden");

describe("example project renders", () => {
	for (const project of exampleProjects) {
		test(`${project.id} matches the committed golden PNG`, async () => {
			const rendered = decodePngData(encodePng(project.render()));
			const golden = await readDecodedPng(
				join(goldenDirectory, `${project.id}.png`),
			);

			expect(rendered.width).toBe(golden.width);
			expect(rendered.height).toBe(golden.height);
			expect(Array.from(rendered.data)).toEqual(Array.from(golden.data));
		});
	}

	test("renderExampleProjectById writes a named PNG file", async () => {
		const outputDirectory = await mkdtemp(join(tmpdir(), "pixengine-single-"));
		const renderedProject = await renderExampleProjectById(
			"smoke",
			outputDirectory,
		);
		const writtenPng = await readDecodedPng(renderedProject.outputPath);

		expect(renderedProject.outputPath).toBe(join(outputDirectory, "smoke.png"));
		expect(writtenPng.width).toBe(16);
		expect(writtenPng.height).toBe(16);
	});

	test("renderAllExampleProjects writes every registered project", async () => {
		const outputDirectory = await mkdtemp(join(tmpdir(), "pixengine-all-"));
		const renderedProjects = await renderAllExampleProjects(outputDirectory);

		expect(renderedProjects.map(({ id }) => id)).toEqual(
			exampleProjects.map(({ id }) => id),
		);

		for (const renderedProject of renderedProjects) {
			const writtenPng = await readDecodedPng(renderedProject.outputPath);
			const project = exampleProjects.find(
				({ id }) => id === renderedProject.id,
			);

			if (project === undefined) {
				throw new Error(`Missing example project ${renderedProject.id}.`);
			}

			expect(writtenPng.width).toBe(project.width);
			expect(writtenPng.height).toBe(project.height);
		}
	});

	test("default render output directory stays under .local/renders", () => {
		expect(
			getDefaultRenderOutputDirectory("D:\\Projects\\Personal\\PixEngine"),
		).toBe("D:\\Projects\\Personal\\PixEngine\\.local\\renders");
	});
});
