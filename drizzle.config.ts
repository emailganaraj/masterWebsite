import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const usePglite = process.env.USE_PGLITE === "1";

export default defineConfig({
  schema: "./lib/db/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  ...(usePglite
    ? {
        driver: "pglite",
        dbCredentials: {
          url: process.env.PGLITE_DATA_DIR ?? "./data/pglite",
        },
      }
    : {
        dbCredentials: {
          url: process.env.DATABASE_URL!,
        },
      }),
  verbose: true,
  strict: true,
});
