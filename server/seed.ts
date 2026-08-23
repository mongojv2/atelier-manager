import 'dotenv/config';
import { Database as SQLiteCloudDatabase } from '@sqlitecloud/drivers';
import { getInitialData } from './dbStore.js';
import { initOrm } from './db/index.js';

export async function seedCloudDatabase() {
  const connectionString = process.env.SQLITE_CLOUD_CONNECTION_STRING;
  if (!connectionString) {
    console.log('⚠️ No SQLITE_CLOUD_CONNECTION_STRING configured in .env. Skipping cloud seed.');
    return;
  }

  // Ensure ORM tables are created
  initOrm();

  console.log('🌱 Iniciando sembrado (seed) de datos de prueba en SQLite Cloud...');

  const db = new SQLiteCloudDatabase(connectionString);
  const data = getInitialData();
  const now = new Date().toISOString();

  try {
    // 1. Clientes
    for (const c of data.clientes) {
      await db.exec(`
        INSERT OR REPLACE INTO clientes 
        (id, documento_id, nombre, apellido, telefono, email, direccion, estado, notas, created_at, updated_at)
        VALUES (
          '${c.id}', '${c.documento_id}', '${c.nombre.replace(/'/g, "''")}', '${c.apellido.replace(/'/g, "''")}',
          '${c.telefono}', '${c.email}', '${c.direccion.replace(/'/g, "''")}', '${c.estado}',
          '${(c.notas || '').replace(/'/g, "''")}', '${c.created_at}', '${c.updated_at}'
        );
      `);
    }
    console.log(`  ✅ ${data.clientes.length} Clientes insertados/actualizados.`);

    // 2. Medidas
    for (const m of data.medidas) {
      await db.exec(`
        INSERT OR REPLACE INTO medidas 
        (id, cliente_id, fecha_registro, cuello, pecho_busto, cintura, cadera, ancho_espalda, largo_brazo, largo_pierna, largo_talle, observaciones, created_at, updated_at)
        VALUES (
          '${m.id}', '${m.cliente_id}', '${m.fecha_toma}', ${m.cuello || 0}, ${m.pecho_busto || 0}, ${m.cintura || 0},
          ${m.cadera || 0}, ${m.ancho_espalda || 0}, ${m.largo_manga || 0}, ${m.largo_pantalon || 0}, ${m.talle_frente || 0},
          '${(m.observaciones || '').replace(/'/g, "''")}', '${m.created_at}', '${now}'
        );
      `);
    }
    console.log(`  ✅ ${data.medidas.length} Medidas insertadas/actualizadas.`);

    // 3. Diseños
    for (const d of data.disenos) {
      await db.exec(`
        INSERT OR REPLACE INTO disenos 
        (id, codigo_diseno, nombre, categoria, descripcion, precio_base, imagen_url, estado, created_at, updated_at)
        VALUES (
          '${d.id}', '${d.codigo}', '${d.nombre.replace(/'/g, "''")}', '${d.categoria}',
          '${d.descripcion.replace(/'/g, "''")}', ${d.precio_base}, '${d.imagen_url || ''}',
          '${d.estado}', '${d.created_at}', '${now}'
        );
      `);
    }
    console.log(`  ✅ ${data.disenos.length} Diseños insertados/actualizados.`);

    // 4. Materiales
    for (const mat of data.materiales) {
      await db.exec(`
        INSERT OR REPLACE INTO materiales 
        (id, codigo, nombre, categoria, unidad, stock_actual, stock_minimo, costo_unitario, ubicacion, estado, created_at, updated_at)
        VALUES (
          '${mat.id}', '${mat.codigo}', '${mat.nombre.replace(/'/g, "''")}', '${mat.categoria}',
          '${mat.unidad_medida}', ${mat.stock_actual}, ${mat.stock_minimo}, ${mat.costo_unitario},
          '${mat.ubicacion_bodega.replace(/'/g, "''")}', '${mat.estado}', '${mat.created_at}', '${mat.updated_at}'
        );
      `);
    }
    console.log(`  ✅ ${data.materiales.length} Materiales/Insumos insertados/actualizados.`);

    // 5. BOM Diseños
    for (const bom of data.bom_disenos) {
      await db.exec(`
        INSERT OR REPLACE INTO bom_disenos 
        (id, diseno_id, material_id, cantidad_requerida, created_at)
        VALUES (
          '${bom.id}', '${bom.diseno_id}', '${bom.material_id}', ${bom.cantidad_requerida}, '${now}'
        );
      `);
    }
    console.log(`  ✅ ${data.bom_disenos.length} Ítems BOM de Diseños insertados.`);

    // 6. Pedidos
    for (const p of data.pedidos) {
      await db.exec(`
        INSERT OR REPLACE INTO pedidos 
        (id, numero_consecutivo, cliente_id, diseno_id, sastre_id, tipo_prenda, estado, etapa_confeccion, fecha_pedido, fecha_entrega_prometida, monto_total, monto_pagado, monto_pendiente, notas, created_at, updated_at)
        VALUES (
          '${p.id}', '${p.numero_consecutivo}', '${p.cliente_id}', '${p.diseno_id || ''}',
          '${p.operario_id || ''}', '${p.tipo_prenda.replace(/'/g, "''")}', '${p.estado}',
          '${p.etapa_confeccion || 'Corte'}', '${p.fecha_pedido}', '${p.fecha_estimada_entrega}',
          ${p.monto_total}, ${p.monto_pagado}, ${p.monto_pendiente},
          '${(p.observaciones || '').replace(/'/g, "''")}', '${p.created_at}', '${p.updated_at}'
        );
      `);
    }
    console.log(`  ✅ ${data.pedidos.length} Pedidos insertados/actualizados.`);

    // 7. Historial Estados
    for (const h of data.historial_estados) {
      await db.exec(`
        INSERT OR REPLACE INTO historial_estados 
        (id, pedido_id, estado_anterior, estado_nuevo, motivo, cambiado_por_rol, fecha_hora)
        VALUES (
          '${h.id}', '${h.pedido_id}', '${h.estado_anterior}', '${h.estado_nuevo}',
          '${(h.observacion || '').replace(/'/g, "''")}', '${h.usuario_rol}', '${h.fecha_hora}'
        );
      `);
    }
    console.log(`  ✅ ${data.historial_estados.length} Registros de Historial insertados.`);

    // 8. Operarios
    for (const op of data.operarios) {
      await db.exec(`
        INSERT OR REPLACE INTO operarios 
        (id, nombre, especialidad, activo, carga_actual, telefono, email)
        VALUES (
          '${op.id}', '${op.nombre.replace(/'/g, "''")}', '${op.especialidad}', 1, 0,
          '${op.contacto}', ''
        );
      `);
    }
    console.log(`  ✅ ${data.operarios.length} Operarios/Sastres insertados.`);

    // 9. Citas Pruebas
    for (const c of data.citas_pruebas) {
      await db.exec(`
        INSERT OR REPLACE INTO citas_pruebas 
        (id, pedido_id, cliente_id, sastre_id, tipo_prueba, fecha_hora, estado, observaciones, ajustes_solicitados, created_at, updated_at)
        VALUES (
          '${c.id}', '${c.pedido_id}', '${c.cliente_id}', '${c.sastre_atendio_id || ''}',
          '${c.tipo_prueba}', '${c.fecha_hora}', '${c.estado}',
          '${(c.observaciones_ajuste || '').replace(/'/g, "''")}', '', '${c.created_at}', '${c.updated_at}'
        );
      `);
    }
    console.log(`  ✅ ${data.citas_pruebas.length} Citas de Prueba insertadas.`);

    // 10. Movimientos Inventario
    for (const mov of data.movimientos_inventario) {
      await db.exec(`
        INSERT OR REPLACE INTO movimientos_inventario 
        (id, material_id, tipo, cantidad, motivo, pedido_id, registrado_por, fecha_hora)
        VALUES (
          '${mov.id}', '${mov.material_id}', '${mov.tipo_movimiento}', ${mov.cantidad},
          '${mov.motivo_observacion.replace(/'/g, "''")}', '${mov.pedido_id || ''}',
          '${mov.usuario_nombre.replace(/'/g, "''")}', '${mov.fecha_hora}'
        );
      `);
    }
    console.log(`  ✅ ${data.movimientos_inventario.length} Movimientos de Inventario insertados.`);

    // 11. Notificaciones
    for (const n of data.notificaciones_clientes) {
      await db.exec(`
        INSERT OR REPLACE INTO notificaciones_clientes 
        (id, cliente_id, pedido_id, canal, tipo_evento, mensaje, estado, fecha_envio, leido)
        VALUES (
          '${n.id}', '${n.cliente_id}', '${n.pedido_id || ''}', '${n.canal}', '${n.evento}',
          '${n.mensaje.replace(/'/g, "''")}', '${n.estado_envio}', '${n.fecha_hora}', 0
        );
      `);
    }
    console.log(`  ✅ ${data.notificaciones_clientes.length} Notificaciones insertadas.`);

    // 12. Comprobantes Venta
    for (const comp of data.comprobantes_venta) {
      await db.exec(`
        INSERT OR REPLACE INTO comprobantes_venta 
        (id, numero_comprobante, pedido_id, cliente_id, tipo_comprobante, monto_pagado_momento, monto_total_pedido, saldo_restante_despues, metodo_pago, observaciones, emitido_por, fecha_emision)
        VALUES (
          '${comp.id}', '${comp.numero_consecutivo}', '${comp.pedido_id}', '${comp.cliente_id}',
          '${comp.tipo_comprobante}', ${comp.monto_pagado_momento}, ${comp.monto_total_pedido},
          ${comp.saldo_restante_despues}, '${comp.metodo_pago}', '${(comp.concepto || '').replace(/'/g, "''")}',
          '${comp.emitido_por_usuario.replace(/'/g, "''")}', '${comp.fecha_emision}'
        );
      `);
    }
    console.log(`  ✅ ${data.comprobantes_venta.length} Comprobantes de Venta insertados.`);

    console.log('🎉 ¡Base de Datos SQLite Cloud poblada exitosamente con datos de prueba!');
  } catch (err) {
    console.error('❌ Error durante la siembra de datos en SQLite Cloud:', err);
  }
}

seedCloudDatabase();
