import 'dotenv/config';
import { getOrmDb, getCloudClient, schema } from './db/index.js';

async function verify() {
  console.log('🔍 Probando conexión en tiempo real a SQLite Cloud...');
  
  const client = getCloudClient();
  if (!client) {
    console.error('❌ Error: No se pudo obtener el cliente de SQLite Cloud.');
    return;
  }
  
  // 1. Consulta SQL nativa directa a la nube
  const rawClientes = await client.sql`SELECT id, documento_id, nombre, apellido, telefono FROM clientes;`;
  console.log('\n📡 Resultado de consulta NATIVA a SQLite Cloud (raw objects):');
  console.log(JSON.stringify(rawClientes, null, 2));

  // 2. Consulta con Drizzle ORM
  const db = getOrmDb();
  if (db) {
    const clientesDrizzle = await db.select().from(schema.clientesTable);
    console.log('\n💧 Resultado a través de Drizzle ORM:');
    console.log(JSON.stringify(clientesDrizzle, null, 2));
  }
}

verify().catch(console.error);
