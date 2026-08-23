import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const clientesTable = sqliteTable('clientes', {
  id: text('id').primaryKey(),
  documento_id: text('documento_id').notNull(),
  nombre: text('nombre').notNull(),
  apellido: text('apellido').notNull(),
  telefono: text('telefono').notNull(),
  email: text('email').notNull(),
  direccion: text('direccion').notNull(),
  estado: text('estado').notNull().default('Activo'),
  notas: text('notas'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

export const medidasTable = sqliteTable('medidas', {
  id: text('id').primaryKey(),
  cliente_id: text('cliente_id').notNull(),
  fecha_registro: text('fecha_registro').notNull(),
  cuello: real('cuello').notNull().default(0),
  pecho_busto: real('pecho_busto').notNull().default(0),
  cintura: real('cintura').notNull().default(0),
  cadera: real('cadera').notNull().default(0),
  ancho_espalda: real('ancho_espalda').notNull().default(0),
  largo_brazo: real('largo_brazo').notNull().default(0),
  largo_pierna: real('largo_pierna').notNull().default(0),
  largo_talle: real('largo_talle').notNull().default(0),
  observaciones: text('observaciones'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

export const disenosTable = sqliteTable('disenos', {
  id: text('id').primaryKey(),
  codigo_diseno: text('codigo_diseno').notNull(),
  nombre: text('nombre').notNull(),
  categoria: text('categoria').notNull(),
  descripcion: text('descripcion'),
  precio_base: real('precio_base').notNull().default(0),
  imagen_url: text('imagen_url'),
  estado: text('estado').notNull().default('Activo'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

export const bomDisenosTable = sqliteTable('bom_disenos', {
  id: text('id').primaryKey(),
  diseno_id: text('diseno_id').notNull(),
  material_id: text('material_id').notNull(),
  cantidad_requerida: real('cantidad_requerida').notNull().default(0),
  created_at: text('created_at').notNull(),
});

export const materialesTable = sqliteTable('materiales', {
  id: text('id').primaryKey(),
  codigo: text('codigo').notNull(),
  nombre: text('nombre').notNull(),
  categoria: text('categoria').notNull(),
  unidad: text('unidad').notNull(),
  stock_actual: real('stock_actual').notNull().default(0),
  stock_minimo: real('stock_minimo').notNull().default(0),
  costo_unitario: real('costo_unitario').notNull().default(0),
  ubicacion: text('ubicacion'),
  estado: text('estado').notNull().default('Activo'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

export const movimientosInventarioTable = sqliteTable('movimientos_inventario', {
  id: text('id').primaryKey(),
  material_id: text('material_id').notNull(),
  tipo: text('tipo').notNull(),
  cantidad: real('cantidad').notNull().default(0),
  motivo: text('motivo').notNull(),
  pedido_id: text('pedido_id'),
  registrado_por: text('registrado_por').notNull(),
  fecha_hora: text('fecha_hora').notNull(),
});

export const pedidosTable = sqliteTable('pedidos', {
  id: text('id').primaryKey(),
  numero_consecutivo: text('numero_consecutivo').notNull(),
  cliente_id: text('cliente_id').notNull(),
  diseno_id: text('diseno_id'),
  sastre_id: text('sastre_id'),
  tipo_prenda: text('tipo_prenda').notNull(),
  estado: text('estado').notNull().default('Pendiente'),
  etapa_confeccion: text('etapa_confeccion').notNull().default('Corte'),
  fecha_pedido: text('fecha_pedido').notNull(),
  fecha_entrega_prometida: text('fecha_entrega_prometida').notNull(),
  fecha_entrega_real: text('fecha_entrega_real'),
  monto_total: real('monto_total').notNull().default(0),
  monto_pagado: real('monto_pagado').notNull().default(0),
  monto_pendiente: real('monto_pendiente').notNull().default(0),
  notas: text('notas'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

export const historialEstadosTable = sqliteTable('historial_estados', {
  id: text('id').primaryKey(),
  pedido_id: text('pedido_id').notNull(),
  estado_anterior: text('estado_anterior').notNull(),
  estado_nuevo: text('estado_nuevo').notNull(),
  motivo: text('motivo'),
  cambiado_por_rol: text('cambiado_por_rol').notNull(),
  fecha_hora: text('fecha_hora').notNull(),
});

export const operariosTable = sqliteTable('operarios', {
  id: text('id').primaryKey(),
  nombre: text('nombre').notNull(),
  especialidad: text('especialidad').notNull(),
  activo: integer('activo', { mode: 'boolean' }).notNull().default(true),
  carga_actual: integer('carga_actual').notNull().default(0),
  telefono: text('telefono'),
  email: text('email'),
});

export const citasPruebasTable = sqliteTable('citas_pruebas', {
  id: text('id').primaryKey(),
  pedido_id: text('pedido_id').notNull(),
  cliente_id: text('cliente_id').notNull(),
  sastre_id: text('sastre_id'),
  tipo_prueba: text('tipo_prueba').notNull(),
  fecha_hora: text('fecha_hora').notNull(),
  estado: text('estado').notNull().default('Programada'),
  observaciones: text('observaciones'),
  ajustes_solicitados: text('ajustes_solicitados'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

export const notificacionesClientesTable = sqliteTable('notificaciones_clientes', {
  id: text('id').primaryKey(),
  cliente_id: text('cliente_id').notNull(),
  pedido_id: text('pedido_id'),
  canal: text('canal').notNull(),
  tipo_evento: text('tipo_evento').notNull(),
  mensaje: text('mensaje').notNull(),
  estado: text('estado').notNull().default('Enviado'),
  fecha_envio: text('fecha_envio').notNull(),
  leido: integer('leido', { mode: 'boolean' }).notNull().default(false),
});

export const comprobantesVentaTable = sqliteTable('comprobantes_venta', {
  id: text('id').primaryKey(),
  numero_comprobante: text('numero_comprobante').notNull(),
  pedido_id: text('pedido_id').notNull(),
  cliente_id: text('cliente_id').notNull(),
  tipo_comprobante: text('tipo_comprobante').notNull(),
  monto_pagado_momento: real('monto_pagado_momento').notNull().default(0),
  monto_total_pedido: real('monto_total_pedido').notNull().default(0),
  saldo_restante_despues: real('saldo_restante_despues').notNull().default(0),
  metodo_pago: text('metodo_pago').notNull(),
  observaciones: text('observaciones'),
  emitido_por: text('emitido_por').notNull(),
  fecha_emision: text('fecha_emision').notNull(),
});

export const auditLogsTable = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  entidad: text('entidad').notNull(),
  entidad_id: text('entidad_id').notNull(),
  accion: text('accion').notNull(),
  rol_usuario: text('rol_usuario').notNull(),
  detalles: text('detalles').notNull(),
  fecha_hora: text('fecha_hora').notNull(),
});
