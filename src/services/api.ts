import { 
  Cliente, 
  MedidasCorporales, 
  Diseno, 
  Pedido, 
  PedidoHistorialEstado, 
  StatsFase1, 
  EstadoPedido, 
  RolUsuario,
  MaterialInsumo,
  ListaMaterialesDiseno,
  MovimientoInventario,
  TipoMovimientoInventario,
  StatsInventario,
  OperarioTaller,
  EtapaConfeccion,
  CitaPrueba,
  NotificacionCliente,
  StatsTaller,
  TipoPruebaCita,
  EstadoCitaPrueba,
  CanalNotificacion,
  TipoEventoNotificacion,
  ComprobanteVenta,
  MetodoPago,
  TipoComprobante,
  ReportesGerenciales,
  StatsDashboardGerencial,
  ReporteFiltroFechas
} from '../types';
import { clientEnv } from '../config/env';

const API_BASE = clientEnv.apiBaseUrl;

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (_) {}
  }

  if (!res.ok) {
    let errorMsg = data.error || `Error HTTP ${res.status}: ${res.statusText}`;
    throw new Error(errorMsg);
  }
  return data as T;
}

export const api = {
  // CLIENTES (RF-001)
  async getClientes(): Promise<Cliente[]> {
    const res = await fetch(`${API_BASE}/clientes`);
    return handleResponse<Cliente[]>(res);
  },

  async createCliente(cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>): Promise<Cliente> {
    const res = await fetch(`${API_BASE}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente)
    });
    return handleResponse<Cliente>(res);
  },

  async updateCliente(id: string, payload: Partial<Cliente>): Promise<Cliente> {
    const res = await fetch(`${API_BASE}/clientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<Cliente>(res);
  },

  async toggleClienteEstado(id: string): Promise<Cliente> {
    const res = await fetch(`${API_BASE}/clientes/${id}/toggle-estado`, {
      method: 'PATCH'
    });
    return handleResponse<Cliente>(res);
  },

  // MEDIDAS (RF-002)
  async getMedidasByCliente(clienteId: string): Promise<MedidasCorporales[]> {
    const res = await fetch(`${API_BASE}/medidas/cliente/${clienteId}`);
    return handleResponse<MedidasCorporales[]>(res);
  },

  async createMedida(medida: Omit<MedidasCorporales, 'id' | 'created_at'>): Promise<MedidasCorporales> {
    const res = await fetch(`${API_BASE}/medidas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medida)
    });
    return handleResponse<MedidasCorporales>(res);
  },

  // DISEÑOS (RF-003)
  async getDisenos(): Promise<Diseno[]> {
    const res = await fetch(`${API_BASE}/disenos`);
    return handleResponse<Diseno[]>(res);
  },

  async createDiseno(diseno: Omit<Diseno, 'id' | 'codigo' | 'created_at'>): Promise<Diseno> {
    const res = await fetch(`${API_BASE}/disenos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(diseno)
    });
    return handleResponse<Diseno>(res);
  },

  async updateDiseno(id: string, payload: Partial<Diseno>): Promise<Diseno> {
    const res = await fetch(`${API_BASE}/disenos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<Diseno>(res);
  },

  // PEDIDOS (RF-004, RF-005)
  async getPedidos(): Promise<Pedido[]> {
    const res = await fetch(`${API_BASE}/pedidos`);
    return handleResponse<Pedido[]>(res);
  },

  async getPedidoById(id: string): Promise<Pedido> {
    const res = await fetch(`${API_BASE}/pedidos/${id}`);
    return handleResponse<Pedido>(res);
  },

  async createPedido(pedidoData: {
    cliente_id: string;
    diseno_id?: string;
    tipo_prenda: string;
    color: string;
    material_principal: string;
    fecha_estimada_entrega: string;
    prioridad?: 'Normal' | 'Alta' | 'Urgente';
    monto_total: number;
    monto_pagado: number;
    observaciones?: string;
    usuario_nombre: string;
    usuario_rol: RolUsuario;
  }): Promise<Pedido> {
    const res = await fetch(`${API_BASE}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedidoData)
    });
    return handleResponse<Pedido>(res);
  },

  async updatePedidoEstado(
    pedidoId: string, 
    estado: EstadoPedido, 
    usuarioNombre: string, 
    usuarioRol: RolUsuario, 
    observacion?: string
  ): Promise<Pedido> {
    const res = await fetch(`${API_BASE}/pedidos/${pedidoId}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estado,
        usuario_nombre: usuarioNombre,
        usuario_rol: usuarioRol,
        observacion
      })
    });
    return handleResponse<Pedido>(res);
  },

  async updatePedidoDetalles(pedidoId: string, payload: Partial<Pedido>): Promise<Pedido> {
    const res = await fetch(`${API_BASE}/pedidos/${pedidoId}/detalles`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<Pedido>(res);
  },

  async deletePedido(pedidoId: string, usuarioRol: RolUsuario): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/pedidos/${pedidoId}?usuario_rol=${encodeURIComponent(usuarioRol)}`, {
      method: 'DELETE'
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // AUDIT LOGS (RN-010)
  async getHistorialLogs(): Promise<PedidoHistorialEstado[]> {
    const res = await fetch(`${API_BASE}/historial`);
    return handleResponse<PedidoHistorialEstado[]>(res);
  },

  async getHistorialByPedido(pedidoId: string): Promise<PedidoHistorialEstado[]> {
    const res = await fetch(`${API_BASE}/historial/pedido/${pedidoId}`);
    return handleResponse<PedidoHistorialEstado[]>(res);
  },

  // STATS
  async getStats(): Promise<StatsFase1> {
    const res = await fetch(`${API_BASE}/stats`);
    return handleResponse<StatsFase1>(res);
  },

  // FASE 2: MATERIALES E INSUMOS
  async getMateriales(): Promise<MaterialInsumo[]> {
    const res = await fetch(`${API_BASE}/materiales`);
    return handleResponse<MaterialInsumo[]>(res);
  },

  async createMaterial(material: Omit<MaterialInsumo, 'id' | 'codigo' | 'created_at' | 'updated_at' | 'estado'>): Promise<MaterialInsumo> {
    const res = await fetch(`${API_BASE}/materiales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(material)
    });
    return handleResponse<MaterialInsumo>(res);
  },

  async updateMaterial(id: string, payload: Partial<MaterialInsumo>): Promise<MaterialInsumo> {
    const res = await fetch(`${API_BASE}/materiales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<MaterialInsumo>(res);
  },

  // LISTA DE MATERIALES POR PRENDA (BOM)
  async getBOMByDiseno(disenoId: string): Promise<ListaMaterialesDiseno[]> {
    const res = await fetch(`${API_BASE}/disenos/${disenoId}/bom`);
    return handleResponse<ListaMaterialesDiseno[]>(res);
  },

  async saveBOMDiseno(disenoId: string, items: { material_id: string; cantidad_requerida: number; notas?: string }[]): Promise<ListaMaterialesDiseno[]> {
    const res = await fetch(`${API_BASE}/disenos/${disenoId}/bom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    return handleResponse<ListaMaterialesDiseno[]>(res);
  },

  // MOVIMIENTOS DE BODEGA & COMPRAS
  async getMovimientosInventario(materialId?: string): Promise<MovimientoInventario[]> {
    const url = materialId ? `${API_BASE}/inventario/movimientos?material_id=${materialId}` : `${API_BASE}/inventario/movimientos`;
    const res = await fetch(url);
    return handleResponse<MovimientoInventario[]>(res);
  },

  async registrarMovimientoInventario(data: {
    material_id: string;
    tipo_movimiento: TipoMovimientoInventario;
    cantidad: number;
    usuario_nombre: string;
    motivo_observacion: string;
    pedido_id?: string;
  }): Promise<MovimientoInventario> {
    const res = await fetch(`${API_BASE}/inventario/movimientos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<MovimientoInventario>(res);
  },

  async getStatsInventario(): Promise<StatsInventario> {
    const res = await fetch(`${API_BASE}/inventario/stats`);
    return handleResponse<StatsInventario>(res);
  },

  // FASE 3: CONTROL DE TALLER, PRUEBAS Y NOTIFICACIONES
  async getOperarios(): Promise<OperarioTaller[]> {
    const res = await fetch(`${API_BASE}/operarios`);
    return handleResponse<OperarioTaller[]>(res);
  },

  async createOperario(operario: Omit<OperarioTaller, 'id' | 'created_at' | 'updated_at'>): Promise<OperarioTaller> {
    const res = await fetch(`${API_BASE}/operarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(operario)
    });
    return handleResponse<OperarioTaller>(res);
  },

  async updateOperario(id: string, payload: Partial<OperarioTaller>): Promise<OperarioTaller> {
    const res = await fetch(`${API_BASE}/operarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<OperarioTaller>(res);
  },

  async asignarPedidoTaller(data: {
    pedido_id: string;
    operario_id: string;
    etapa_confeccion?: EtapaConfeccion;
    notas_taller?: string;
    usuario_nombre: string;
    usuario_rol: RolUsuario;
  }): Promise<Pedido> {
    const res = await fetch(`${API_BASE}/taller/asignar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Pedido>(res);
  },

  async getCitasPruebas(): Promise<CitaPrueba[]> {
    const res = await fetch(`${API_BASE}/citas`);
    return handleResponse<CitaPrueba[]>(res);
  },

  async createCitaPrueba(data: {
    pedido_id: string;
    fecha_hora: string;
    tipo_prueba: TipoPruebaCita;
    sastre_atendio_id?: string;
    observaciones_ajuste?: string;
    usuario_nombre: string;
    usuario_rol: RolUsuario;
    notificar_cliente?: boolean;
  }): Promise<CitaPrueba> {
    const res = await fetch(`${API_BASE}/citas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<CitaPrueba>(res);
  },

  async updateCitaPrueba(id: string, payload: Partial<CitaPrueba> & { usuario_nombre?: string }): Promise<CitaPrueba> {
    const res = await fetch(`${API_BASE}/citas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<CitaPrueba>(res);
  },

  async getNotificacionesClientes(): Promise<NotificacionCliente[]> {
    const res = await fetch(`${API_BASE}/notificaciones`);
    return handleResponse<NotificacionCliente[]>(res);
  },

  async enviarNotificacionCliente(data: {
    cliente_id: string;
    pedido_id?: string;
    cita_id?: string;
    canal: CanalNotificacion;
    evento: TipoEventoNotificacion;
    mensaje: string;
    usuario_nombre: string;
  }): Promise<NotificacionCliente> {
    const res = await fetch(`${API_BASE}/notificaciones/enviar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<NotificacionCliente>(res);
  },

  async getStatsTaller(): Promise<StatsTaller> {
    const res = await fetch(`${API_BASE}/taller/stats`);
    return handleResponse<StatsTaller>(res);
  },

  // FASE 4: LIQUIDACIÓN, FACTURACIÓN Y REPORTES GERENCIALES
  async getComprobantes(): Promise<ComprobanteVenta[]> {
    const res = await fetch(`${API_BASE}/comprobantes`);
    return handleResponse<ComprobanteVenta[]>(res);
  },

  async getComprobanteById(id: string): Promise<ComprobanteVenta> {
    const res = await fetch(`${API_BASE}/comprobantes/${id}`);
    return handleResponse<ComprobanteVenta>(res);
  },

  async createComprobante(data: {
    pedido_id: string;
    monto_pagado_momento: number;
    tipo_comprobante: TipoComprobante;
    metodo_pago: MetodoPago;
    concepto?: string;
    emitido_por_usuario: string;
    notas?: string;
  }): Promise<ComprobanteVenta> {
    const res = await fetch(`${API_BASE}/comprobantes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<ComprobanteVenta>(res);
  },

  async getReportesGerenciales(rango: ReporteFiltroFechas = 'Historico Total'): Promise<ReportesGerenciales> {
    const res = await fetch(`${API_BASE}/reportes/gerenciales?rango=${encodeURIComponent(rango)}`);
    return handleResponse<ReportesGerenciales>(res);
  },

  async getStatsDashboardGerencial(): Promise<StatsDashboardGerencial> {
    const res = await fetch(`${API_BASE}/reportes/dashboard`);
    return handleResponse<StatsDashboardGerencial>(res);
  }
};
