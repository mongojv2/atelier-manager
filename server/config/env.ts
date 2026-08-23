import 'dotenv/config';

interface ServerEnvConfig {
  nodeEnv: 'development' | 'production' | 'test';
  isProduction: boolean;
  port: number;
  corsOrigin: string;
  sqliteCloudUrl: string;
  sqliteCloudAdminUrl: string;
  skipSchemaBootstrap: boolean;
}

function parsePort(value?: string, fallback: number = 3000): number {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

function validateAndLoadEnv(): ServerEnvConfig {
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
  const isProduction = nodeEnv === 'production';
  const port = parsePort(process.env.PORT, 3000);
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  const sqliteCloudUrl = process.env.SQLITE_CLOUD_CONNECTION_STRING || '';
  const sqliteCloudAdminUrl = process.env.SQLITE_CLOUD_ADMIN_CONNECTION_STRING || sqliteCloudUrl;
  const skipSchemaBootstrap = process.env.SKIP_SCHEMA_BOOTSTRAP === 'true';

  // Warnings in development / Fatal errors in production
  if (isProduction && !sqliteCloudUrl) {
    console.error('❌ FATAL: SQLITE_CLOUD_CONNECTION_STRING no está configurada en entorno de producción.');
    process.exit(1);
  }

  return {
    nodeEnv,
    isProduction,
    port,
    corsOrigin,
    sqliteCloudUrl,
    sqliteCloudAdminUrl,
    skipSchemaBootstrap,
  };
}

export const envConfig = validateAndLoadEnv();
