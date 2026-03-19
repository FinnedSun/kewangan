import { config } from "dotenv";
config({ path: ".env" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Running safe migration...");
  await sql`ALTER TABLE transactions ALTER COLUMN amount TYPE bigint;`;
  console.log("Migration complete");
}

main();
