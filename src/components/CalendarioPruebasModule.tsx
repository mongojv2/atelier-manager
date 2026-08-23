import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  MessageSquare, 
  Send, 
  Scissors, 
  Filter, 
  Search, 
  Edit3, 
  User, 
  Shirt, 
  ChevronRight,
  CalendarCheck,
  CalendarDays
} from 'lucide-react';
import { 
  CitaPrueba, 
  Pedido, 
  UsuarioActual, 
  TipoPruebaCita, 
  EstadoCitaPrueba, 
  OperarioTaller 
} from '../types';
import { api } from '../services/api';

interface CalendarioPruebasProps {
  currentUser: UsuarioActual;
  pedidos: Pedido[];
  onRefreshPedidos: () => void;
}

const TIPOS_PRUEBA: TipoPruebaCita[] = [
  'Primera Prueba (Estructura)',
  'Segunda Prueba (Ajuste)',
  'Prueba Final (Entrega)'
];

const ESTADOS_CITA: EstadoCitaPrueba[] = [
  'Programada',
  'Confirmada',
  'Realizada',
  'Reprogramada',
  'Cancelada'
];

export const CalendarioPruebasModule: React.FC<CalendarioPruebasProps> = ({
  currentUser,
  pedidos,
  onRefreshPedidos
}) => {
  const [citas, setCitas] = useState<CitaPrueba[]>([]);
  const [operarios, setOperarios] = useState<OperarioTaller[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('Todas');
  const [tipoFilter, setTipoFilter] = useState<string>('Todos');
  const [search, setSearch] = useState<string>('');

  // Modals
  const [showNewCitaModal, setShowNewCitaModal] = useState<boolean>(false);
  const [selectedPedidoId, setSelectedPedidoId] = useState<string>('');
  const [fechaHoraInput, setFechaHoraInput] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );
  const [tipoPruebaInput, setTipoPruebaInput] = useState<TipoPruebaCita>('Primera Prueba (Estructura)');
  const [sastreInput, setSastreInput] = useState<string>('');
  const [obsAjusteInput, setObsAjusteInput] = useState<string>('');
  const [notificarClienteCheck, setNotificarClienteCheck] = useState<boolean>(true);

  // Edit / Log Adjustment Modal
  const [editingCita, setEditingCita] = useState<CitaPrueba | null>(null);
  const [editEstado, setEditEstado] = useState<EstadoCitaPrueba>('Realizada');
  const [editObsAjuste, setEditObsAjuste] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [citasData, opsData] = await Promise.all([
        api.getCitasPruebas(),
        api.getOperarios()
      ]);
      setCitas(citasData);
      setOperarios(opsData);
    } catch (err: any) {
      setError(err.message || 'Error cargando agenda de pruebas.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPedidoId || !fechaHoraInput) {
      setError('Por favor selecciona un pedido y la fecha/hora de la prueba.');
      return;
    }

    try {
      await api.createCitaPrueba({
        pedido_id: selectedPedidoId,
        fecha_hora: fechaHoraInput,
        tipo_prueba: tipoPruebaInput,
        sastre_atendio_id: sastreInput || undefined,
        observaciones_ajuste: obsAjusteInput,
        usuario_nombre: currentUser.nombre,
        usuario_rol: currentUser.rol,
        notificar_cliente: notificarClienteCheck
      });

      setSuccessMsg('Cita para prueba de ajuste agendada correctamente.');
      setShowNewCitaModal(false);
      resetForm();
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Error agendando la cita.');
    }
  };

  const handleUpdateCitaStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCita) return;

    try {
      await api.updateCitaPrueba(editingCita.id, {
        estado: editEstado,
        observaciones_ajuste: editObsAjuste,
        usuario_nombre: currentUser.nombre
      });

      setSuccessMsg(`Cita de ${editingCita.cliente_nombre} actualizada a "${editEstado}".`);
      setEditingCita(null);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Error actualizando la cita.');
    }
  };

  const handleNotificarWhatsApp = async (cita: CitaPrueba) => {
    try {
      const msg = `Estimado/a ${cita.cliente_nombre}, le confirmamos su cita de ${cita.tipo_prueba} para el pedido ${cita.numero_consecutivo_pedido} el día ${new Date(cita.fecha_hora).toLocaleString()} en Atelier Manager.`;
      await api.enviarNotificacionCliente({
        cliente_id: cita.cliente_id,
        pedido_id: cita.pedido_id,
        cita_id: cita.id,
        canal: 'WhatsApp',
        evento: 'Aviso Cita Prueba',
        mensaje: msg,
        usuario_nombre: currentUser.nombre
      });

      setSuccessMsg(`Notificación de prueba enviada a ${cita.cliente_nombre} por WhatsApp.`);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Error enviando aviso al cliente.');
    }
  };

  const resetForm = () => {
    setSelectedPedidoId('');
    setObsAjusteInput('');
    setSastreInput('');
    setNotificarClienteCheck(true);
  };

  // Filtered citas
  const filteredCitas = citas.filter((c) => {
    const matchesSearch = 
      (c.cliente_nombre || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.numero_consecutivo_pedido || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.sastre_atendio_nombre || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'Todas' ? true : c.estado === statusFilter;
    const matchesTipo = tipoFilter === 'Todos' ? true : c.tipo_prueba === tipoFilter;

    return matchesSearch && matchesStatus && matchesTipo;
  });

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-900/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/90 flex items-center justify-center border border-indigo-400/30 text-white shadow-lg shadow-indigo-600/30">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold font-serif tracking-tight">Agenda & Pruebas de Ajuste</h2>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
                  Pruebas con Cliente
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                Programación de citas para prueba de prendas, registro de observaciones técnicas y recordatorios.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewCitaModal(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Agendar Cita de Prueba</span>
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

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm font-serif">Citas Programadas de la Agenda</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Buscar por cliente, pedido..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44 sm:w-56"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Todas">Todos los Estados</option>
            {ESTADOS_CITA.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          {/* Tipo Filter */}
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Todos">Todos los Tipos de Prueba</option>
            {TIPOS_PRUEBA.map(tp => (
              <option key={tp} value={tp}>{tp}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointments Cards / Timeline List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">
          Cargando agenda de pruebas...
        </div>
      ) : filteredCitas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-medium text-slate-700">No hay citas registradas en la agenda con estos filtros.</p>
          <p className="text-xs text-slate-400">Agenda una cita para la primera o segunda prueba de ajuste con un cliente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCitas.map((cita) => {
            let statusBadge = 'bg-indigo-50 text-indigo-700 border-indigo-200';
            if (cita.estado === 'Confirmada') statusBadge = 'bg-blue-50 text-blue-700 border-blue-200';
            else if (cita.estado === 'Realizada') statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            else if (cita.estado === 'Reprogramada') statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
            else if (cita.estado === 'Cancelada') statusBadge = 'bg-rose-50 text-rose-700 border-rose-200';

            const fechaObj = new Date(cita.fecha_hora);
            const fechaFormateada = isNaN(fechaObj.getTime()) ? cita.fecha_hora : fechaObj.toLocaleDateString('es-CO', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
            const horaFormateada = isNaN(fechaObj.getTime()) ? '' : fechaObj.toLocaleTimeString('es-CO', {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div key={cita.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        {cita.numero_consecutivo_pedido}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base font-serif mt-0.5">
                        {cita.cliente_nombre}
                      </h4>
                    </div>
                    <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${statusBadge}`}>
                      {cita.estado}
                    </span>
                  </div>

                  {/* Date & Time Highlight */}
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span className="capitalize">{fechaFormateada}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{horaFormateada}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-3 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Shirt className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800">{cita.tipo_prueba}</span>
                    </div>

                    {cita.sastre_atendio_nombre && (
                      <div className="flex items-center gap-2">
                        <Scissors className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sastre: <strong className="text-slate-800">{cita.sastre_atendio_nombre}</strong></span>
                      </div>
                    )}

                    {cita.observaciones_ajuste && (
                      <div className="p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 italic">
                        <strong>Anotación Técnica:</strong> "{cita.observaciones_ajuste}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleNotificarWhatsApp(cita)}
                    className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 font-semibold px-2.5 py-1.5 rounded-xl text-xs transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Avisar WhatsApp</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingCita(cita);
                      setEditEstado(cita.estado);
                      setEditObsAjuste(cita.observaciones_ajuste || '');
                    }}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold px-2.5 py-1.5 rounded-xl text-xs hover:bg-indigo-50 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Registrar Ajustes</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Agendar Nueva Cita */}
      {showNewCitaModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold font-serif text-lg">Programar Cita para Prueba de Ajuste</h3>
              </div>
              <button onClick={() => setShowNewCitaModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCita} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Seleccionar Pedido de Cliente (*)
                </label>
                <select
                  value={selectedPedidoId}
                  onChange={(e) => setSelectedPedidoId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                >
                  <option value="">-- Seleccionar pedido activo --</option>
                  {(pedidos || []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.numero_consecutivo} - {p.cliente ? `${p.cliente.nombre} ${p.cliente.apellido}` : 'Cliente'} ({p.tipo_prenda})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Fecha y Hora (*)
                  </label>
                  <input
                    type="datetime-local"
                    value={fechaHoraInput}
                    onChange={(e) => setFechaHoraInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tipo de Prueba
                  </label>
                  <select
                    value={tipoPruebaInput}
                    onChange={(e) => setTipoPruebaInput(e.target.value as TipoPruebaCita)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {TIPOS_PRUEBA.map(tp => (
                      <option key={tp} value={tp}>{tp}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sastre que Atenderá la Prueba
                </label>
                <select
                  value={sastreInput}
                  onChange={(e) => setSastreInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Usar Sastre Asignado al Pedido</option>
                  {operarios.map(op => (
                    <option key={op.id} value={op.id}>{op.nombre} - {op.especialidad}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Notas de Preparación de la Cita
                </label>
                <textarea
                  rows={2}
                  value={obsAjusteInput}
                  onChange={(e) => setObsAjusteInput(e.target.value)}
                  placeholder="Ej: Tener listos los alfileres y cinta métrica para entalle de talle..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <input
                  type="checkbox"
                  id="notifCheck"
                  checked={notificarClienteCheck}
                  onChange={(e) => setNotificarClienteCheck(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="notifCheck" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Enviar aviso automático al cliente por WhatsApp / SMS al agendar
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewCitaModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Confirmar y Agendar Cita</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Estado de Cita / Registrar Ajustes */}
      {editingCita && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-bold font-serif text-base">Registrar Ajustes de la Prueba</h3>
                <p className="text-xs text-slate-400 font-mono">{editingCita.cliente_nombre} - {editingCita.numero_consecutivo_pedido}</p>
              </div>
              <button onClick={() => setEditingCita(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCitaStatus} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estado de la Cita
                </label>
                <select
                  value={editEstado}
                  onChange={(e) => setEditEstado(e.target.value as EstadoCitaPrueba)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {ESTADOS_CITA.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Anotaciones Técnicas de Ajustes Solicitados
                </label>
                <textarea
                  rows={4}
                  value={editObsAjuste}
                  onChange={(e) => setEditObsAjuste(e.target.value)}
                  placeholder="Ej: Entallar 1.5cm en costado derecho, recoger dobladillo 2cm..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCita(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Guardar Ajustes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
