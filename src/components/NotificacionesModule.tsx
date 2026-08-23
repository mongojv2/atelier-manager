import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  MessageSquare, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  Sparkles, 
  Clock, 
  User, 
  Shirt, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { 
  NotificacionCliente, 
  UsuarioActual, 
  CanalNotificacion, 
  TipoEventoNotificacion, 
  Cliente, 
  Pedido 
} from '../types';
import { api } from '../services/api';

interface NotificacionesModuleProps {
  currentUser: UsuarioActual;
  clientes: Cliente[];
  pedidos: Pedido[];
}

const CANALES: CanalNotificacion[] = ['WhatsApp', 'SMS', 'Correo Electrónico'];

const EVENTOS: TipoEventoNotificacion[] = [
  'Prenda Lista / Terminado',
  'Aviso Cita Prueba',
  'Recordatorio Cita',
  'Aviso Avance Taller'
];

export const NotificacionesModule: React.FC<NotificacionesModuleProps> = ({
  currentUser,
  clientes,
  pedidos
}) => {
  const [notificaciones, setNotificaciones] = useState<NotificacionCliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter
  const [canalFilter, setCanalFilter] = useState<string>('Todos');
  const [eventoFilter, setEventoFilter] = useState<string>('Todos');
  const [search, setSearch] = useState<string>('');

  // Dispatch Simulator
  const [showSimModal, setShowSimModal] = useState<boolean>(false);
  const [simClienteId, setSimClienteId] = useState<string>('');
  const [simPedidoId, setSimPedidoId] = useState<string>('');
  const [simCanal, setSimCanal] = useState<CanalNotificacion>('WhatsApp');
  const [simEvento, setSimEvento] = useState<TipoEventoNotificacion>('Prenda Lista / Terminado');
  const [simMensaje, setSimMensaje] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadNotificaciones();
  }, []);

  const loadNotificaciones = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getNotificacionesClientes();
      setNotificaciones(data);
    } catch (err: any) {
      setError(err.message || 'Error cargando historial de avisos.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate template message when inputs change in simulator
  useEffect(() => {
    if (!simClienteId) return;
    const cliente = clientes.find(c => c.id === simClienteId);
    const pedido = pedidos.find(p => p.id === simPedidoId);

    const nombreCliente = cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Estimado Cliente';
    const prenda = pedido ? pedido.tipo_prenda : 'su prenda';
    const consecutivo = pedido ? pedido.numero_consecutivo : '';

    if (simEvento === 'Prenda Lista / Terminado') {
      setSimMensaje(`¡Hola ${nombreCliente}! ✨ Le informamos que su prenda (${prenda}) del pedido ${consecutivo} ya se encuentra TERMINADA en Atelier Manager y lista para entrega/prueba final. ¡Le esperamos!`);
    } else if (simEvento === 'Aviso Cita Prueba') {
      setSimMensaje(`Estimado/a ${nombreCliente}, le saludamos de Atelier Manager. Le confirmamos su cita de prueba para ${prenda} (${consecutivo}). ¡Agradecemos su puntualidad!`);
    } else if (simEvento === 'Recordatorio Cita') {
      setSimMensaje(`Recordatorio: ${nombreCliente}, mañana tiene cita de prueba en Atelier Manager para su pedido ${consecutivo} (${prenda}). Si desea reprogramar, por favor respóndanos a este mensaje.`);
    } else if (simEvento === 'Aviso Avance Taller') {
      setSimMensaje(`¡Hola ${nombreCliente}! Su prenda ${prenda} (${consecutivo}) ha ingresado exitosamente a la etapa de confección final en nuestro taller de alta costura.`);
    }
  }, [simClienteId, simPedidoId, simEvento]);

  const handleEnviarNotificacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simClienteId || !simMensaje.trim()) {
      setError('Por favor selecciona un cliente e ingresa el contenido del mensaje.');
      return;
    }

    try {
      await api.enviarNotificacionCliente({
        cliente_id: simClienteId,
        pedido_id: simPedidoId || undefined,
        canal: simCanal,
        evento: simEvento,
        mensaje: simMensaje,
        usuario_nombre: currentUser.nombre
      });

      setSuccessMsg(`Notificación de aviso enviada correctamente vía ${simCanal}.`);
      setShowSimModal(false);
      setSimMensaje('');
      await loadNotificaciones();
    } catch (err: any) {
      setError(err.message || 'Error registrando el aviso.');
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered list
  const filteredNotifs = notificaciones.filter((n) => {
    const matchesSearch = 
      (n.cliente_nombre || '').toLowerCase().includes(search.toLowerCase()) ||
      (n.mensaje || '').toLowerCase().includes(search.toLowerCase()) ||
      (n.numero_consecutivo_pedido || '').toLowerCase().includes(search.toLowerCase());

    const matchesCanal = canalFilter === 'Todos' ? true : n.canal === canalFilter;
    const matchesEvento = eventoFilter === 'Todos' ? true : n.evento === eventoFilter;

    return matchesSearch && matchesCanal && matchesEvento;
  });

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-900/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/90 flex items-center justify-center border border-indigo-400/30 text-white shadow-lg shadow-indigo-600/30">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold font-serif tracking-tight">Centro de Avisos & Notificaciones</h2>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
                  WhatsApp & SMS Client
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                Avisos automáticos al cliente por cambios de estado de confección, citas de pruebas y confirmaciones.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowSimModal(true);
                if (clientes.length > 0) setSimClienteId(clientes[0].id);
                if (pedidos.length > 0) setSimPedidoId(pedidos[0].id);
              }}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20"
            >
              <Send className="w-4 h-4" />
              <span>Simular / Enviar Aviso Manual</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications / Feedback */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs font-bold text-red-600 hover:underline">
            Descartar
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-xs font-bold text-emerald-600 hover:underline">
            Aceptar
          </button>
        </div>
      )}

      {/* Filter Header Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm font-serif">Bitácora de Comunicaciones Enviadas</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Buscar por cliente o mensaje..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44 sm:w-56"
            />
          </div>

          {/* Canal Filter */}
          <select
            value={canalFilter}
            onChange={(e) => setCanalFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Todos">Todos los Canales</option>
            {CANALES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Evento Filter */}
          <select
            value={eventoFilter}
            onChange={(e) => setEventoFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Todos">Todos los Eventos</option>
            {EVENTOS.map(ev => (
              <option key={ev} value={ev}>{ev}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications History List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">
          Cargando historial de notificaciones...
        </div>
      ) : filteredNotifs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <Bell className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-medium text-slate-700">No hay notificaciones enviadas con los filtros seleccionados.</p>
          <p className="text-xs text-slate-400">Los avisos automáticos se generan al cambiar prendas a "Terminado" o agendar citas de pruebas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((notif) => {
            const fechaObj = new Date(notif.fecha_envio);
            const fechaStr = isNaN(fechaObj.getTime()) ? notif.fecha_envio : fechaObj.toLocaleString('es-CO');

            return (
              <div key={notif.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    notif.canal === 'WhatsApp' ? 'bg-emerald-100 text-emerald-700' :
                    notif.canal === 'SMS' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {notif.canal === 'WhatsApp' ? <MessageSquare className="w-5 h-5" /> :
                     notif.canal === 'SMS' ? <Phone className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{notif.cliente_nombre}</h4>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-mono text-indigo-700 font-semibold">{notif.numero_consecutivo_pedido || 'Pedido Atelier'}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        notif.canal === 'WhatsApp' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        notif.canal === 'SMS' ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-purple-50 text-purple-800 border-purple-200'
                      }`}>
                        {notif.canal} - {notif.evento}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 mt-1 font-sans bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      "{notif.mensaje}"
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {fechaStr}
                      </span>
                      <span>•</span>
                      <span>Enviado por: <strong>{notif.usuario_nombre}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                  <button
                    onClick={() => handleCopyText(notif.mensaje, notif.id)}
                    className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-xl text-xs transition-all"
                  >
                    {copiedId === notif.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === notif.id ? 'Copiado' : 'Copiar Texto'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Simular / Enviar Notificación Manual */}
      {showSimModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold font-serif text-lg">Simular / Despachar Notificación al Cliente</h3>
              </div>
              <button onClick={() => setShowSimModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleEnviarNotificacion} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Seleccionar Cliente (*)
                </label>
                <select
                  value={simClienteId}
                  onChange={(e) => setSimClienteId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                >
                  <option value="">-- Seleccionar cliente --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} {c.apellido} ({c.telefono})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pedido Asociado (Opcional)
                </label>
                <select
                  value={simPedidoId}
                  onChange={(e) => setSimPedidoId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Sin pedido específico</option>
                  {pedidos.map(p => (
                    <option key={p.id} value={p.id}>{p.numero_consecutivo} - {p.tipo_prenda}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Canal de Envío
                  </label>
                  <select
                    value={simCanal}
                    onChange={(e) => setSimCanal(e.target.value as CanalNotificacion)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {CANALES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tipo de Evento
                  </label>
                  <select
                    value={simEvento}
                    onChange={(e) => setSimEvento(e.target.value as TipoEventoNotificacion)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {EVENTOS.map(ev => (
                      <option key={ev} value={ev}>{ev}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contenido del Mensaje
                </label>
                <textarea
                  rows={4}
                  value={simMensaje}
                  onChange={(e) => setSimMensaje(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none font-sans"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSimModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Despachar Aviso</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
