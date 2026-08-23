/**
 * Tipos y Modelos de Datos para el Sistema de Gestión de Confección
 * FASE 1: GESTIÓN BÁSICA
 */

export type RolUsuario = 
  | 'Administrador'
  | 'Recepción / Ventas'
  | 'Diseñador / Sastre'
  | 'Bodega / Inventario'
  | 'Gerente';

export interface UsuarioActual {
  id: string;
  nombre: string;
  rol: RolUsuario;
  email: string;
}

// RF-001: Gestión de Clientes
export interface Cliente {
  id: string;
  documento_id: string; // Único según RNF-010 (DNI / Cédula / PAS)
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  direccion: string;
  estado: 'Activo' | 'Inactivo';
  notas?: string;
  created_at: string;
  updated_at: string;
}

// RF-002: Gestión de Medidas Corporales
export interface MedidasCorporales {
  id: string;
  cliente_id: string; // Relación con Cliente (RN-009)
  fecha_toma: string;
  tomado_por: string;
  // Medidas en centímetros (cm)
  cuello?: number;
  pecho_busto?: number;
  bajo_busto?: number;
  cintura?: number;
  cadera?: number;
  ancho_espalda?: number;
  talle_frente?: number;
  talle_espalda?: number;
  hombros?: number;
  largo_manga?: number;
  contorno_brazo?: number;
  largo_pantalon?: number;
  largo_falda?: number;
  tiro?: number;
  altura_total?: number;
  observaciones?: string;
  created_at: string;
}

// RF-003: Gestión de Diseños de Prendas
export type CategoriaPrenda = 
  | 'Traje Masculino'
  | 'Vestido de Gala / Noche'
  | 'Camisa / Blusa'
  | 'Pantalón / Falda'
  | 'Abrigo / Chaqueta'
  | 'Uniforme Corporativo'
  | 'Atuendo Tradicional / Especial';

export interface Diseno {
  id: string;
  codigo: string; // Ej: DIS-001
  nombre: string;
  categoria: CategoriaPrenda;
  descripcion: string;
  genero: 'Damas' | 'Caballeros' | 'Unisex' | 'Infantil';
  precio_base: number;
  complejidad: 'Baja' | 'Media' | 'Alta';
  imagen_url?: string;
  estado: 'Activo' | 'Inactivo';
  created_at: string;
}

// RF-004 y RF-005: Gestión de Pedidos y Estados
export type EstadoPedido = 
  | 'Pendiente'
  | 'En confección'
  | 'Terminado'
  | 'Entregado'
  | 'Cancelado';

export type PrioridadPedido = 'Normal' | 'Alta' | 'Urgente';

export interface Pedido {
  id: string;
  numero_consecutivo: string; // Único, consecutivo e.g. PED-0001 (RN-003)
  cliente_id: string; // Obligatorio (RN-001)
  diseno_id?: string;
  tipo_prenda: string;
  color: string;
  material_principal: string;
  medidas_snapshot?: Partial<MedidasCorporales>; // Copia de medidas al momento del pedido
  fecha_pedido: string;
  fecha_estimada_entrega: string; // Obligatoria (RN-002)
  estado: EstadoPedido;
  prioridad: PrioridadPedido;
  monto_total: number;
  monto_pagado: number;
  monto_pendiente: number;
  precio_total?: number;
  saldo_pendiente?: number;
  estado_pago?: string;
  cliente_nombre?: string;
  observaciones?: string;
  created_by_user_id: string;
  created_by_user_name: string;
  created_at: string;
  updated_at: string;

  // Joined fields for display
  cliente?: Cliente;
  diseno?: Diseno;

  // FASE 3: Asignación de Taller
  operario_id?: string;
  operario_nombre?: string;
  fecha_asignacion?: string;
  etapa_confeccion?: EtapaConfeccion;
  notas_taller?: string;
}

// Audit trail for order status changes (RN-010)
export interface PedidoHistorialEstado {
  id: string;
  pedido_id: string;
  estado_anterior: EstadoPedido | 'Nuevo';
  estado_nuevo: EstadoPedido;
  usuario_id: string;
  usuario_nombre: string;
  usuario_rol: RolUsuario;
  fecha_hora: string;
  observacion?: string;
}

// STATS & METADATA
export interface StatsFase1 {
  totalClientes: number;
  totalMedidasRegistradas: number;
  totalDisenos: number;
  totalPedidos: number;
  pedidosPorEstado: Record<EstadoPedido, number>;
  montoTotalProyectado: number;
}

// FASE 2: INVENTARIO, BODEGA Y COMPRAS
export type CategoriaMaterial = 
  | 'Telas y Linos'
  | 'Forros y Entretelas'
  | 'Cierres y Herrajes'
  | 'Botones y Adornos'
  | 'Hilos y Mercadería'
  | 'Empaque y Presentación';

export type UnidadMedidaMaterial = 
  | 'Metros'
  | 'Yardas'
  | 'Unidades'
  | 'Rollos'
  | 'Carretes'
  | 'Paquetes';

export interface MaterialInsumo {
  id: string;
  codigo: string; // Ej: MAT-001
  nombre: string;
  categoria: CategoriaMaterial;
  unidad_medida: UnidadMedidaMaterial;
  stock_actual: number;
  stock_minimo: number;
  costo_unitario: number;
  ubicacion_bodega: string; // Ej: Estante A-2, Cajón B-1
  proveedor_habitual?: string;
  estado: 'Disponible' | 'Stock Bajo' | 'Agotado' | 'Inactivo';
  created_at: string;
  updated_at: string;
}

// Lista de Materiales por Prenda / Diseño (BOM - Bill of Materials)
export interface ListaMaterialesDiseno {
  id: string;
  diseno_id: string;
  material_id: string;
  cantidad_requerida: number; // Cantidad por cada prenda confeccionada
  notas?: string;
  material?: MaterialInsumo;
}

export type TipoMovimientoInventario = 
  | 'Entrada (Compra/Proveedor)'
  | 'Salida (Descuento Automático Pedido)'
  | 'Salida (Ajuste/Merma)'
  | 'Entrada (Devolución/Cancelación)';

export interface MovimientoInventario {
  id: string;
  material_id: string;
  tipo_movimiento: TipoMovimientoInventario;
  cantidad: number;
  stock_anterior: number;
  stock_nuevo: number;
  pedido_id?: string;
  numero_consecutivo_pedido?: string;
  usuario_id: string;
  usuario_nombre: string;
  motivo_observacion: string;
  fecha_hora: string;
  material_nombre?: string;
}

export interface StatsInventario {
  totalMateriales: number;
  materialesStockBajo: number;
  materialesAgotados: number;
  valorTotalInventario: number;
  movimientosMesCount: number;
}

// FASE 3: CONTROL DE TALLER, PRUEBAS Y NOTIFICACIONES
export type EspecialidadOperario = 
  | 'Maestro Sastre (Estructura)'
  | 'Sastre Senior (Corte y Alta Costura)'
  | 'Modista / Especialista en Gala'
  | 'Especialista en Pantalón y Vestir'
  | 'Artesano / Bordados y Acabados'
  | 'Costurera de Ensamble';

export type EstadoOperario = 'Disponible' | 'Saturado' | 'En Permiso' | 'Inactivo';

export interface OperarioTaller {
  id: string;
  nombre: string;
  especialidad: EspecialidadOperario;
  capacidad_simultanea: number; // Ej: 3 pedidos máximo
  contacto: string;
  estado: EstadoOperario;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export type EtapaConfeccion = 
  | 'Patronaje y Corte'
  | 'Primer Ensamble'
  | 'Prueba de Ajuste'
  | 'Confección Final'
  | 'Planchado y Control de Calidad';

export type TipoPruebaCita = 
  | 'Primera Prueba (Estructura)'
  | 'Segunda Prueba (Ajuste)'
  | 'Prueba Final (Entrega)';

export type EstadoCitaPrueba = 
  | 'Programada'
  | 'Confirmada'
  | 'Realizada'
  | 'Reprogramada'
  | 'Cancelada';

export interface CitaPrueba {
  id: string;
  pedido_id: string;
  numero_consecutivo_pedido: string;
  cliente_id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  fecha_hora: string; // ISO date-time string
  tipo_prueba: TipoPruebaCita;
  estado: EstadoCitaPrueba;
  sastre_atendio_id?: string;
  sastre_atendio_nombre?: string;
  observaciones_ajuste?: string; // Anotaciones técnicas de ajustes
  notificacion_enviada: boolean;
  created_at: string;
  updated_at: string;
}

export type CanalNotificacion = 'WhatsApp' | 'SMS' | 'Correo Electrónico';

export type TipoEventoNotificacion = 
  | 'Aviso Cita Prueba'
  | 'Prenda Lista / Terminado'
  | 'Recordatorio Cita'
  | 'Aviso Avance Taller';

export interface NotificacionCliente {
  id: string;
  pedido_id?: string;
  cita_id?: string;
  cliente_id: string;
  cliente_nombre: string;
  cliente_contacto: string;
  canal: CanalNotificacion;
  evento: TipoEventoNotificacion;
  mensaje: string;
  estado_envio: 'Enviado' | 'Entregado' | 'Simulado Exitoso';
  fecha_hora: string;
  enviado_por_usuario: string;
}

export interface CargaOperarioItem {
  operario_id: string;
  nombre: string;
  especialidad: EspecialidadOperario;
  capacidad: number;
  pedidosAsignadosCount: number;
  pedidosEnConfeccionCount: number;
  estadoDisponibilidad: EstadoOperario;
}

export interface StatsTaller {
  totalOperarios: number;
  pedidosEnTaller: number;
  pedidosSinAsignar: number;
  citasSemanaCount: number;
  citasHoyCount: number;
  notificacionesEnviadasTotal: number;
  cargaOperarios: CargaOperarioItem[];
}

// FASE 4: LIQUIDACIÓN, FACTURACIÓN Y REPORTES ANALÍTICOS

export type MetodoPago = 'Efectivo' | 'Transferencia Bancaria' | 'Tarjeta de Crédito / Débito' | 'Nequi / Daviplata';

export type TipoComprobante = 'Recibo de Pago' | 'Factura de Venta' | 'Comprobante de Caja';

export interface ComprobanteVenta {
  id: string;
  numero_consecutivo: string; // ej: REC-0001
  pedido_id: string; // OBLIGATORIO por RN-007
  numero_consecutivo_pedido: string;
  cliente_id: string;
  cliente_nombre: string;
  cliente_documento: string;
  tipo_comprobante: TipoComprobante;
  monto_total_pedido: number;
  monto_pagado_momento: number;
  saldo_restante_despues: number;
  metodo_pago: MetodoPago;
  concepto: string;
  estado_pago_pedido: 'Pendiente' | 'Abonado Parcial' | 'Pagado Total';
  fecha_emision: string;
  emitido_por_usuario: string;
  notas?: string;
}

export type ReporteFiltroFechas = 'Este Mes' | 'Ultimo Trimestre' | 'Año Actual' | 'Historico Total';

export interface ReporteVentaItem {
  id: string;
  fecha: string;
  comprobante: string;
  pedido: string;
  cliente: string;
  prenda: string;
  monto: number;
  metodoPago: MetodoPago;
}

export interface ReporteEstadoPedidoItem {
  estado: EstadoPedido;
  cantidad: number;
  valorTotal: number;
  porcentaje: number;
}

export interface ReporteCarteraClienteItem {
  cliente_id: string;
  nombre_completo: string;
  telefono: string;
  total_pedidos: number;
  total_comprado: number;
  total_pagado: number;
  saldo_pendiente: number;
}

export interface ReporteInventarioItem {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  stock_actual: number;
  unidad: string;
  costo_unitario: number;
  valor_total_bodega: number;
  estado_stock: 'Optimo' | 'Bajo Stock' | 'Agotado';
}

export interface ReporteProduccionTallerItem {
  operario_id: string;
  sastre_nombre: string;
  especialidad: string;
  prendas_en_proceso: number;
  prendas_terminadas: number;
  prendas_entregadas: number;
}

export interface ReportesGerenciales {
  filtroAplicado: ReporteFiltroFechas;
  ventas: {
    ingresosTotales: number;
    totalComprobantes: number;
    promedioTicket: number;
    items: ReporteVentaItem[];
  };
  estadosPedidos: ReporteEstadoPedidoItem[];
  carteraClientes: {
    totalDeudaPendiente: number;
    clientesConDeudaCount: number;
    items: ReporteCarteraClienteItem[];
  };
  inventario: {
    valorTotalBodega: number;
    itemsAgotadosCount: number;
    itemsBajoStockCount: number;
    items: ReporteInventarioItem[];
  };
  produccionTaller: ReporteProduccionTallerItem[];
}

export interface StatsDashboardGerencial {
  ingresosTotales: number;
  recaudadoAnticipos: number;
  carteraPendiente: number;
  totalPedidosFacturados: number;
  rentabilidadEstimadaPorcentaje: number;
  tiempoPromedioConfeccionDias: number;
  cumplimientoFechasEntregaPorcentaje: number;
  prendaMasVendida: {
    tipo_prenda: string;
    cantidad: number;
    totalIngresos: number;
  };
  ventasPorMes: { mes: string; monto: number; cantidad: number }[];
  distribucionEstados: { estado: string; cantidad: number; valor: number }[];
  topPrendas: { tipo: string; cantidad: number; total: number }[];
  topSastres: { nombre: string; especialidad: string; terminadas: number }[];
  distribucionMetodosPago: { metodo: string; total: number; porcentaje: number }[];
}

// ERD Metadata for Architecture Display
export interface EntityRelationInfo {
  tableName: string;
  description: string;
  primaryKey: string;
  foreignKeys: { field: string; refTable: string; rule: string }[];
  businessRules: string[];
  fields: { name: string; type: string; nullable: boolean; description: string }[];
}

