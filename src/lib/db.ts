import "server-only";

import { Pool, type QueryResultRow } from "pg";

declare global {
  var seriPool: Pool | undefined;
}

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured.");
  }
  return url;
}

export function getPool() {
  if (!globalThis.seriPool) {
    globalThis.seriPool = new Pool({
      connectionString: getDatabaseUrl(),
    });
  }
  return globalThis.seriPool;
}

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  return getPool().query<T>(text, params);
}
