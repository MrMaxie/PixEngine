import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import { renderSmokeExample } from "../projects/examples/smoke.ts";
import { writePng } from "../src/index.ts";

const outputDirectory = join(process.cwd(), ".local", "renders");
const outputPath = join(outputDirectory, "smoke.png");

await mkdir(outputDirectory, { recursive: true });
await writePng(renderSmokeExample(), outputPath);

console.log(`Rendered smoke example to ${outputPath}`);
