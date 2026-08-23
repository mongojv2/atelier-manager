import { drizzle, SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import { Database as SQLiteCloudDatabase } from '@sqlitecloud/drivers';
import { envConfig } from '../config/env.js';
import * as schema from './schema.js';

let ormDb: SqliteRemoteDatabase<typeof schema> | null = null;
let cloudClient: SQLiteCloudDatabase | null = null;

export function initOrm() {
  const connectionString = envConfig.sqliteCloudUrl;
  if (connectionString && !cloudClient) {
    try {
      cloudClient = new SQLiteCloudDatabase(connectionString);
      ormDb = drizzle(async (sql, params, method) => {
        try {
          if (!cloudClient) return { rows: [] };
          
          // Execute raw SQL parameter substitution on SQLite Cloud
          let query = sql;
          if (params && params.length > 0) {
            // Replace ? placeholders with sanitized values or run via driver
            let i = 0;
            query = query.replace(/\?/g, () => {
              const val = params[i++];
              if (val === null || val === undefined) return 'NULL';
              if (typeof val === 'number') return String(val);
              if (typeof val === 'boolean') return val ? '1' : '0';
              return `'${String(val).replace(/'/g, "''")}'`;
            });
          }

          const result = await cloudClient.sql(query);
          const rawRows = Array.isArray(result) ? result : (result ? [result] : []);
          const rows = rawRows.map((row: any) => Object.values(row));
          return { rows };
        } catch (err) {
          console.error('Error querying SQLite Cloud via ORM:', err);
          return { rows: [] };
        }
      }, { schema });

      console.log('✅ Base de datos SQLite Cloud inicializada con Drizzle ORM.');
    } catch (err) {
      console.error('❌ Error al conectar a SQLite Cloud:', err);
    }
  }
  return ormDb;
}

export function getOrmDb() {
  if (!ormDb) initOrm();
  return ormDb;
}

export function getCloudClient() {
  if (!cloudClient) initOrm();
  return cloudClient;
}

export { schema };
