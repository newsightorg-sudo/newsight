import { neon, Pool } from '@neondatabase/serverless';

// Format and convert SQL statements for Postgres compatibility
export function formatPostgresSql(sql: string): string {
  let s = sql.trim();

  // Convert SQLite INSERT OR REPLACE for key-value tables like editorial_settings
  if (/INSERT\s+OR\s+REPLACE\s+INTO\s+editorial_settings\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i.test(s)) {
    s = s.replace(/INSERT\s+OR\s+REPLACE\s+INTO/i, 'INSERT INTO');
    s += ' ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value';
  } else if (/INSERT\s+OR\s+REPLACE\s+INTO\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i.test(s)) {
    // General INSERT OR REPLACE -> ON CONFLICT (id) DO NOTHING (or replace into if needed)
    s = s.replace(/INSERT\s+OR\s+REPLACE\s+INTO/i, 'INSERT INTO');
    s += ' ON CONFLICT DO NOTHING';
  } else if (/INSERT\s+OR\s+IGNORE\s+INTO/i.test(s)) {
    s = s.replace(/INSERT\s+OR\s+IGNORE\s+INTO/i, 'INSERT INTO');
    s += ' ON CONFLICT DO NOTHING';
  }

  // Convert SQLite parameter placeholders '?' into Postgres '$1', '$2', ...
  let paramIndex = 1;
  s = s.replace(/\?/g, () => `$${paramIndex++}`);

  return s;
}

export interface DbStatement {
  all<T = any>(...params: any[]): Promise<T[]>;
  get<T = any>(...params: any[]): Promise<T | null>;
  run(...params: any[]): Promise<{ changes: number }>;
}

export interface NeonDbClient {
  prepare(sqlQuery: string): DbStatement;
  exec(sqlQuery: string): Promise<any>;
  query<T = any>(sqlQuery: string, params?: any[]): Promise<T[]>;
  queryOne<T = any>(sqlQuery: string, params?: any[]): Promise<T | null>;
  execute(sqlQuery: string, params?: any[]): Promise<{ changes: number }>;
}

// Preserve client singleton across Next.js HMR/fast reloads
const globalForDb = global as unknown as { __neon_db?: NeonDbClient };

function getDatabaseUrl(): string {
  const envCandidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.DATABASE_URL_UNPOOLED
  ];

  for (const raw of envCandidates) {
    if (raw && typeof raw === 'string') {
      let url = raw.trim();
      if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
        url = url.slice(1, -1).trim();
      }
      if (url.startsWith('postgres://') || url.startsWith('postgresql://')) {
        return url;
      }
    }
  }

  // Fallback to reading .env.local if running in local context
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
      if (match) return match[1].trim();
    }
  } catch (_) {}

  return '';
}

export function getDb(): NeonDbClient {
  if (!globalForDb.__neon_db) {
    const dbUrl = getDatabaseUrl();
    if (!dbUrl) {
      console.warn('[DB] Warning: DATABASE_URL is not defined in environment variables. Database operations will return empty results.');
      return {
        prepare(_sqlQuery: string): DbStatement {
          return {
            async all<T = any>(): Promise<T[]> { return []; },
            async get<T = any>(): Promise<T | null> { return null; },
            async run(): Promise<{ changes: number }> { return { changes: 0 }; }
          };
        },
        async exec(): Promise<any> { return []; },
        async query<T = any>(): Promise<T[]> { return []; },
        async queryOne<T = any>(): Promise<T | null> { return null; },
        async execute(): Promise<{ changes: number }> { return { changes: 0 }; }
      };
    }

    const client = neon(dbUrl);

    globalForDb.__neon_db = {
      prepare(sqlQuery: string): DbStatement {
        const formatted = formatPostgresSql(sqlQuery);
        return {
          async all<T = any>(...params: any[]): Promise<T[]> {
            const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
            const rows = await client.query(formatted, flatParams);
            return (rows || []) as T[];
          },
          async get<T = any>(...params: any[]): Promise<T | null> {
            const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
            const rows = await client.query(formatted, flatParams);
            return rows && rows.length > 0 ? (rows[0] as T) : null;
          },
          async run(...params: any[]): Promise<{ changes: number }> {
            const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
            const res = await client.query(formatted, flatParams);
            return { changes: Array.isArray(res) ? res.length : 1 };
          }
        };
      },
      async exec(sqlQuery: string): Promise<any> {
        return await client.query(sqlQuery);
      },
      async query<T = any>(sqlQuery: string, params: any[] = []): Promise<T[]> {
        const formatted = formatPostgresSql(sqlQuery);
        const rows = await client.query(formatted, params);
        return (rows || []) as T[];
      },
      async queryOne<T = any>(sqlQuery: string, params: any[] = []): Promise<T | null> {
        const formatted = formatPostgresSql(sqlQuery);
        const rows = await client.query(formatted, params);
        return rows && rows.length > 0 ? (rows[0] as T) : null;
      },
      async execute(sqlQuery: string, params: any[] = []): Promise<{ changes: number }> {
        const formatted = formatPostgresSql(sqlQuery);
        const res = await client.query(formatted, params);
        return { changes: Array.isArray(res) ? res.length : 1 };
      }
    };
  }

  return globalForDb.__neon_db;
}

// Lazy proxy so that importing `db` does not trigger database connection or env checks at module load time
export const db: NeonDbClient = new Proxy({} as NeonDbClient, {
  get(_target, prop: string | symbol) {
    const client = getDb();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});
