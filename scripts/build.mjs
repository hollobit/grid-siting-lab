import { cp, mkdir, rm } from "node:fs/promises";
const root = new URL("../", import.meta.url);
const output = new URL("dist/", root);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of ["index.html", "styles.css", "app.js", "siting-3d.js", "siting-3d.css", "siting-massing.mjs", "data"]) {
  await cp(new URL(file, root), new URL(file, output), { recursive: true });
}
console.log("Static site built in dist/");
