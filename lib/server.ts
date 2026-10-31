import mysql, { type Pool, type RowDataPacket, type ResultSetHeader } from "mysql2/promise";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { jwtVerify } from "jose";

type DbValue = string | number | boolean | Date | null | Buffer;
let pool: Pool | undefined;
export type AuthUser = { id: string; name: string; email: string | null; roles: string[] };

function getPool() {
  if (pool) return pool;
  const raw = process.env.DATABASE_URL || process.env.DRIZZLE_DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL is unavailable in this runtime");
  const url = new URL(raw);
  pool = mysql.createPool({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    ssl: { rejectUnauthorized: true },
    waitForConnections: true,
    connectionLimit: 6,
    maxIdle: 3,
    idleTimeout: 30000,
    enableKeepAlive: true,
    charset: "utf8mb4"
  });
  return pool;
}

export async function query<T extends RowDataPacket[] = RowDataPacket[]>(sql: string, values: DbValue[] = []) {
  const [rows] = await getPool().execute<T>(sql, values);
  return rows;
}

export async function execute(sql: string, values: DbValue[] = []) {
  const [result] = await getPool().execute<ResultSetHeader>(sql, values);
  return result;
}

export type TransactionExecutor = {
  query<T extends RowDataPacket[] = RowDataPacket[]>(sql: string, values?: DbValue[]): Promise<T>;
  execute(sql: string, values?: DbValue[]): Promise<ResultSetHeader>;
};

export async function withTransaction<T>(operation: (tx: TransactionExecutor) => Promise<T>): Promise<T> {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const tx: TransactionExecutor = {
      async query<R extends RowDataPacket[] = RowDataPacket[]>(sql: string, values: DbValue[] = []) {
        const [rows] = await connection.execute<R>(sql, values);
        return rows;
      },
      async execute(sql: string, values: DbValue[] = []) {
        const [result] = await connection.execute<ResultSetHeader>(sql, values);
        return result;
      }
    };
    const result = await operation(tx);
    await connection.commit();
    return result;
  } catch (error) {
    try { await connection.rollback(); } catch { /* Preserve the original transaction error. */ }
    throw error;
  } finally {
    connection.release();
  }
}

export function opaqueToken() { return randomBytes(32).toString("base64url"); }
export function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }

export async function upsertProviderUser(openId: string, name: string, email: string | null): Promise<AuthUser> {
  const id = randomUUID();
  await execute(
    "INSERT INTO users (id, provider_open_id, email, full_name) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE email = VALUES(email), full_name = VALUES(full_name), updated_at = CURRENT_TIMESTAMP",
    [id, openId, email, name]
  );
  const rows = await query<(RowDataPacket & { id: string; full_name: string; email: string | null })[]>("SELECT id, full_name, email FROM users WHERE provider_open_id = ? LIMIT 1", [openId]);
  const user = rows[0];
  if (!user) throw new Error("Could not resolve account after sign-in");
  await execute("INSERT IGNORE INTO user_profiles (user_id) VALUES (?)", [user.id]);
  await execute("INSERT IGNORE INTO user_roles (id, user_id, role_name, status) VALUES (?, ?, 'member', 'active')", [randomUUID(), user.id]);
  const roleRows = await query<(RowDataPacket & { role_name: string })[]>("SELECT role_name FROM user_roles WHERE user_id = ? AND status = 'active'", [user.id]);
  return { id: user.id, name: user.full_name, email: user.email, roles: roleRows.map((row) => row.role_name) };
}

export async function createSession(userId: string) {
  const token = opaqueToken();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await execute("INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)", [tokenHash(token), userId, expires]);
  return { token, expires };
}

export async function getAuthUser(token?: string | null): Promise<AuthUser | null> {
  if (!token) return null;
  try {
    const sessionRows = await query<(RowDataPacket & { user_id: string; full_name: string; email: string | null })[]>(
      "SELECT u.id AS user_id, u.full_name, u.email FROM auth_sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > CURRENT_TIMESTAMP AND u.account_status = 'active' LIMIT 1",
      [tokenHash(token)]
    );
    if (sessionRows[0]) {
      const row = sessionRows[0];
      const roles = await query<(RowDataPacket & { role_name: string })[]>("SELECT role_name FROM user_roles WHERE user_id = ? AND status = 'active'", [row.user_id]);
      return { id: row.user_id, name: row.full_name, email: row.email, roles: roles.map((role) => role.role_name) };
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("DATABASE_URL is unavailable")) return null;
    throw error;
  }

  // Preview may supply a platform-signed identity JWT under the documented cookie name.
  const secret = process.env.MANUS_JWT_SECRET;
  const expectedApp = process.env.MANUS_PROJECT_ID;
  if (!secret || !expectedApp) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
    const openId = typeof payload.openId === "string" ? payload.openId : typeof payload.sub === "string" ? payload.sub : "";
    if (payload.appId !== expectedApp || !openId) return null;
    const name = typeof payload.name === "string" && payload.name.trim() ? payload.name.trim() : "Civic Link member";
    const email = typeof payload.email === "string" ? payload.email : null;
    return await upsertProviderUser(openId, name, email);
  } catch {
    return null;
  }
}

export function hasRole(user: AuthUser | null, roles: string[]) {
  return Boolean(user && user.roles.some((role) => roles.includes(role)));
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export function checkClientRequest(request: Request) {
  // Same-origin application fetches carry this non-simple header; cross-origin forms cannot.
  return request.headers.get("x-civic-link") === "1";
}

const attempts = new Map<string, { count: number; resetAt: number }>();
export function rateLimit(key: string, limit = 8, windowMs = 60_000) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}
