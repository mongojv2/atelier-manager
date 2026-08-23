import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  X, 
  Calendar, 
  User, 
  Palette, 
  Ruler, 
  DollarSign, 
  History, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Scissors, 
  Check, 
  XCircle,
  FileText,
  CreditCard,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { Pedido, EstadoPedido, PedidoHistorialEstado, UsuarioActual } from '../types';
import { api } from '../services/api';

interface PedidoDetailModalProps {
  pedidoId: string;
  onClose: () => void;
  currentUser: UsuarioActual;
  onOrderUpdated: () => void;
}

export const ESTADOS_INFO: Record<EstadoPedido, { color: string; badge: string; desc: string }> = {
  'Pendiente': {
    color: 'bg-amber-100 text-amber-900 border-amber-300',
    badge: 'bg-amber-500 text-white',
    desc: 'Pedido registrado. En espera de patronaje y asignación a taller.'
  },
  'En confección': {
    color: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    badge: 'bg-indigo-600 text-white',
    desc: 'Prenda en proceso de corte, armado, pruebas de ajuste y costura.'
  },
  'Terminado': {
    color: 'bg-blue-100 text-blue-900 border-blue-300',
    badge: 'bg-blue-600 text-white',
    desc: 'Prenda planchada y empacada. Lista para entrega al cliente.'
  },
  'Entregado': {
    color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    badge: 'bg-emerald-600 text-white',
    desc: 'Prenda entregada físicamente al cliente con saldo de pago $0.'
  },
  'Cancelado': {
    color: 'bg-red-100 text-red-900 border-red-300',
    badge: 'bg-red-600 text-white',
    desc: 'Pedido anulado por solicitud del cliente o falta de insumos.'
  }
};

export const PedidoDetailModal: React.FC<PedidoDetailModalProps> = ({
  pedidoId,
  onClose,
  currentUser,
  onOrderUpdated
}) => {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [historial, setHistorial] = useState<PedidoHistorialEstado[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State Change Form
  const [selectedNewState, setSelectedNewState] = useState<EstadoPedido>('Pendiente');
  const [stateChangeNote, setStateChangeNote] = useState<string>('');
  const [changingState, setChangingState] = useState<boolean>(false);

  // Payment registration simulation (RN-007)
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [registeringPayment, setRegisteringPayment] = useState<boolean>(false);

  const fetchPedidoData = async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await api.getPedidoById(pedidoId);
      const h = await api.getHistorialByPedido(pedidoId);
      setPedido(p);
      setHistorial(Array.isArray(h) ? h : []);
      if (p) {
        setSelectedNewState(p.estado);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar el detalle del pedido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidoData();
  }, [pedidoId]);

  const handleUpdateEstado = async (newState: EstadoPedido) => {
    if (!pedido) return;
    setChangingState(true);
    setError(null);

    try {
      // RN-004 & RN-006 & RN-010 validation on backend
      await api.updatePedidoEstado(
        pedido.id,
        newState,
        currentUser.nombre,
        currentUser.rol,
        stateChangeNote || `Cambio de estado ordenado por ${currentUser.nombre} (${currentUser.rol})`
      );

      setStateChangeNote('');
      await fetchPedidoData();
      onOrderUpdated();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar estado del pedido');
    } finally {
      setChangingState(false);
    }
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pedido) return;
    setRegisteringPayment(true);
    setError(null);

    try {
      const monto = Number(paymentAmount);
      if (isNaN(monto) || monto <= 0) {
        throw new Error('Ingrese un monto de pago válido mayor a $0.');
      }

      const nuevoMontoPagado = pedido.monto_pagado + monto;

      await api.updatePedidoDetalles(pedido.id, {
        monto_pagado: nuevoMontoPagado
      });

      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentNote('');
      await fetchPedidoData();
      onOrderUpdated();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el pago');
    } finally {
      setRegisteringPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center text-xs text-slate-500">
          Cargando detalle transaccional del pedido...
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <p className="font-bold text-slate-800 text-sm">Pedido no encontrado</p>
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const isDelivered = pedido.estado === 'Entregado';
  const isSastreRole = currentUser.rol === 'Diseñador / Sastre';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white font-serif">
                  Pedido {pedido.numero_consecutivo}
                </h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ESTADOS_INFO[pedido.estado].badge}`}>
                  {pedido.estado}
                </span>
                {pedido.prioridad !== 'Normal' && (
                  <span className="text-[10px] bg-red-950 text-red-300 border border-red-700/50 px-2 py-0.5 rounded font-bold uppercase">
                    {pedido.prioridad}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Fecha de Pedido: {pedido.fecha_pedido} | Entrega Estimada: <strong className="text-emerald-400">{pedido.fecha_estimada_entrega}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Top Error Alert */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-start gap-2.5 shadow-sm">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Notificación del Sistema:</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* DELIVERED LOCK WARNING */}
          {isDelivered && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Pedido Entregado:</strong> Este pedido ha sido completado y entregado. El detalle transaccional está protegido contra modificaciones.
              </span>
            </div>
          )}

          {/* Grid Layout Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Col 1: Cliente & Garment Spec */}
            <div className="md:col-span-2 space-y-4">
              
              {/* Cliente Card */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/80 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Cliente Vinculado
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {pedido.cliente?.nombre} {pedido.cliente?.apellido}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      Documento ID: {pedido.cliente?.documento_id} | Tel: {pedido.cliente?.telefono}
                    </p>
                  </div>
                  <span className="text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 font-medium">
                    {pedido.cliente?.email || 'Sin correo registrado'}
                  </span>
                </div>
              </div>

              {/* Garment Specifications */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                  Especificaciones de Confección
                </span>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tipo de Prenda</span>
                    <span className="font-bold text-slate-800">{pedido.tipo_prenda}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Modelo / Diseños</span>
                    <span className="font-bold text-slate-800">{pedido.diseno?.nombre || 'Diseño Personalizado Especial'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Color Seleccionado</span>
                    <span className="font-bold text-slate-800">{pedido.color}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Material Principal / Tela</span>
                    <span className="font-bold text-slate-800">{pedido.material_principal}</span>
                  </div>
                </div>

                {pedido.observaciones && (
                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Observaciones Técnicas:</span> {pedido.observaciones}
                  </div>
                )}
              </div>

              {/* FASE 3: Workshop Assignment & Stage Snapshot */}
              <div className="border border-indigo-200 rounded-2xl p-4 bg-indigo-50/50 space-y-2">
                <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1">
                  <Scissors className="w-3.5 h-3.5 text-indigo-600 transform -rotate-45" /> State of Workshop & Confección
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Sastre / Operario Asignado</span>
                    <span className="font-bold text-slate-900">
                      {pedido.operario_nombre ? pedido.operario_nombre : '⚠️ Sin asignar a taller'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Etapa Operativa Actual</span>
                    <span className="font-bold text-indigo-700">
                      {pedido.etapa_confeccion ? pedido.etapa_confeccion : 'Patronaje y Corte'}
                    </span>
                  </div>
                </div>
                {pedido.notas_taller && (
                  <p className="text-[11px] text-slate-600 italic border-t border-indigo-100 pt-1.5 mt-1">
                    <strong>Notas Taller:</strong> "{pedido.notas_taller}"
                  </p>
                )}
              </div>

              {/* Measurements Snapshot */}
              {pedido.medidas_snapshot && (
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5" /> Ficha de Medidas de la Prenda
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Fecha Toma: {pedido.medidas_snapshot.fecha_toma}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-[11px] font-mono">
                    {pedido.medidas_snapshot.cuello && <div className="p-1 bg-white border rounded">Cuello: {pedido.medidas_snapshot.cuello}cm</div>}
                    {pedido.medidas_snapshot.pecho_busto && <div className="p-1 bg-white border rounded">Pecho: {pedido.medidas_snapshot.pecho_busto}cm</div>}
                    {pedido.medidas_snapshot.cintura && <div className="p-1 bg-white border rounded">Cintura: {pedido.medidas_snapshot.cintura}cm</div>}
                    {pedido.medidas_snapshot.cadera && <div className="p-1 bg-white border rounded">Cadera: {pedido.medidas_snapshot.cadera}cm</div>}
                    {pedido.medidas_snapshot.talle_frente && <div className="p-1 bg-white border rounded">T.Frente: {pedido.medidas_snapshot.talle_frente}cm</div>}
                    {pedido.medidas_snapshot.largo_manga && <div className="p-1 bg-white border rounded">Manga: {pedido.medidas_snapshot.largo_manga}cm</div>}
                  </div>
                </div>
              )}

            </div>

            {/* Col 2: Financial Balance & Quick Actions */}
            <div className="space-y-4">
              
              {/* Financial Balance Card */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-900 text-white space-y-3 shadow-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Balance Económico del Pedido
                </span>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Monto Total Confección:</span>
                    <span className="font-bold text-white text-sm">${pedido.monto_total.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center text-emerald-400">
                    <span>Anticipos / Pagado:</span>
                    <span className="font-bold text-sm">${pedido.monto_pagado.toLocaleString()}</span>
                  </div>

                  <div className="border-t border-slate-800 pt-2 flex justify-between items-center">
                    <span className="font-bold text-amber-400">Saldo Pendiente:</span>
                    <span className={`font-mono font-extrabold text-base ${pedido.monto_pendiente > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      ${pedido.monto_pendiente.toLocaleString()}
                    </span>
                  </div>
                </div>

                {!isDelivered && pedido.monto_pendiente > 0 && !isSastreRole && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <CreditCard className="w-4 h-4" />
                    Registrar Pago / Abono
                  </button>
                )}
              </div>

              {/* State Transition Action Box */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Actualización de Estado
                </span>

                {!isDelivered ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Cambiar Estado Operativo:</label>
                    <div className="space-y-1.5">
                      {(['Pendiente', 'En confección', 'Terminado', 'Entregado', 'Cancelado'] as EstadoPedido[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateEstado(st)}
                          disabled={changingState || st === pedido.estado}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                            st === pedido.estado
                              ? 'bg-slate-900 text-white font-bold ring-2 ring-slate-900'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          <span>{st}</span>
                          {st === pedido.estado && <Check className="w-4 h-4 text-emerald-400" />}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2">
                      <input
                        type="text"
                        placeholder="Nota opcional para auditoría de estado..."
                        value={stateChangeNote}
                        onChange={(e) => setStateChangeNote(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Estado finalizado. No se permiten más cambios de estado en este pedido.
                  </p>
                )}
              </div>

            </div>

          </div>

          {/* AUDIT LOG TRAIL */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
              <History className="w-4 h-4 text-indigo-600" />
              Trazabilidad Automática del Pedido
            </h4>

            {(!historial || historial.length === 0) ? (
              <p className="text-xs text-slate-400 italic">No hay registros de cambios previos.</p>
            ) : (
              <div className="space-y-2 font-mono text-xs">
                {(historial || []).map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{log.estado_anterior} ➔ <span className="text-indigo-600">{log.estado_nuevo}</span></span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-sans">
                          {log.usuario_rol}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-sans mt-0.5">{log.observacion}</p>
                    </div>

                    <div className="text-right text-[10px] text-slate-400 shrink-0 font-sans">
                      <p className="font-semibold text-slate-700">{log.usuario_nombre}</p>
                      <p>{new Date(log.fecha_hora).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-all"
          >
            Cerrar Detalle
          </button>
        </div>

      </div>

      {/* PAYMENT REGISTRATION MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Registrar Abono o Pago Parcial
            </h3>

            <p className="text-xs text-slate-600">
              Registrar cobro para el pedido <strong>{pedido.numero_consecutivo}</strong>. Saldo pendiente actual: <strong className="text-amber-600">${pedido.monto_pendiente.toLocaleString()}</strong>
            </p>

            <form onSubmit={handleRegisterPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monto de Pago ($)</label>
                <input
                  type="number"
                  required
                  step="1000"
                  max={pedido.monto_pendiente}
                  placeholder={`Máximo $${pedido.monto_pendiente}`}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={registeringPayment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  {registeringPayment ? 'Procesando...' : 'Confirmar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
