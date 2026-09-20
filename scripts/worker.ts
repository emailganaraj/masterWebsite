/**
 * Background worker — pg-boss job processor.
 * Run alongside the Next.js app:
 *   npx pnpm@9 run worker
 */
import { closeDb } from "../lib/db";
import { createWorkerBoss } from "../lib/jobs/boss";
import { registerSchedules, registerWorkers } from "../lib/jobs/register-workers";

async function main() {
  console.log("Starting pg-boss worker...\n");

  const boss = await createWorkerBoss();
  await registerWorkers(boss);
  await registerSchedules(boss);

  console.log("✓ Worker running — scheduled jobs registered");
  console.log("  Press Ctrl+C to stop\n");

  const shutdown = async () => {
    console.log("\nStopping worker...");
    await boss.stop();
    await closeDb();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch(async (err) => {
  console.error("Worker failed:", err);
  await closeDb();
  process.exit(1);
});
