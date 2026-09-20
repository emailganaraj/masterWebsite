import "dotenv/config";
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const runDev = process.argv.includes("--dev");

function run(cmd: string) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { stdio: "inherit", cwd: process.cwd(), env: process.env });
}

console.log("=== Master Website Setup ===");
console.log(`Database mode: ${process.env.USE_PGLITE === "1" ? "PGlite (embedded)" : "PostgreSQL"}`);

if (process.env.USE_PGLITE === "1") {
  const dir = process.env.PGLITE_DATA_DIR ?? "./data/pglite";
  mkdirSync(dirname(dir.endsWith("pglite") ? dir : `${dir}/pglite`), { recursive: true });
  mkdirSync(dir, { recursive: true });
}

run("npx drizzle-kit push --force");
run("tsx --env-file=.env scripts/seed.ts");

if (runDev) {
  console.log("\n=== Starting dev server ===\n");
  run("npx next dev --turbopack");
} else {
  console.log("\n✅ Setup complete. Run: npx pnpm@9 run dev");
}
