// Builds @youtwo/ui-kit: esbuild -> dist/index.js, tsc -> dist/*.d.ts, css -> dist/styles.css
import * as esbuild from "esbuild";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

// 1. JS bundle (ESM, react external — the host provides it)
await esbuild.build({
  entryPoints: [path.join(root, "src/index.ts")],
  bundle: true,
  format: "esm",
  target: "es2020",
  jsx: "automatic",
  external: ["react", "react-dom", "react/jsx-runtime"],
  outfile: path.join(dist, "index.js"),
  logLevel: "info",
});

// 2. Type declarations — invoke tsc's JS entry directly; spawning npx.cmd
// fails with EINVAL on Windows + Node 24.
execFileSync(
  process.execPath,
  [path.join(root, "node_modules/typescript/bin/tsc"), "-p", "tsconfig.json"],
  { cwd: root, stdio: "inherit" }
);

// 3. Stylesheet: tokens first, then component CSS, concatenated into one shipped file
const tokens = fs.readFileSync(path.join(root, "src/tokens.css"), "utf8");
const components = fs.readFileSync(path.join(root, "src/components.css"), "utf8");
fs.writeFileSync(
  path.join(dist, "styles.css"),
  `${tokens}\n\n${components}`,
  "utf8"
);
fs.copyFileSync(path.join(root, "src/tokens.css"), path.join(dist, "tokens.css"));

console.log("built @youtwo/ui-kit -> dist/");
