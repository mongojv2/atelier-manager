import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Palette, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Eye, 
  Trash2, 
  DollarSign, 
  Ruler, 
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Pedido, EstadoPedido, Cliente, Diseno, StatsFase1, UsuarioActual } from '../types';
import { api } from '../services/api';
import { PedidoDetailModal, ESTADOS_INFO } from './PedidoDetailModal';

interface PedidosModuleProps {
  currentUser: UsuarioActual;
}

export const PedidosModule: React.FC<PedidosModuleProps> = ({ currentUser }) => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [disenos, setDisenos] = useState<Diseno[]>([]);
  const [stats, setStats] = useState<StatsFase1 | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');

  // Modal View Detail
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null);

  // New Order Creation Wizard Modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    cliente_id: string;
    diseno_id: string;
    tipo_prenda: string;
    color: string;
    material_principal: string;
    fecha_estimada_entrega: string;
    prioridad: 'Normal' | 'Alta' | 'Urgente';
    monto_total: string;
    monto_pagado: string;
    observaciones: string;
  }>({
    cliente_id: '',
    diseno_id: '',
    tipo_prenda: '',
    color: '',
    material_principal: '',
    fecha_estimada_entrega: '',
    prioridad: 'Normal',
    monto_total: '350000',
    monto_pagado: '175000',
    observaciones: ''
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState<boolean>(false);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pData, cData, dData, sData] = await Promise.all([
        api.getPedidos(),
        api.getClientes(),
        api.getDisenos(),
        api.getStats()
      ]);
      setPedidos(Array.isArray(pData) ? pData : []);
      setClientes(Array.isArray(cData) ? cData.filter(c => c.estado === 'Activo') : []);
      setDisenos(Array.isArray(dData) ? dData.filter(d => d.estado === 'Activo') : []);
      setStats(sData || null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos de pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleOpenCreateModal = () => {
    // Set default date to +10 days
    const targetDate = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0];
    
    setFormData({
      cliente_id: clientes[0]?.id || '',
      diseno_id: disenos[0]?.id || '',
      tipo_prenda: disenos[0]?.nombre || 'Vestido de Gala',
      color: 'Azul Noche',
      material_principal: 'Seda Italiana / Encaje',
      fecha_estimada_entrega: targetDate,
      prioridad: 'Normal',
      monto_total: String(disenos[0]?.precio_base || 350000),
      monto_pagado: String((disenos[0]?.precio_base || 350000) / 2),
      observaciones: ''
    });
    setFormError(null);
    setShowCreateModal(true);
  };

  const handleSelectDiseno = (disenoId: string) => {
    const dis = (disenos || []).find(d => d.id === disenoId);
    if (dis) {
      setFormData(prev => ({
        ...prev,
        diseno_id: dis.id,
        tipo_prenda: dis.nombre,
        monto_total: String(dis.precio_base),
        monto_pagado: String(dis.precio_base / 2)
      }));
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOrder(true);
    setFormError(null);

    try {
      // RN-001 & RN-002 & RN-003 validation on server side
      await api.createPedido({
        cliente_id: formData.cliente_id,
        diseno_id: formData.diseno_id || undefined,
        tipo_prenda: formData.tipo_prenda,
        color: formData.color,
        material_principal: formData.material_principal,
        fecha_estimada_entrega: formData.fecha_estimada_entrega,
        prioridad: formData.prioridad,
        monto_total: Number(formData.monto_total),
        monto_pagado: Number(formData.monto_pagado),
        observaciones: formData.observaciones,
        usuario_nombre: currentUser.nombre,
        usuario_rol: currentUser.rol
      });

      setShowCreateModal(false);
      await loadAllData();
    } catch (err: any) {
      setFormError(err.message || 'Error al crear el pedido');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDeleteOrder = async (pedidoId: string, consecutivo: string) => {
    if (!window.confirm(`¿Está seguro de eliminar el pedido ${consecutivo}?`)) return;

    try {
      // RN-005 validation on backend
      await api.deletePedido(pedidoId, currentUser.rol);
      await loadAllData();
    } catch (err: any) {
      alert(`Error al eliminar pedido: ${err.message}`);
    }
  };

  const filteredPedidos = (pedidos || []).filter(p => {
    const matchesSearch = 
      (p.numero_consecutivo || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.tipo_prenda || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.cliente?.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.cliente?.apellido || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.cliente?.documento_id || '').includes(search);

    const matchesStatus = statusFilter === 'Todos' || p.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const isReadonlyRole = currentUser.rol === 'Gerente' || currentUser.rol === 'Bodega / Inventario';
  const isSastre = currentUser.rol === 'Diseñador / Sastre';

  return (
    <div className="space-y-6">
      
      {/* Top Phase 1 Summary Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Pedidos</span>
            <span className="text-xl font-bold text-slate-900">{stats.totalPedidos}</span>
          </div>

          <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 shadow-sm">
            <span className="text-[10px] text-amber-700 font-bold uppercase block">Pendientes</span>
            <span className="text-xl font-bold text-amber-900">{stats.pedidosPorEstado['Pendiente'] || 0}</span>
          </div>

          <div className="bg-indigo-50 p-3.5 rounded-2xl border border-indigo-200 shadow-sm">
            <span className="text-[10px] text-indigo-700 font-bold uppercase block">En Confección</span>
            <span className="text-xl font-bold text-indigo-900">{stats.pedidosPorEstado['En confección'] || 0}</span>
          </div>

          <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-200 shadow-sm">
            <span className="text-[10px] text-blue-700 font-bold uppercase block">Terminados</span>
            <span className="text-xl font-bold text-blue-900">{stats.pedidosPorEstado['Terminado'] || 0}</span>
          </div>

          <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 shadow-sm">
            <span className="text-[10px] text-emerald-700 font-bold uppercase block">Entregados</span>
            <span className="text-xl font-bold text-emerald-900">{stats.pedidosPorEstado['Entregado'] || 0}</span>
          </div>

          <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-sm">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Ingreso Proyectado</span>
            <span className="text-sm font-bold text-emerald-400">${stats.montoTotalProyectado.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Gestión y Seguimiento de Pedidos
            </h2>
            <span className="text-[11px] bg-indigo-100 text-indigo-800 font-medium px-2 py-0.5 rounded border border-indigo-200">
              Panel Principal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registro con consecutivo automático, asignación de fecha de entrega, control de saldos y trazabilidad completa.
          </p>
        </div>

        {!isReadonlyRole && !isSastre && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Pedido</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Consecutivo (PED-0001), Cliente o Prenda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-500 font-medium shrink-0 mr-1">Estado:</span>
          {['Todos', 'Pendiente', 'En confección', 'Terminado', 'Entregado', 'Cancelado'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-slate-900 text-white font-bold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Orders Table/List */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          Cargando pedidos de confección...
        </div>
      ) : filteredPedidos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-sm">No se encontraron pedidos</h3>
          <p className="text-xs text-slate-500 mt-1">Ajusta los filtros o registra el primer pedido del cliente.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-semibold">
                  <th className="p-3.5 pl-5">Consecutivo / Prioridad</th>
                  <th className="p-3.5">Cliente</th>
                  <th className="p-3.5">Prenda & Color</th>
                  <th className="p-3.5">Fecha de Entrega</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5">Balance $</th>
                  <th className="p-3.5 pr-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                {filteredPedidos.map((ped) => {
                  const stateInfo = ESTADOS_INFO[ped.estado];
                  return (
                    <tr key={ped.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Consecutivo */}
                      <td className="p-3.5 pl-5 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{ped.numero_consecutivo}</span>
                          {ped.prioridad !== 'Normal' && (
                            <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded border border-red-200">
                              {ped.prioridad}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Ped: {ped.fecha_pedido}
                        </span>
                      </td>

                      {/* Cliente */}
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900">{ped.cliente?.nombre} {ped.cliente?.apellido}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Doc: {ped.cliente?.documento_id}</p>
                      </td>

                      {/* Prenda */}
                      <td className="p-3.5">
                        <p className="font-semibold text-slate-900">{ped.tipo_prenda}</p>
                        <p className="text-[11px] text-slate-500">{ped.color} • <span className="italic">{ped.material_principal}</span></p>
                      </td>

                      {/* Fecha Entrega */}
                      <td className="p-3.5 font-mono">
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {ped.fecha_estimada_entrega}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${stateInfo.color}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {ped.estado}
                        </span>
                      </td>

                      {/* Financials */}
                      <td className="p-3.5 font-mono">
                        <p className="font-bold text-slate-900">${ped.monto_total.toLocaleString()}</p>
                        {ped.monto_pendiente > 0 ? (
                          <p className="text-[10px] text-amber-700 font-semibold">
                            Pend: ${ped.monto_pendiente.toLocaleString()}
                          </p>
                        ) : (
                          <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Pagado 100%
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPedidoId(ped.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Ficha</span>
                          </button>

                          {currentUser.rol === 'Administrador' && (
                            <button
                              onClick={() => handleDeleteOrder(ped.id, ped.numero_consecutivo)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Eliminar pedido"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE ORDER WIZARD MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2 font-serif">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                Registrar Nuevo Pedido Personalizado
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Cliente Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Cliente Registrado <span className="text-red-500">*</span>
                </label>
                {clientes.length === 0 ? (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded-xl">
                    No hay clientes activos. Registre un cliente primero en el módulo de Clientes.
                  </p>
                ) : (
                  <select
                    required
                    value={formData.cliente_id}
                    onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} {c.apellido} - Doc ID: {c.documento_id}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Diseño Catalog Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Modelo de Diseño Base (Catálogo)
                  </label>
                  <select
                    value={formData.diseno_id}
                    onChange={(e) => handleSelectDiseno(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                  >
                    {disenos.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.nombre} (${d.precio_base.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Prenda Confeccionada <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tipo_prenda}
                    onChange={(e) => setFormData({ ...formData, tipo_prenda: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Color de Tela / Tono</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Verde Esmeralda"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Material Principal / Tela</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Seda de Francia"
                    value={formData.material_principal}
                    onChange={(e) => setFormData({ ...formData, material_principal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                  />
                </div>
              </div>

              {/* Fecha Estimada */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Fecha Estimada de Entrega <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_estimada_entrega}
                    onChange={(e) => setFormData({ ...formData, fecha_estimada_entrega: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 font-bold text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nivel de Prioridad</label>
                  <select
                    value={formData.prioridad}
                    onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white font-semibold"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente (Evento Próximo)</option>
                  </select>
                </div>
              </div>

              {/* Financials */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Monto Total ($)</label>
                  <input
                    type="number"
                    required
                    step="1000"
                    value={formData.monto_total}
                    onChange={(e) => setFormData({ ...formData, monto_total: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-800 mb-1">Anticipo Recibido ($)</label>
                  <input
                    type="number"
                    required
                    step="1000"
                    value={formData.monto_pagado}
                    onChange={(e) => setFormData({ ...formData, monto_pagado: e.target.value })}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-xl text-xs bg-white font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observaciones / Especificaciones del Cliente</label>
                <textarea
                  rows={2}
                  placeholder="Instrucciones para taller (cremalleras invisibles, forros antialérgicos, etc.)..."
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingOrder || clientes.length === 0}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md"
                >
                  {savingOrder ? 'Registrando Pedido...' : 'Confirmar y Crear Pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedPedidoId && (
        <PedidoDetailModal
          pedidoId={selectedPedidoId}
          currentUser={currentUser}
          onClose={() => setSelectedPedidoId(null)}
          onOrderUpdated={loadAllData}
        />
      )}

    </div>
  );
};
