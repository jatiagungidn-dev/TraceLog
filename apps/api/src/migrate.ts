import pool from "./config/db.js";
import path from "node:path";
import { readdirSync, readFileSync } from "node:fs";

const migrationDir = path.join(process.cwd(), "database", "migrations");

async function runMigration() {
  const client = await pool.connect();

  try {
    await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations(
                name TEXT PRIMARY KEY,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

    const files = readdirSync(migrationDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const existing = await client.query(
        "SELECT 1 FROM schema_migrations WHERE name = $1",
        [file],
      );

      if (existing.rowCount && existing.rowCount > 0) {
        console.log(`Skipping ${file} (already applide)`);
        continue;
      }

      const sql = readFileSync(path.join(migrationDir, file), "utf-8");

      console.log(`Applying ${file}...`);

      await client.query("BEGIN");

      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
          file,
        ]);
        await client.query("COMMIT");

        console.log(`Applied ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`Failed to apply ${file}`);
        throw err;
      }

      console.log("All migrations executed successfully");
    }
  } catch (err) {
    console.error("Migration process failed", err);
    process.exit(1);
  } finally {
    client.release();

    await pool.end();
  }
}

runMigration();
