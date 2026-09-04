import { cp, mkdir, rm } from "node:fs/promises";

await rm("./dist", { recursive: true, force: true });

const result = await Bun.build({
	entrypoints: ["./index.html"],
	outdir: "./dist",
	minify: true,
	external: ["@swisseph/browser"],
});

if (!result.success) {
	console.error(result.logs);
	process.exit(1);
}

await mkdir("./dist/vendor/swisseph-browser", { recursive: true });
await cp(
	"../node_modules/@swisseph/browser/dist",
	"./dist/vendor/swisseph-browser",
	{
		recursive: true,
	},
);
