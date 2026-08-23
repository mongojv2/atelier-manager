import React, { useState, useEffect } from 'react';
import { 
  Shirt, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  UserPlus, 
  Scissors, 
  Calendar, 
  ArrowRight, 
  Filter, 
  Search, 
  Activity, 
  Sparkles,
  ChevronRight,
  Send,
  MessageSquare,
  BadgeAlert
} from 'lucide-react';
import { 
  OperarioTaller, 
  Pedido, 
  RolUsuario, 
  UsuarioActual, 
  StatsTaller, 
  EtapaConfeccion, 
  EspecialidadOperario 
} from '../types';
import { api } from '../services/api';

interface TallerModuleProps {
  currentUser: UsuarioActual;
  pedidos: Pedido[];
  onRefreshPedidos: () => void;
  onSelectPedido?: (pedido: Pedido) => void;
}

const ETAPAS_CONFECCION: EtapaConfeccion[] = [
  'Patronaje y Corte',
  'Primer Ensamble',
  'Prueba de Ajuste',
  'Confección Final',
  'Planchado y Control de Calidad'
];

const ESPECIALIDADES: EspecialidadOperario[] = [
  'Maestro Sastre (Estructura)',
  'Sastre Senior (Corte y Alta Costura)',
  'Modista / Especialista en Gala',
  'Especialista en Pantalón y Vestir',
  'Artesano / Bordados y Acabados',
  'Costurera de Ensamble'
];

export const TallerModule: React.FC<TallerModuleProps> = ({
  currentUser,
  pedidos,
  onRefreshPedidos,
  onSelectPedido
}) => {
  const [operarios, setOperarios] = useState<OperarioTaller[]>([]);
  const [stats, setStats] = useState<StatsTaller | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters & Modal States
  const [search, setSearch] = useState<string>('');
  const [filterOperario, setFilterOperario] = useState<string>('Todos');
  const [filterEtapa, setFilterEtapa] = useState<string>('Todas');

  // Asignación Modal
  const [selectedPedidoForAssign, setSelectedPedidoForAssign] = useState<Pedido | null>(null);
  const [targetOperarioId, setTargetOperarioId] = useState<string>('');
  const [targetEtapa, setTargetEtapa] = useState<EtapaConfeccion>('Patronaje y Corte');
  const [notasTaller, setNotasTaller] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  // Nuevo Operario Modal
  const [showAddOperarioModal, setShowAddOperarioModal] = useState<boolean>(false);
  const [newOpNombre, setNewOpNombre] = useState<string>('');
  const [newOpEspecialidad, setNewOpEspecialidad] = useState<EspecialidadOperario>('Maestro Sastre (Estructura)');
  const [newOpCapacidad, setNewOpCapacidad] = useState<number>(3);
  const [newOpContacto, setNewOpContacto] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [opsData, statsData] = await Promise.all([
        api.getOperarios(),
        api.getStatsTaller()
      ]);
      setOperarios(opsData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Error cargando datos del taller.');
    } finally {
      setLoading(false);
    }
  };

  const handleAsignarPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPedidoForAssign || !targetOperarioId) {
      setError('Por favor selecciona un operario/sastre para la asignación.');
      return;
    }

    setIsAssigning(true);
    setError(null);
    try {
      await api.asignarPedidoTaller({
        pedido_id: selectedPedidoForAssign.id,
        operario_id: targetOperarioId,
        etapa_confeccion: targetEtapa,
        notas_taller: notasTaller,
        usuario_nombre: currentUser.nombre,
        usuario_rol: currentUser.rol
      });

      const op = operarios.find(o => o.id === targetOperarioId);
      setSuccessMsg(`Pedido ${selectedPedidoForAssign.numero_consecutivo} asignado exitosamente a ${op?.nombre || 'Sastre'}.`);
      setSelectedPedidoForAssign(null);
      setNotasTaller('');
      onRefreshPedidos();
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Error al asignar el pedido.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCreateOperario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpNombre.trim()) {
      setError('El nombre del operario/sastre es obligatorio.');
      return;
    }

    try {
      await api.createOperario({
        nombre: newOpNombre,
        especialidad: newOpEspecialidad,
        capacidad_simultanea: newOpCapacidad,
        contacto: newOpContacto,
        estado: 'Disponible',
        avatar_url: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?auto=format&fit=crop&w=200&q=80`
      });

      setSuccessMsg(`Sastre ${newOpNombre} registrado exitosamente en la nómina del taller.`);
      setShowAddOperarioModal(false);
      setNewOpNombre('');
      setNewOpContacto('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Error al crear operario.');
    }
  };

  const handleToggleEstadoOperario = async (op: OperarioTaller) => {
    const nextEstado = op.estado === 'Disponible' ? 'En Permiso' : 'Disponible';
    try {
      await api.updateOperario(op.id, { estado: nextEstado });
      setSuccessMsg(`Estado de ${op.nombre} actualizado a ${nextEstado}.`);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar operario.');
    }
  };

  // Pedidos activos en taller
  const pedidosEnTaller = (pedidos || []).filter(p => p.estado === 'En confección' || p.estado === 'Pendiente');

  const filteredPedidosEnTaller = pedidosEnTaller.filter(p => {
    const matchesSearch = 
      (p.numero_consecutivo || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.tipo_prenda || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.cliente?.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.operario_nombre || '').toLowerCase().includes(search.toLowerCase());

    const matchesOp = filterOperario === 'Todos' ? true : 
                      filterOperario === 'SinAsignar' ? !p.operario_id : p.operario_id === filterOperario;

    const matchesEtapa = filterEtapa === 'Todas' ? true : p.etapa_confeccion === filterEtapa;

    return matchesSearch && matchesOp && matchesEtapa;
  });

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-900/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/90 flex items-center justify-center border border-indigo-400/30 text-white shadow-lg shadow-indigo-600/30">
              <Scissors className="w-6 h-6 transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold font-serif tracking-tight">Control Operativo de Taller</h2>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
                  Sastres & Artesanos
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                Asignación de prendas a sastres, balanceo de carga operativa y seguimiento por etapas de confección.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(currentUser.rol === 'Administrador' || currentUser.rol === 'Diseñador / Sastre') && (
              <button
                onClick={() => setShowAddOperarioModal(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20"
              >
                <UserPlus className="w-4 h-4" />
                <span>Nuevo Operario / Sastre</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications / Error Feedback */}
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

      {/* KPI Stats Panel */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nómina de Sastres</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalOperarios}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Operarios registrados</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prendas en Taller</p>
              <h3 className="text-2xl font-bold text-indigo-600 mt-1">{stats.pedidosEnTaller}</h3>
              <p className="text-xs text-slate-500 mt-0.5">En confección activa</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Shirt className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sin Sastre Asignado</p>
              <h3 className={`text-2xl font-bold mt-1 ${stats.pedidosSinAsignar > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                {stats.pedidosSinAsignar}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Pendiente asignación</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              stats.pedidosSinAsignar > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
            }`}>
              <BadgeAlert className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pruebas Programadas</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.citasSemanaCount}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Para esta semana</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Operarios Workload Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <span>Paneles de Carga Operativa de Sastres</span>
          </h3>
          <span className="text-xs text-slate-500">Métricas de capacidad de confección en tiempo real</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {operarios.map((op) => {
            const opStat = stats?.cargaOperarios?.find(c => c.operario_id === op.id);
            const countActive = opStat?.pedidosEnConfeccionCount || 0;
            const maxCap = op.capacidad_simultanea || 3;
            const percentage = Math.min(100, Math.round((countActive / maxCap) * 100));

            let statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            if (op.estado === 'En Permiso') statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
            else if (countActive >= maxCap || op.estado === 'Saturado') statusColor = 'bg-rose-50 text-rose-700 border-rose-200';

            return (
              <div key={op.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img 
                        src={op.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} 
                        alt={op.nombre}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{op.nombre}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">{op.especialidad}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500 font-medium">Capacidad Ocupada:</span>
                      <span className="font-bold text-slate-800">{countActive} / {maxCap} Prendas</span>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          percentage >= 100 ? 'bg-rose-500' : percentage >= 66 ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                    {op.estado === 'En Permiso' ? 'En Permiso' : percentage >= 100 ? 'Cupo Completo' : op.estado}
                  </span>

                  {(currentUser.rol === 'Administrador' || currentUser.rol === 'Diseñador / Sastre') && (
                    <button
                      onClick={() => handleToggleEstadoOperario(op)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      {op.estado === 'Disponible' ? 'Marcar Permiso' : 'Disponible'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workshop Orders Table & Assignment Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-lg font-serif">
              Gestión de Confección & Etapas Operativas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Control individual de prendas en cola o en mesa de trabajo
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Buscar pedido, cliente, prenda..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-60"
              />
            </div>

            {/* Filter Operario */}
            <select
              value={filterOperario}
              onChange={(e) => setFilterOperario(e.target.value)}
              className="py-1.5 px-3 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Todos">Todos los Sastres</option>
              <option value="SinAsignar">⚠️ Sin Asignar</option>
              {operarios.map(op => (
                <option key={op.id} value={op.id}>{op.nombre}</option>
              ))}
            </select>

            {/* Filter Etapa */}
            <select
              value={filterEtapa}
              onChange={(e) => setFilterEtapa(e.target.value)}
              className="py-1.5 px-3 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Todas">Todas las Etapas</option>
              {ETAPAS_CONFECCION.map(et => (
                <option key={et} value={et}>{et}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Cargando tabla operativa de taller...
          </div>
        ) : filteredPedidosEnTaller.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Shirt className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-medium text-slate-700">No se encontraron prendas con los filtros aplicados.</p>
            <p className="text-xs text-slate-400">Intenta cambiar el término de búsqueda o el filtro de operario.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Consecutivo</th>
                  <th className="py-3 px-4">Cliente & Prenda</th>
                  <th className="py-3 px-4">Prioridad & Entrega</th>
                  <th className="py-3 px-4">Sastre Asignado</th>
                  <th className="py-3 px-4">Etapa Operativa</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredPedidosEnTaller.map((p) => {
                  const isUnassigned = !p.operario_id;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {p.numero_consecutivo}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {p.cliente ? `${p.cliente.nombre} ${p.cliente.apellido}` : 'Cliente Registrado'}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-indigo-700">{p.tipo_prenda}</span>
                          <span>•</span>
                          <span>{p.color}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            p.prioridad === 'Urgente' ? 'bg-red-50 text-red-700 border-red-200' :
                            p.prioridad === 'Alta' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {p.prioridad}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {p.fecha_estimada_entrega}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {isUnassigned ? (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg text-[11px] font-semibold">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            Sin Sastre Asignado
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                              {p.operario_nombre?.charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-800">{p.operario_nombre}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded-lg font-medium text-[11px]">
                          <Activity className="w-3.5 h-3.5 text-indigo-600" />
                          {p.etapa_confeccion || 'Patronaje y Corte'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPedidoForAssign(p);
                            setTargetOperarioId(p.operario_id || '');
                            setTargetEtapa(p.etapa_confeccion || 'Patronaje y Corte');
                            setNotasTaller(p.notas_taller || '');
                          }}
                          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition-all shadow-sm"
                        >
                          <Scissors className="w-3.5 h-3.5" />
                          <span>{isUnassigned ? 'Asignar Sastre' : 'Cambiar / Etapa'}</span>
                        </button>

                        {onSelectPedido && (
                          <button
                            onClick={() => onSelectPedido(p)}
                            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium px-2 py-1.5 rounded-lg text-xs"
                          >
                            <span>Ver Ficha</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Asignar Sastre / Cambiar Etapa Operativa */}
      {selectedPedidoForAssign && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-white transform -rotate-45" />
                </div>
                <div>
                  <h3 className="font-bold font-serif text-lg">Asignar Sastre y Etapa de Taller</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Pedido {selectedPedidoForAssign.numero_consecutivo} - {selectedPedidoForAssign.tipo_prenda}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPedidoForAssign(null)} 
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAsignarPedido} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Seleccionar Sastre / Artesano (*)
                </label>
                <select
                  value={targetOperarioId}
                  onChange={(e) => setTargetOperarioId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                >
                  <option value="">-- Seleccionar de la nómina --</option>
                  {operarios.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.nombre} - {op.especialidad} ({op.estado})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Etapa Operativa de Confección (*)
                </label>
                <select
                  value={targetEtapa}
                  onChange={(e) => setTargetEtapa(e.target.value as EtapaConfeccion)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {ETAPAS_CONFECCION.map((et) => (
                    <option key={et} value={et}>{et}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Instrucciones u Observaciones para el Taller
                </label>
                <textarea
                  rows={3}
                  value={notasTaller}
                  onChange={(e) => setNotasTaller(e.target.value)}
                  placeholder="Ej: Atención especial a entalle en sisa derecha y refuerzo de pretina..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPedidoForAssign(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAssigning ? 'Guardando Asignación...' : 'Confirmar Asignación'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Agregar Nuevo Operario */}
      {showAddOperarioModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold font-serif text-base">Registrar Nuevo Sastre / Artesano</h3>
              </div>
              <button onClick={() => setShowAddOperarioModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOperario} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre Completo del Operario (*)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Manuel Beltrán"
                  value={newOpNombre}
                  onChange={(e) => setNewOpNombre(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Especialidad de Confección
                </label>
                <select
                  value={newOpEspecialidad}
                  onChange={(e) => setNewOpEspecialidad(e.target.value as EspecialidadOperario)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                >
                  {ESPECIALIDADES.map((esp) => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Capacidad Máxima Simultánea (Prendas)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={newOpCapacidad}
                  onChange={(e) => setNewOpCapacidad(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Teléfono / Contacto
                </label>
                <input
                  type="text"
                  placeholder="+57 300 000 0000"
                  value={newOpContacto}
                  onChange={(e) => setNewOpContacto(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddOperarioModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Guardar Operario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
