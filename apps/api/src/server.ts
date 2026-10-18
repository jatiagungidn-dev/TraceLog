import { env } from "./config/env.js";
import app from "./app.js";
import pool from "./config/db.js";

async function start() {
  try {
    await pool.query("SELECT 1");

    const server = app.listen(env.PORT, () => {
      console.log(`TraceLog server running on http://localhost:${env.PORT}`);
    });

    const shutdown = async (signal: string) => {
      console.log(
        `Received ${signal}. Shutting down TraceLog server gracefully`,
      );

      server.close(async () => {
        console.log("Express HTTP server closed");

        try {
          await pool.end();
          console.log("PostgreSQL pool closed");
          process.exit(0);
        } catch (err) {
          console.error("Error closing PostgreSQL pool:", err);
          process.exit(1);
        }
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("Failed to start TraceLog server:", err);
    process.exit(1);
  }
}

start();
