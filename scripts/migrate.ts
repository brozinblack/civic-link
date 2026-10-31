import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

async function main() {
  const raw = process.env.DATABASE_URL || process.env.DRIZZLE_DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL is not available; run migrations inside the managed project environment.");
  const url = new URL(raw);
  const connection = await mysql.createConnection({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    ssl: { rejectUnauthorized: true },
    charset: "utf8mb4"
  });

  try {
    await connection.execute("CREATE TABLE IF NOT EXISTS schema_migrations (version VARCHAR(40) NOT NULL PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    const directory = path.join(process.cwd(), "db/migrations");
    const files = (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort();
    for (const fileName of files) {
      const version = fileName.replace(/\.sql$/, "");
      const [rows] = await connection.execute<mysql.RowDataPacket[]>("SELECT version FROM schema_migrations WHERE version = ?", [version]);
      if (rows.length) {
        console.log(`Skipped ${version}; already applied.`);
        continue;
      }
      const sql = await readFile(path.join(directory, fileName), "utf8");
      const statements = sql.split(/;\s*(?:\r?\n|$)/).map((statement) => statement.trim()).filter(Boolean);
      for (const statement of statements) await connection.query(statement);
      await connection.execute("INSERT INTO schema_migrations (version) VALUES (?)", [version]);
      console.log(`Applied ${version} (${statements.length} statements).`);
    }
  } finally {
    await connection.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Migration failed.");
  process.exitCode = 1;
});
