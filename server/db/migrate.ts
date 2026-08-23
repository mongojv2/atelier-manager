import 'dotenv/config';
import { Database as SQLiteCloudDatabase } from '@sqlitecloud/drivers';
import { envConfig } from '../config/env.js';

async function runMigrations() {
  // Use admin connection string if specified, or fall back to standard connection string
  const connectionString = envConfig.sqliteCloudAdminUrl || envConfig.sqliteCloudUrl;

  if (!connectionString) {
    console.error('❌ Error: No se encontró SQLITE_CLOUD_CONNECTION_STRING en el archivo .env');
    process.exit(1);
  }

  console.log('🚀 Iniciando script de migración DDL en SQLite Cloud...');

  try {
    const cloudClient = new SQLiteCloudDatabase(connectionString);

    // Extract database name from connection string if present
    const connStr = connectionString;
    try {
      const url = new URL(connStr);
      const rawDbName = url.pathname.replace(/^\//, '');
      if (rawDbName) {
        try {
          await cloudClient.exec(`USE DATABASE ${rawDbName};`);
        } catch {
          if (!rawDbName.endsWith('.sqlite')) {
            try {
              await cloudClient.exec(`USE DATABASE ${rawDbName}.sqlite;`);
            } catch (err) {
              // Ignore if USE DATABASE fails
            }
          }
        }
      }
    } catch (err) {
      // Ignore URL parse errors
    }

    const tables = [
      `CREATE TABLE IF NOT EXISTS clientes (
        id TEXT PRIMARY KEY,
        documento_id TEXT NOT NULL,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        telefono TEXT NOT NULL,
        email TEXT NOT NULL,
        direccion TEXT NOT NULL,
        estado TEXT NOT NULL DEFAULT 'Activo',
        notas TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS medidas (
        id TEXT PRIMARY KEY,
        cliente_id TEXT NOT NULL,
        fecha_registro TEXT NOT NULL,
        cuello REAL DEFAULT 0,
        pecho_busto REAL DEFAULT 0,
        cintura REAL DEFAULT 0,
        cadera REAL DEFAULT 0,
        ancho_espalda REAL DEFAULT 0,
        largo_brazo REAL DEFAULT 0,
        largo_pierna REAL DEFAULT 0,
        largo_talle REAL DEFAULT 0,
        observaciones TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS disenos (
        id TEXT PRIMARY KEY,
        codigo_diseno TEXT NOT NULL,
        nombre TEXT NOT NULL,
        categoria TEXT NOT NULL,
        descripcion TEXT,
        precio_base REAL DEFAULT 0,
        imagen_url TEXT,
        estado TEXT NOT NULL DEFAULT 'Activo',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS bom_disenos (
        id TEXT PRIMARY KEY,
        diseno_id TEXT NOT NULL,
        material_id TEXT NOT NULL,
        cantidad_requerida REAL DEFAULT 0,
        created_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS materiales (
        id TEXT PRIMARY KEY,
        codigo TEXT NOT NULL,
        nombre TEXT NOT NULL,
        categoria TEXT NOT NULL,
        unidad TEXT NOT NULL,
        stock_actual REAL DEFAULT 0,
        stock_minimo REAL DEFAULT 0,
        costo_unitario REAL DEFAULT 0,
        ubicacion TEXT,
        estado TEXT NOT NULL DEFAULT 'Activo',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS movimientos_inventario (
        id TEXT PRIMARY KEY,
        material_id TEXT NOT NULL,
        tipo TEXT NOT NULL,
        cantidad REAL DEFAULT 0,
        motivo TEXT NOT NULL,
        pedido_id TEXT,
        registrado_por TEXT NOT NULL,
        fecha_hora TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS pedidos (
        id TEXT PRIMARY KEY,
        numero_consecutivo TEXT NOT NULL,
        cliente_id TEXT NOT NULL,
        diseno_id TEXT,
        sastre_id TEXT,
        tipo_prenda TEXT NOT NULL,
        estado TEXT NOT NULL DEFAULT 'Pendiente',
        etapa_confeccion TEXT NOT NULL DEFAULT 'Corte',
        fecha_pedido TEXT NOT NULL,
        fecha_entrega_prometida TEXT NOT NULL,
        fecha_entrega_real TEXT,
        monto_total REAL DEFAULT 0,
        monto_pagado REAL DEFAULT 0,
        monto_pendiente REAL DEFAULT 0,
        notas TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS historial_estados (
        id TEXT PRIMARY KEY,
        pedido_id TEXT NOT NULL,
        estado_anterior TEXT NOT NULL,
        estado_nuevo TEXT NOT NULL,
        motivo TEXT,
        cambiado_por_rol TEXT NOT NULL,
        fecha_hora TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS operarios (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        especialidad TEXT NOT NULL,
        activo INTEGER DEFAULT 1,
        carga_actual INTEGER DEFAULT 0,
        telefono TEXT,
        email TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS citas_pruebas (
        id TEXT PRIMARY KEY,
        pedido_id TEXT NOT NULL,
        cliente_id TEXT NOT NULL,
        sastre_id TEXT,
        tipo_prueba TEXT NOT NULL,
        fecha_hora TEXT NOT NULL,
        estado TEXT NOT NULL DEFAULT 'Programada',
        observaciones TEXT,
        ajustes_solicitados TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS notificaciones_clientes (
        id TEXT PRIMARY KEY,
        cliente_id TEXT NOT NULL,
        pedido_id TEXT,
        canal TEXT NOT NULL,
        tipo_evento TEXT NOT NULL,
        mensaje TEXT NOT NULL,
        estado TEXT NOT NULL DEFAULT 'Enviado',
        fecha_envio TEXT NOT NULL,
        leido INTEGER DEFAULT 0
      );`,
      `CREATE TABLE IF NOT EXISTS comprobantes_venta (
        id TEXT PRIMARY KEY,
        numero_comprobante TEXT NOT NULL,
        pedido_id TEXT NOT NULL,
        cliente_id TEXT NOT NULL,
        tipo_comprobante TEXT NOT NULL,
        monto_pagado_momento REAL DEFAULT 0,
        monto_total_pedido REAL DEFAULT 0,
        saldo_restante_despues REAL DEFAULT 0,
        metodo_pago TEXT NOT NULL,
        observaciones TEXT,
        emitido_por TEXT NOT NULL,
        fecha_emision TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        entidad TEXT NOT NULL,
        entidad_id TEXT NOT NULL,
        accion TEXT NOT NULL,
        rol_usuario TEXT NOT NULL,
        detalles TEXT NOT NULL,
        fecha_hora TEXT NOT NULL
      );`
    ];

    for (const sql of tables) {
      await cloudClient.exec(sql);
    }

    console.log('✅ Migración DDL completada con éxito. Las 13 tablas relacionales están listas.');
    process.exit(0);
  } catch (err: any) {
    if (err?.errorCode === '23' || err?.message?.includes('not authorized')) {
      console.error('❌ Error de autorización: El token de SQLite Cloud actual no tiene permisos DDL/ADMIN para crear tablas.');
      console.error('👉 Asegúrate de definir SQLITE_CLOUD_ADMIN_CONNECTION_STRING con un token ADMIN para ejecutar migraciones.');
    } else {
      console.error('❌ Error ejecutando migraciones DDL:', err);
    }
    process.exit(1);
  }
}

runMigrations();
