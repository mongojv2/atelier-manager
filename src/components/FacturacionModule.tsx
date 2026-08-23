import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  DollarSign, 
  CreditCard, 
  FileText, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Calendar, 
  User, 
  Scissors, 
  Building,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Download
} from 'lucide-react';
import { 
  ComprobanteVenta, 
  Pedido, 
  UsuarioActual, 
  MetodoPago, 
  TipoComprobante 
} from '../types';
import { api } from '../services/api';

interface FacturacionModuleProps {
  currentUser: UsuarioActual;
  pedidos: Pedido[];
  onRefreshData: () => void;
}

export const FacturacionModule: React.FC<FacturacionModuleProps> = ({
  currentUser,
  pedidos,
  onRefreshData
}) => {
  const [comprobantes, setComprobantes] = useState<ComprobanteVenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipoFilter, setSelectedTipoFilter] = useState<string>('TODOS');
  
  // Modal State: Novo Comprobante
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPedidoId, setSelectedPedidoId] = useState<string>('');
  const [tipoComprobante, setTipoComprobante] = useState<TipoComprobante>('Recibo de Pago');
  const [montoMomento, setMontoMomento] = useState<number | ''>('');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Transferencia Bancaria');
  const [concepto, setConcepto] = useState('');
  const [notas, setNotas] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal State: Ver / Imprimir Comprobante Oficial
  const [viewingComprobante, setViewingComprobante] = useState<ComprobanteVenta | null>(null);

  useEffect(() => {
    loadComprobantes();
  }, []);

  const loadComprobantes = async () => {
    setLoading(true);
    try {
      const data = await api.getComprobantes();
      setComprobantes(data);
    } catch (err: any) {
      console.error('Error cargando comprobantes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Pedidos elegibles para cobro (con saldo pendiente > 0 o para emitir recibo final)
  const pedidosElegibles = pedidos.filter(p => p.estado !== 'Cancelado');

  const selectedPedidoObj = pedidos.find(p => p.id === selectedPedidoId);

  // Al seleccionar pedido, sugerir monto pendiente
  const handleSelectPedido = (pedidoId: string) => {
    setSelectedPedidoId(pedidoId);
    setSubmitError(null);
    const p = pedidos.find(p => p.id === pedidoId);
    if (p) {
      const precioTotal = p.monto_total || p.precio_total || 0;
      const saldo = p.monto_pendiente !== undefined ? p.monto_pendiente : (p.saldo_pendiente !== undefined ? p.saldo_pendiente : Math.max(0, precioTotal - (p.monto_pagado || 0)));
      setMontoMomento(saldo > 0 ? saldo : precioTotal);
      setConcepto(`Pago/Abono registrado para pedido ${p.numero_consecutivo} (${p.tipo_prenda})`);
    } else {
      setMontoMomento('');
      setConcepto('');
    }
  };

  const handleCreateComprobante = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // BLINDAJE REGLA DE NEGOCIO RN-007
    if (!selectedPedidoId) {
      setSubmitError('Regla de Negocio (RN-007): Debe seleccionar obligatoriamente un Pedido válido existente para registrar la venta o pago.');
      return;
    }

    if (!montoMomento || Number(montoMomento) <= 0) {
      setSubmitError('El monto del abono o pago debe ser un valor numérico mayor a cero.');
      return;
    }

    setSubmitting(true);
    try {
      const nuevo = await api.createComprobante({
        pedido_id: selectedPedidoId,
        monto_pagado_momento: Number(montoMomento),
        tipo_comprobante: tipoComprobante,
        metodo_pago: metodoPago,
        concepto,
        emitido_por_usuario: currentUser.nombre,
        notas
      });

      setIsModalOpen(false);
      resetForm();
      await loadComprobantes();
      onRefreshData();
      // Abrir vista oficial del comprobante recién generado
      setViewingComprobante(nuevo);
    } catch (err: any) {
      setSubmitError(err.message || 'Error registrando el comprobante de pago.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedPedidoId('');
    setTipoComprobante('Recibo de Pago');
    setMontoMomento('');
    setMetodoPago('Transferencia Bancaria');
    setConcepto('');
    setNotas('');
    setSubmitError(null);
  };

  // Métricas financieras inmediatas
  const totalIngresos = comprobantes.reduce((sum, c) => sum + c.monto_pagado_momento, 0);
  const carteraTotalPendiente = pedidos.reduce((sum, p) => sum + (p.saldo_pendiente || 0), 0);
  const totalRecibos = comprobantes.filter(c => c.tipo_comprobante === 'Recibo de Pago').length;
  const totalFacturas = comprobantes.filter(c => c.tipo_comprobante === 'Factura de Venta').length;

  // Filtrado de comprobantes
  const filteredComprobantes = comprobantes.filter(c => {
    const matchesSearch = 
      c.numero_consecutivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.numero_consecutivo_pedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.metodo_pago.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipo = selectedTipoFilter === 'TODOS' || c.tipo_comprobante === selectedTipoFilter;

    return matchesSearch && matchesTipo;
  });

  const handlePrintComprobante = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER DE MÓDULO DE FACTURACIÓN Y PAGOS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Gestión de Facturación & Recibos de Caja
              </h2>
              <p className="text-sm text-slate-500">
                Emisión de comprobantes consecutivos, registro de abonos y liquidación de pedidos
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser.rol === 'Gerente' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Modo Gerencial (Lectura)</span>
            </div>
          ) : (
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all hover:shadow-indigo-200 hover:shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Emitir Recibo / Registrar Pago</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI METRICS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Ingresos Totales Recaudados</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            ${totalIngresos.toLocaleString('es-CO')}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Recaudado efectivo en caja/bancos</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Cartera por Cobrar (Saldos)</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700">
            ${carteraTotalPendiente.toLocaleString('es-CO')}
          </p>
          <p className="text-[11px] text-slate-500">
            Pendiente de cobro en pedidos en taller
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Recibos Emitidos</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {totalRecibos} <span className="text-xs font-normal text-slate-400">recibos</span>
          </p>
          <p className="text-[11px] text-slate-500">
            Comprobantes de abonos e iniciales
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Facturas de Venta</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {totalFacturas} <span className="text-xs font-normal text-slate-400">facturas</span>
          </p>
          <p className="text-[11px] text-slate-500">
            Comprobantes de liquidación final
          </p>
        </div>

      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por consecutivo, cliente, pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {['TODOS', 'Recibo de Pago', 'Factura de Venta', 'Comprobante de Caja'].map(tipo => (
            <button
              key={tipo}
              onClick={() => setSelectedTipoFilter(tipo)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                selectedTipoFilter === tipo
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tipo === 'TODOS' ? 'Todos los Comprobantes' : tipo}
            </button>
          ))}
        </div>

      </div>

      {/* TABLA DE COMPROBANTES EMITIDOS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-600" />
            <span>Histórico de Comprobantes y Movimientos de Caja</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Mostrando {filteredComprobantes.length} de {comprobantes.length} registros
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
            <p className="text-xs text-slate-500">Cargando histórico de facturación...</p>
          </div>
        ) : filteredComprobantes.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-600 font-bold text-sm">No se encontraron comprobantes registrados</p>
            <p className="text-xs text-slate-400">
              {searchTerm ? 'Pruebe ajustando los términos de búsqueda.' : 'Inicie emitiendo el primer recibo de pago para un pedido.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-4">N° Comprobante</th>
                  <th className="py-3 px-4">Pedido Asociado</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Tipo & Método</th>
                  <th className="py-3 px-4 text-right">Monto Recibido</th>
                  <th className="py-3 px-4 text-right">Saldo Restante</th>
                  <th className="py-3 px-4">Fecha Emisión</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredComprobantes.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                      {comp.numero_consecutivo}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      {comp.numero_consecutivo_pedido}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{comp.cliente_nombre}</div>
                      <div className="text-[10px] text-slate-400">Doc: {comp.cliente_documento}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        comp.tipo_comprobante === 'Factura de Venta' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {comp.tipo_comprobante}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        💳 {comp.metodo_pago}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-emerald-700">
                      +${comp.monto_pagado_momento.toLocaleString('es-CO')}
                    </td>

                    <td className="py-3.5 px-4 text-right font-semibold text-slate-600">
                      {comp.saldo_restante_despues === 0 ? (
                        <span className="text-emerald-600 font-bold">PAGADO TOTAL</span>
                      ) : (
                        `$${comp.saldo_restante_despues.toLocaleString('es-CO')}`
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(comp.fecha_emision).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setViewingComprobante(comp)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg text-xs font-medium transition-colors border border-slate-200"
                        title="Ver e Imprimir Comprobante Oficial"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Ver / Imprimir</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: EMITIR RECTBO / REGISTRAR PAGO (RN-007 PROTECTED) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100 my-8">
            
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Emitir Comprobante de Venta / Pago</h3>
                  <p className="text-xs text-slate-400">Asociación obligatoria a Pedido activo (RN-007)</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateComprobante} className="p-6 space-y-5">
              
              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block">Validación Rechazada:</strong>
                    <span>{submitError}</span>
                  </div>
                </div>
              )}

              {/* SELECTOR DE PEDIDO (BLINDAJE RN-007) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>1. Seleccionar Pedido Obligatorio *</span>
                  <span className="text-[10px] text-amber-600 font-semibold uppercase">Requisito RN-007</span>
                </label>

                <select
                  value={selectedPedidoId}
                  onChange={(e) => handleSelectPedido(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                >
                  <option value="">-- Seleccionar Pedido para Cobro/Abono --</option>
                  {pedidosElegibles.map(p => {
                    const precioTotal = p.monto_total || p.precio_total || 0;
                    const saldo = p.monto_pendiente !== undefined ? p.monto_pendiente : (p.saldo_pendiente !== undefined ? p.saldo_pendiente : Math.max(0, precioTotal - (p.monto_pagado || 0)));
                    return (
                      <option key={p.id} value={p.id}>
                        {p.numero_consecutivo} - {p.cliente_nombre || 'Cliente'} ({p.tipo_prenda}) - Total: ${precioTotal.toLocaleString('es-CO')} | Saldo: ${saldo.toLocaleString('es-CO')}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* CARD RESUMEN DEL PEDIDO SELECCIONADO */}
              {selectedPedidoObj && (
                <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-indigo-900 border-b border-indigo-100 pb-1.5">
                    <span>{selectedPedidoObj.numero_consecutivo} - {selectedPedidoObj.tipo_prenda}</span>
                    <span className="text-indigo-700">{selectedPedidoObj.cliente_nombre || 'Cliente'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="bg-white p-2 rounded-xl border border-indigo-100">
                      <span className="text-[10px] text-slate-400 block">Precio Total</span>
                      <span className="font-bold text-slate-800">${(selectedPedidoObj.monto_total || selectedPedidoObj.precio_total || 0).toLocaleString('es-CO')}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-indigo-100">
                      <span className="text-[10px] text-slate-400 block">Abonado Previo</span>
                      <span className="font-bold text-emerald-700">${(selectedPedidoObj.monto_pagado || 0).toLocaleString('es-CO')}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-indigo-100">
                      <span className="text-[10px] text-slate-400 block">Saldo Pendiente</span>
                      <span className="font-bold text-amber-700">${(selectedPedidoObj.monto_pendiente !== undefined ? selectedPedidoObj.monto_pendiente : (selectedPedidoObj.saldo_pendiente || 0)).toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TIPO DE COMPROBANTE Y MÉTODO DE PAGO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Tipo de Comprobante *</label>
                  <select
                    value={tipoComprobante}
                    onChange={(e) => setTipoComprobante(e.target.value as TipoComprobante)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Recibo de Pago">Recibo de Pago (Abono)</option>
                    <option value="Factura de Venta">Factura de Venta (Liquidación)</option>
                    <option value="Comprobante de Caja">Comprobante de Caja</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Método de Pago *</label>
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                    <option value="Efectivo">Efectivo en Caja</option>
                    <option value="Tarjeta de Crédito / Débito">Tarjeta de Crédito / Débito</option>
                    <option value="Nequi / Daviplata">Nequi / Daviplata</option>
                  </select>
                </div>
              </div>

              {/* MONTO A REGISTRAR */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Monto a Recibir / Abonar ($ COP) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 font-bold text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej: 500000"
                    value={montoMomento}
                    onChange={(e) => setMontoMomento(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* CONCEPTO & NOTAS */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Concepto del Pago</label>
                <input
                  type="text"
                  placeholder="Ej: Anticipo 50% para telas e insumos de vestido"
                  value={concepto}
                  onChange={(e) => setConcepto(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Notas Adicionales / Referencia Bancaria</label>
                <textarea
                  rows={2}
                  placeholder="Ej: N° de transacción 998231 de Bancolombia"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* BUTTONS */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  {submitting ? 'Procesando Venta...' : 'Emitir Comprobante'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMPROBANTE OFICIAL PARA VER / IMPRIMIR */}
      {viewingComprobante && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 my-8">
            
            {/* Header modal controls */}
            <div className="bg-slate-100 p-4 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-indigo-600" />
                <span>Comprobante Oficial de Venta - Atelier Manager</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintComprobante}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Recibo</span>
                </button>
                <button
                  onClick={() => setViewingComprobante(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE COMPROBANTE CONTAINER */}
            <div className="p-8 space-y-6 text-slate-800 bg-white" id="printable-receipt">
              
              {/* MEMBRETE */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <div className="flex items-center gap-2 text-indigo-700 font-black text-xl tracking-tight">
                    <Scissors className="w-6 h-6 transform -rotate-45" />
                    <span>ATELIER MANAGER</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-1">Alta Costura & Confección Personalizada</p>
                  <p className="text-[11px] text-slate-400">NIT: 901.442.889-1 • Calle Real de la Moda #45-10, Medellín</p>
                  <p className="text-[11px] text-slate-400">PBX: +57 (604) 444-9988 • contacto@ateliermanager.co</p>
                </div>

                <div className="text-right space-y-1">
                  <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-mono font-bold">
                    {viewingComprobante.tipo_comprobante.toUpperCase()}
                  </div>
                  <div className="text-xl font-black font-mono text-indigo-700">
                    {viewingComprobante.numero_consecutivo}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Fecha: {new Date(viewingComprobante.fecha_emision).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              {/* CLIENTE & PEDIDO GRID */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Datos del Cliente
                  </span>
                  <p className="font-bold text-slate-900 text-sm">{viewingComprobante.cliente_nombre}</p>
                  <p className="text-slate-600">Documento: {viewingComprobante.cliente_documento}</p>
                  <p className="text-slate-600">ID Cliente: {viewingComprobante.cliente_id}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Referencia de Pedido (RN-007)
                  </span>
                  <p className="font-bold text-indigo-800 text-sm font-mono">{viewingComprobante.numero_consecutivo_pedido}</p>
                  <p className="text-slate-600">Emitido por: {viewingComprobante.emitido_por_usuario}</p>
                  <p className="text-slate-600">Método de Pago: {viewingComprobante.metodo_pago}</p>
                </div>
              </div>

              {/* DETALLE FINANCIERO */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Detalle del Pago y Liquidación
                </span>

                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Concepto / Descripción</th>
                        <th className="p-3 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{viewingComprobante.concepto}</p>
                          {viewingComprobante.notas && (
                            <p className="text-[11px] text-slate-500 italic mt-0.5">Nota: {viewingComprobante.notas}</p>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-700">
                          ${(viewingComprobante.monto_total_pedido || 0).toLocaleString('es-CO')}
                        </td>
                      </tr>
                      <tr className="bg-emerald-50/50">
                        <td className="p-3 font-bold text-emerald-900">
                          MONTO RECIBIDO EN ESTE COMPROBANTE ({viewingComprobante.metodo_pago})
                        </td>
                        <td className="p-3 text-right font-black font-mono text-emerald-700 text-sm">
                          +${(viewingComprobante.monto_pagado_momento || 0).toLocaleString('es-CO')}
                        </td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td className="p-3 font-bold text-slate-700">
                          SALDO PENDIENTE DESPUÉS DE ESTE PAGO
                        </td>
                        <td className="p-3 text-right font-black font-mono text-slate-900 text-sm">
                          {viewingComprobante.saldo_restante_despues === 0 ? (
                            <span className="text-emerald-600">PAGADO TOTAL ($0)</span>
                          ) : (
                            `$${(viewingComprobante.saldo_restante_despues || 0).toLocaleString('es-CO')}`
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PIE DE FIRMAS Y AVISO DE LEY */}
              <div className="pt-8 grid grid-cols-2 gap-12 text-center text-xs text-slate-500 border-t border-slate-200">
                <div className="space-y-8">
                  <div className="border-b border-slate-300 w-3/4 mx-auto" />
                  <p className="font-bold text-slate-800">Firma del Cliente / Aceptación</p>
                </div>

                <div className="space-y-8">
                  <div className="border-b border-slate-300 w-3/4 mx-auto" />
                  <p className="font-bold text-slate-800">Mariana López • Tesorería Atelier</p>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-center pt-2">
                Este comprobante de venta constituye constancia de pago oficial para las partes. Documento verificado en el sistema Atelier Manager.
              </div>

            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingComprobante(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Cerrar Comprobante
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
