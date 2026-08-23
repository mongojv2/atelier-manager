import React, { useState, useEffect } from 'react';
import { 
  Ruler, 
  X, 
  Plus, 
  History, 
  Check, 
  Calendar, 
  User, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { Cliente, MedidasCorporales, UsuarioActual } from '../types';
import { api } from '../services/api';

interface MedidasModalProps {
  cliente: Cliente;
  onClose: () => void;
  currentUser: UsuarioActual;
}

export const MedidasModal: React.FC<MedidasModalProps> = ({ cliente, onClose, currentUser }) => {
  const [medidasList, setMedidasList] = useState<MedidasCorporales[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<{
    fecha_toma: string;
    tomado_por: string;
    cuello: string;
    pecho_busto: string;
    bajo_busto: string;
    cintura: string;
    cadera: string;
    ancho_espalda: string;
    talle_frente: string;
    talle_espalda: string;
    hombros: string;
    largo_manga: string;
    contorno_brazo: string;
    largo_pantalon: string;
    largo_falda: string;
    tiro: string;
    altura_total: string;
    observaciones: string;
  }>({
    fecha_toma: new Date().toISOString().split('T')[0],
    tomado_por: currentUser.nombre,
    cuello: '',
    pecho_busto: '',
    bajo_busto: '',
    cintura: '',
    cadera: '',
    ancho_espalda: '',
    talle_frente: '',
    talle_espalda: '',
    hombros: '',
    largo_manga: '',
    contorno_brazo: '',
    largo_pantalon: '',
    largo_falda: '',
    tiro: '',
    altura_total: '',
    observaciones: ''
  });

  const [saving, setSaving] = useState<boolean>(false);

  const fetchMedidas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMedidasByCliente(cliente.id);
      setMedidasList(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las medidas del cliente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedidas();
  }, [cliente.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // RN-009: Pertenencia de medidas a cliente existente
      await api.createMedida({
        cliente_id: cliente.id,
        fecha_toma: formData.fecha_toma,
        tomado_por: formData.tomado_por || currentUser.nombre,
        cuello: formData.cuello ? Number(formData.cuello) : undefined,
        pecho_busto: formData.pecho_busto ? Number(formData.pecho_busto) : undefined,
        bajo_busto: formData.bajo_busto ? Number(formData.bajo_busto) : undefined,
        cintura: formData.cintura ? Number(formData.cintura) : undefined,
        cadera: formData.cadera ? Number(formData.cadera) : undefined,
        ancho_espalda: formData.ancho_espalda ? Number(formData.ancho_espalda) : undefined,
        talle_frente: formData.talle_frente ? Number(formData.talle_frente) : undefined,
        talle_espalda: formData.talle_espalda ? Number(formData.talle_espalda) : undefined,
        hombros: formData.hombros ? Number(formData.hombros) : undefined,
        largo_manga: formData.largo_manga ? Number(formData.largo_manga) : undefined,
        contorno_brazo: formData.contorno_brazo ? Number(formData.contorno_brazo) : undefined,
        largo_pantalon: formData.largo_pantalon ? Number(formData.largo_pantalon) : undefined,
        largo_falda: formData.largo_falda ? Number(formData.largo_falda) : undefined,
        tiro: formData.tiro ? Number(formData.tiro) : undefined,
        altura_total: formData.altura_total ? Number(formData.altura_total) : undefined,
        observaciones: formData.observaciones
      });

      setShowAddForm(false);
      await fetchMedidas();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la toma de medidas');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">
                  Historial de Medidas Corporales
                </h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded">
                  Ficha Técnica
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Cliente: <span className="font-semibold text-white">{cliente.nombre} {cliente.apellido}</span> (Doc: {cliente.documento_id})
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <History className="w-4 h-4 text-indigo-600" />
              <span>Registros en Historial: {medidasList.length}</span>
            </div>

            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-semibold transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Registrar Nueva Toma de Medidas
              </button>
            )}
          </div>

          {/* ADD MEASUREMENTS FORM */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-slate-50 border border-indigo-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-indigo-600" />
                  Formulario de Ficha de Medidas en Centímetros (cm)
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
              </div>

              {/* General Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Fecha de Toma <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_toma}
                    onChange={(e) => setFormData({ ...formData, fecha_toma: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tomado Por (Diseñador/Sastre)
                  </label>
                  <input
                    type="text"
                    value={formData.tomado_por}
                    onChange={(e) => setFormData({ ...formData, tomado_por: e.target.value })}
                    placeholder="Nombre de quien tomó las medidas"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Grid of Measurements */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  Dimensiones Corporales (Valores numéricos en cm)
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 text-[11px] font-medium mb-1">Cuello (cm)</label>
                    <input
                      type="number" step="0.5" placeholder="Ej: 38"
                      value={formData.cuello}
                      onChange={(e) => setFormData({ ...formData, cuello: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] font-medium mb-1">Pecho / Busto (cm)</label>
                    <input
                      type="number" step="0.5" placeholder="Ej: 94"
                      value={formData.pecho_busto}
                      onChange={(e) => setFormData({ ...formData, pecho_busto: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] font-medium mb-1">Bajo Busto (cm)</label>
                    <input
                      type="number" step="0.5" placeholder="Ej: 80"
                      value={formData.bajo_busto}
                      onChange={(e) => setFormData({ ...formData, bajo_busto: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] font-medium mb-1">Cintura (cm)</label>
                    <input
                      type="number" step="0.5" placeholder="Ej: 72"
                      value={formData.cintura}
                      onChange={(e) => setFormData({ ...formData, cintura: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] font-medium mb-1">Cadera (cm)</label>
                    <input
                      type="number" step="0.5" placeholder="Ej: 98"
                      value={formData.cadera}
                      onChange={(e) => setFormData({ ...formData, cadera: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] font-medium mb-1">Ancho Espalda (cm)</label>
                    <input
                      type="number" step="0.5" placeholder="Ej: 40"
                      value={formData.ancho_espalda}
                      onChange={(e) => setFormData({ ...formData, ancho_espalda: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] font-medium mb-1">Talle Frente (cm)</label>
                    <input
                      type="number" step="0.5" placeholder="Ej: 45"
                      value={formData.talle_frente}
                      onChange={(e) => setFormData({ ...formData, talle_frente: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] font-medium mb-1">Talle Espalda (cm)</label>
                    <input
                      type="number" step="0.5" placeholder="Ej: 42"
                      value={formData.talle_espalda}
                      onChange={(e) => setFormData({ ...formData, talle_espalda: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] font-medium mb-1">Hombros (cm)</label>
                    <input
                      type="number" step="0.5" placeholder="Ej: 41"
                      value={formData.hombros}
                      onChange={(e) => setFormData({ ...formData, hombros: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] font-medium mb-1">Largo Manga (cm)</label>
                    <input
                      type="number" step="0.5" placeholder="Ej: 60"
                      value={formData.largo_manga}
                      onChange={(e) => setFormData({ ...formData, largo_manga: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] font-medium mb-1">Contorno Brazo (cm)</label>
                    <input
                      type="number" step="0.5" placeholder="Ej: 30"
                      value={formData.contorno_brazo}
                      onChange={(e) => setFormData({ ...formData, contorno_brazo: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] font-medium mb-1">Largo Pantalón (cm)</label>
                    <input
                      type="number" step="0.5" placeholder="Ej: 104"
                      value={formData.largo_pantalon}
                      onChange={(e) => setFormData({ ...formData, largo_pantalon: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] font-medium mb-1">Largo Falda (cm)</label>
                    <input
                      type="number" step="0.5" placeholder="Ej: 90"
                      value={formData.largo_falda}
                      onChange={(e) => setFormData({ ...formData, largo_falda: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] font-medium mb-1">Tiro (cm)</label>
                    <input
                      type="number" step="0.5" placeholder="Ej: 28"
                      value={formData.tiro}
                      onChange={(e) => setFormData({ ...formData, tiro: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] font-medium mb-1">Estatura Total (cm)</label>
                    <input
                      type="number" step="1" placeholder="Ej: 170"
                      value={formData.altura_total}
                      onChange={(e) => setFormData({ ...formData, altura_total: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Observaciones / Notas Especiales</label>
                <textarea
                  rows={2}
                  placeholder="Detalles particulares (postura, hombros caídos, holgura deseada...)"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  {saving ? 'Guardando...' : 'Guardar Ficha de Medidas'}
                </button>
              </div>
            </form>
          )}

          {/* HISTORICAL RECORDS LIST */}
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Cargando historial de medidas corporales...
            </div>
          ) : (!medidasList || medidasList.length === 0) ? (
            <div className="py-12 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6">
              <Ruler className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 text-sm">No existen registros de medidas previos</p>
              <p className="text-xs text-slate-500 mt-1">
                Haz clic en "Registrar Nueva Toma de Medidas" para agregar la primera ficha técnica del cliente.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {(medidasList || []).map((m, idx) => (
                <div key={m.id} className="border border-slate-200 rounded-2xl p-4 bg-white hover:border-slate-300 transition-all shadow-sm">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2 mb-3 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center">
                        #{medidasList.length - idx}
                      </span>
                      <span className="font-bold text-slate-900 text-sm flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" /> {m.fecha_toma}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" /> por {m.tomado_por}
                      </span>
                    </div>

                    {idx === 0 && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        Ficha Más Reciente
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
                    {m.cuello && <div className="bg-slate-50 p-2 rounded border"><span className="text-slate-500 block text-[10px]">Cuello</span><span className="font-bold text-slate-800">{m.cuello} cm</span></div>}
                    {m.pecho_busto && <div className="bg-slate-50 p-2 rounded border"><span className="text-slate-500 block text-[10px]">Pecho/Busto</span><span className="font-bold text-slate-800">{m.pecho_busto} cm</span></div>}
                    {m.bajo_busto && <div className="bg-slate-50 p-2 rounded border"><span className="text-slate-500 block text-[10px]">Bajo Busto</span><span className="font-bold text-slate-800">{m.bajo_busto} cm</span></div>}
                    {m.cintura && <div className="bg-slate-50 p-2 rounded border"><span className="text-slate-500 block text-[10px]">Cintura</span><span className="font-bold text-slate-800">{m.cintura} cm</span></div>}
                    {m.cadera && <div className="bg-slate-50 p-2 rounded border"><span className="text-slate-500 block text-[10px]">Cadera</span><span className="font-bold text-slate-800">{m.cadera} cm</span></div>}
                    {m.ancho_espalda && <div className="bg-slate-50 p-2 rounded border"><span className="text-slate-500 block text-[10px]">Ancho Espalda</span><span className="font-bold text-slate-800">{m.ancho_espalda} cm</span></div>}
                    {m.talle_frente && <div className="bg-slate-50 p-2 rounded border"><span className="text-slate-500 block text-[10px]">Talle Frente</span><span className="font-bold text-slate-800">{m.talle_frente} cm</span></div>}
                    {m.talle_espalda && <div className="bg-slate-50 p-2 rounded border"><span className="text-slate-500 block text-[10px]">Talle Espalda</span><span className="font-bold text-slate-800">{m.talle_espalda} cm</span></div>}
                    {m.largo_manga && <div className="bg-slate-50 p-2 rounded border"><span className="text-slate-500 block text-[10px]">Largo Manga</span><span className="font-bold text-slate-800">{m.largo_manga} cm</span></div>}
                    {m.largo_pantalon && <div className="bg-slate-50 p-2 rounded border"><span className="text-slate-500 block text-[10px]">Largo Pantalón</span><span className="font-bold text-slate-800">{m.largo_pantalon} cm</span></div>}
                    {m.largo_falda && <div className="bg-slate-50 p-2 rounded border"><span className="text-slate-500 block text-[10px]">Largo Falda</span><span className="font-bold text-slate-800">{m.largo_falda} cm</span></div>}
                    {m.tiro && <div className="bg-slate-50 p-2 rounded border"><span className="text-slate-500 block text-[10px]">Tiro</span><span className="font-bold text-slate-800">{m.tiro} cm</span></div>}
                  </div>

                  {m.observaciones && (
                    <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span><strong>Notas:</strong> {m.observaciones}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-all"
          >
            Cerrar Ficha
          </button>
        </div>

      </div>
    </div>
  );
};
