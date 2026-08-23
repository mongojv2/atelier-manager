import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Plus, 
  Search, 
  Edit, 
  DollarSign, 
  Sparkles, 
  AlertCircle,
  Tag,
  Sliders,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { Diseno, CategoriaPrenda, UsuarioActual } from '../types';
import { api } from '../services/api';

interface DisenosModuleProps {
  currentUser: UsuarioActual;
}

const CATEGORIAS_LIST: CategoriaPrenda[] = [
  'Traje Masculino',
  'Vestido de Gala / Noche',
  'Camisa / Blusa',
  'Pantalón / Falda',
  'Abrigo / Chaqueta',
  'Uniforme Corporativo',
  'Atuendo Tradicional / Especial'
];

export const DisenosModule: React.FC<DisenosModuleProps> = ({ currentUser }) => {
  const [disenos, setDisenos] = useState<Diseno[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');

  // Modal State
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingDiseno, setEditingDiseno] = useState<Diseno | null>(null);

  const [formData, setFormData] = useState<{
    nombre: string;
    categoria: CategoriaPrenda;
    descripcion: string;
    genero: 'Damas' | 'Caballeros' | 'Unisex' | 'Infantil';
    precio_base: string;
    complejidad: 'Baja' | 'Media' | 'Alta';
    imagen_url: string;
  }>({
    nombre: '',
    categoria: 'Vestido de Gala / Noche',
    descripcion: '',
    genero: 'Damas',
    precio_base: '350000',
    complejidad: 'Media',
    imagen_url: ''
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchDisenos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDisenos();
      setDisenos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los diseños');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisenos();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingDiseno(null);
    setFormData({
      nombre: '',
      categoria: 'Vestido de Gala / Noche',
      descripcion: '',
      genero: 'Damas',
      precio_base: '350000',
      complejidad: 'Media',
      imagen_url: ''
    });
    setFormError(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (dis: Diseno) => {
    setEditingDiseno(dis);
    setFormData({
      nombre: dis.nombre,
      categoria: dis.categoria,
      descripcion: dis.descripcion,
      genero: dis.genero,
      precio_base: String(dis.precio_base),
      complejidad: dis.complejidad,
      imagen_url: dis.imagen_url || ''
    });
    setFormError(null);
    setShowFormModal(true);
  };

  const handleSaveDiseno = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      if (editingDiseno) {
        await api.updateDiseno(editingDiseno.id, {
          ...formData,
          precio_base: Number(formData.precio_base)
        });
      } else {
        await api.createDiseno({
          ...formData,
          precio_base: Number(formData.precio_base),
          estado: 'Activo'
        });
      }

      setShowFormModal(false);
      await fetchDisenos();
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar el diseño');
    } finally {
      setSaving(false);
    }
  };

  const filteredDisenos = (disenos || []).filter(d => {
    const matchesSearch = 
      (d.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.codigo || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.categoria || '').toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'Todas' || d.categoria === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const isReadonlyRole = currentUser.rol === 'Gerente' || currentUser.rol === 'Bodega / Inventario';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Catálogo de Diseños y Prendas
            </h2>
            <span className="text-[11px] bg-purple-100 text-purple-800 font-medium px-2 py-0.5 rounded border border-purple-200">
              Catálogo Base
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Catálogo maestro de modelos de alta costura, precios base de confección y complejidad técnica.
          </p>
        </div>

        {!isReadonlyRole && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Nuevo Diseño</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Nombre o Código (Ej: DIS-101)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-500 font-medium shrink-0">Categoría:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-medium bg-white focus:ring-2 focus:ring-purple-500"
          >
            <option value="Todas">Todas las Categorías</option>
            {CATEGORIAS_LIST.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Designs Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          Cargando catálogo de diseños...
        </div>
      ) : filteredDisenos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Palette className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-sm">No hay diseños en el catálogo</h3>
          <p className="text-xs text-slate-500 mt-1">Prueba a limpiar los filtros o agrega un modelo de prenda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredDisenos.map((dis) => (
            <div
              key={dis.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image or Placeholder */}
                <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                  {dis.imagen_url ? (
                    <img
                      src={dis.imagen_url}
                      alt={dis.nombre}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-center text-slate-400 p-4">
                      <ImageIcon className="w-10 h-10 mx-auto mb-1 opacity-50" />
                      <span className="text-[11px]">Boceto en Taller</span>
                    </div>
                  )}

                  <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {dis.codigo}
                  </span>

                  <span
                    className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      dis.complejidad === 'Alta'
                        ? 'bg-red-500 text-white'
                        : dis.complejidad === 'Media'
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-500 text-white'
                    }`}
                  >
                    Complejidad {dis.complejidad}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                      {dis.categoria}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {dis.genero}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm font-serif line-clamp-1">
                    {dis.nombre}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {dis.descripcion}
                  </p>
                </div>
              </div>

              {/* Price & Actions Footer */}
              <div className="p-4 pt-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium uppercase">Precio Base</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    ${dis.precio_base.toLocaleString()}
                  </span>
                </div>

                {!isReadonlyRole && (
                  <button
                    onClick={() => handleOpenEditModal(dis)}
                    className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 border border-slate-200 rounded-xl transition-all"
                    title="Editar diseño"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT DESIGN MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-400" />
                {editingDiseno ? 'Modificar Diseño' : 'Registrar Nuevo Diseño'}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDiseno} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre de la Prenda / Modelo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Vestido de Noche Corte Sirena"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value as CategoriaPrenda })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                  >
                    {CATEGORIAS_LIST.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Público / Género</label>
                  <select
                    value={formData.genero}
                    onChange={(e) => setFormData({ ...formData, genero: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                  >
                    <option value="Damas">Damas</option>
                    <option value="Caballeros">Caballeros</option>
                    <option value="Unisex">Unisex</option>
                    <option value="Infantil">Infantil</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Precio Base Estimado ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    step="1000"
                    placeholder="Ej: 350000"
                    value={formData.precio_base}
                    onChange={(e) => setFormData({ ...formData, precio_base: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-purple-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Complejidad de Confección</label>
                  <select
                    value={formData.complejidad}
                    onChange={(e) => setFormData({ ...formData, complejidad: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                  >
                    <option value="Baja">Baja (Patrón básico)</option>
                    <option value="Media">Media (Drapeados, forro)</option>
                    <option value="Alta">Alta (Alta costura, encajes)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">URL de Foto / Boceto Ilustrativo</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.imagen_url}
                  onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción del Diseño / Especificaciones</label>
                <textarea
                  rows={3}
                  placeholder="Corte, detalles de solapa, forros, botones recomendados..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
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
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md"
                >
                  {saving ? 'Guardando...' : editingDiseno ? 'Actualizar Diseño' : 'Guardar Diseño'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
