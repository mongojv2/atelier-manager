import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, Search, Calendar, User, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { PedidoHistorialEstado } from '../types';
import { api } from '../services/api';

export const AuditLogsModule: React.FC = () => {
  const [logs, setLogs] = useState<PedidoHistorialEstado[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getHistorialLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los registros de auditoría');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = (logs || []).filter(l => 
    (l.pedido_id || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.usuario_nombre || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.usuario_rol || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.estado_nuevo || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.observacion && l.observacion.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Bitácora de Auditoría y Trazabilidad
            </h2>
            <span className="text-[11px] bg-indigo-100 text-indigo-800 font-medium px-2 py-0.5 rounded border border-indigo-200">
              Historial de Cambios
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registro automático e inalterable de todos los cambios de estado en pedidos, incluyendo usuario, rol, fecha y hora exacta.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all"
        >
          <span>Actualizar Bitácora</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por usuario, rol o estado (Ej: Sastre, En confección)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          Cargando logs de auditoría...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-700 text-sm">No se encontraron eventos de auditoría</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-semibold">
                  <th className="p-3.5 pl-5">Fecha y Hora</th>
                  <th className="p-3.5">Transición de Estado</th>
                  <th className="p-3.5">Usuario y Rol</th>
                  <th className="p-3.5 pr-5">Observación / Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 pl-5 font-mono text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        {new Date(log.fecha_hora).toLocaleDateString()}
                      </div>
                      <span className="text-slate-400 text-[10px]">
                        {new Date(log.fecha_hora).toLocaleTimeString()}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{log.estado_anterior}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {log.estado_nuevo}
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{log.usuario_nombre}</p>
                      <span className="inline-block mt-0.5 text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-200">
                        {log.usuario_rol}
                      </span>
                    </td>

                    <td className="p-3.5 pr-5 text-slate-600 font-sans text-xs max-w-xs">
                      {log.observacion || 'Cambio registrado automáticamente por el sistema.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
