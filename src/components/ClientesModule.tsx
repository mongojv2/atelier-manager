import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Ruler, 
  Edit, 
  Power, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  FileText,
  Lock,
  Plus
} from 'lucide-react';
import { Cliente, UsuarioActual } from '../types';
import { api } from '../services/api';
import { MedidasModal } from './MedidasModal';

interface ClientesModuleProps {
  currentUser: UsuarioActual;
}

export const ClientesModule: React.FC<ClientesModuleProps> = ({ currentUser }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Activo' | 'Inactivo'>('Todos');

  // Selected client for measurements modal
  const [selectedClienteMedidas, setSelectedClienteMedidas] = useState<Cliente | null>(null);

  // New/Edit Client Modal
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  const [formData, setFormData] = useState<{
    documento_id: string;
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
    direccion: string;
    notas: string;
  }>({
    documento_id: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion: '',
    notas: ''
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getClientes();
      setClientes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar listado de clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCliente(null);
    setFormData({
      documento_id: '',
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
      direccion: '',
      notas: ''
    });
    setFormError(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (cli: Cliente) => {
    setEditingCliente(cli);
    setFormData({
      documento_id: cli.documento_id,
      nombre: cli.nombre,
      apellido: cli.apellido,
      telefono: cli.telefono,
      email: cli.email,
      direccion: cli.direccion,
      notas: cli.notas || ''
    });
    setFormError(null);
    setShowFormModal(true);
  };

  const handleSaveCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      if (editingCliente) {
        await api.updateCliente(editingCliente.id, formData);
      } else {
        // RNF-010 validation done on backend
        await api.createCliente({
          ...formData,
          estado: 'Activo'
        });
      }

      setShowFormModal(false);
      await fetchClientes();
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEstado = async (id: string) => {
    try {
      await api.toggleClienteEstado(id);
      await fetchClientes();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Filter clients
  const filteredClientes = (clientes || []).filter(cli => {
    const matchesSearch = 
      (cli.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
      (cli.apellido || '').toLowerCase().includes(search.toLowerCase()) ||
      (cli.documento_id || '').toLowerCase().includes(search.toLowerCase()) ||
      (cli.telefono || '').includes(search) ||
      (cli.email || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'Todos' || cli.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const isReadonlyRole = currentUser.rol === 'Gerente' || currentUser.rol === 'Bodega / Inventario';

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Gestión de Clientes
            </h2>
            <span className="text-[11px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold border border-indigo-200">
              Directorio Principal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registro, consulta, edición e historial de medidas corporales asociadas.
          </p>
        </div>

        {!isReadonlyRole && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Nuevo Cliente</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Nombre, Apellido o Documento ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-500 font-medium mr-1">Estado:</span>
          {(['Todos', 'Activo', 'Inactivo'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
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

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Clients Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          Cargando listado de clientes...
        </div>
      ) : filteredClientes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-sm">No se encontraron clientes</h3>
          <p className="text-xs text-slate-500 mt-1">Intenta cambiar los términos de búsqueda o registra un nuevo cliente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClientes.map((cli) => (
            <div
              key={cli.id}
              className={`bg-white rounded-2xl border ${
                cli.estado === 'Activo' ? 'border-slate-200 hover:border-indigo-300' : 'border-slate-200 opacity-75 bg-slate-50/70'
              } p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
            >
              <div className="space-y-3">
                
                {/* Header card info */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-tight font-serif">
                      {cli.nombre} {cli.apellido}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-mono">
                      <Lock className="w-3 h-3 text-amber-600" />
                      <span>ID: <strong className="text-slate-800">{cli.documento_id}</strong></span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      cli.estado === 'Activo'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-200 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {cli.estado === 'Activo' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Activo
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-slate-500" /> Inactivo
                      </>
                    )}
                  </span>
                </div>

                {/* Contact info list */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  {cli.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{cli.telefono}</span>
                    </div>
                  )}

                  {cli.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{cli.email}</span>
                    </div>
                  )}

                  {cli.direccion && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{cli.direccion}</span>
                    </div>
                  )}

                  {cli.notas && (
                    <div className="flex items-start gap-2 bg-slate-50 p-2 rounded-xl text-[11px] text-slate-600 border border-slate-200 mt-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{cli.notas}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedClienteMedidas(cli)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition-all"
                >
                  <Ruler className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ficha de Medidas</span>
                </button>

                {!isReadonlyRole && (
                  <>
                    <button
                      onClick={() => handleOpenEditModal(cli)}
                      title="Editar cliente"
                      className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-xl text-xs transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleToggleEstado(cli.id)}
                      title={cli.estado === 'Activo' ? 'Desactivar cliente' : 'Activar cliente'}
                      className={`p-2 rounded-xl border text-xs transition-all ${
                        cli.estado === 'Activo'
                          ? 'text-slate-500 hover:text-red-600 hover:bg-red-50 border-slate-200'
                          : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT CLIENT MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                {editingCliente ? 'Modificar Datos de Cliente' : 'Registrar Nuevo Cliente'}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCliente} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Documento ID / Cédula / DNI <span className="text-red-500">*</span>
                  <span className="text-[10px] text-slate-500 ml-2">(Identificador Único)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 1098765432"
                  value={formData.documento_id}
                  onChange={(e) => setFormData({ ...formData, documento_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Camila"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Pérez"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono Móvil</label>
                  <input
                    type="text"
                    placeholder="Ej: +57 300 123 4567"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="cliente@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dirección de Entrega / Domicilio</label>
                <input
                  type="text"
                  placeholder="Ej: Calle 10 #15-20, Apto 302"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notas / Preferencias del Cliente</label>
                <textarea
                  rows={2}
                  placeholder="Ej: Prefiere telas naturales, cliente VIP..."
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md"
                >
                  {saving ? 'Guardando...' : editingCliente ? 'Actualizar Cliente' : 'Guardar Cliente'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MEASUREMENTS MODAL */}
      {selectedClienteMedidas && (
        <MedidasModal
          cliente={selectedClienteMedidas}
          currentUser={currentUser}
          onClose={() => setSelectedClienteMedidas(null)}
        />
      )}

    </div>
  );
};
