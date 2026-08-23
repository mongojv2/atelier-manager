import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Filter, 
  Layers, 
  BookOpen, 
  History, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  DollarSign, 
  Edit3, 
  Building2, 
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Box,
  RefreshCw
} from 'lucide-react';
import { 
  MaterialInsumo, 
  CategoriaMaterial, 
  UnidadMedidaMaterial, 
  ListaMaterialesDiseno, 
  MovimientoInventario, 
  StatsInventario, 
  Diseno, 
  UsuarioActual 
} from '../types';
import { api } from '../services/api';

interface InventarioModuleProps {
  currentUser: UsuarioActual;
  onStockAlertCountChange?: (count: number) => void;
}

export function InventarioModule({ currentUser, onStockAlertCountChange }: InventarioModuleProps) {
  const [activeTab, setActiveTab] = useState<'stock' | 'bom' | 'movimientos' | 'alertas'>('stock');
  
  // Data States
  const [materiales, setMateriales] = useState<MaterialInsumo[]>([]);
  const [disenos, setDisenos] = useState<Diseno[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [stats, setStats] = useState<StatsInventario | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters for Stock
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('Todas');
  const [selectedEstado, setSelectedEstado] = useState<string>('Todos');

  // Modals State
  const [showCreateMaterialModal, setShowCreateMaterialModal] = useState<boolean>(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialInsumo | null>(null);
  
  const [showMovimientoModal, setShowMovimientoModal] = useState<boolean>(false);
  const [selectedMaterialForMov, setSelectedMaterialForMov] = useState<MaterialInsumo | null>(null);

  // Form State: Create/Edit Material
  const [materialForm, setMaterialForm] = useState({
    nombre: '',
    categoria: 'Telas y Linos' as CategoriaMaterial,
    unidad_medida: 'Metros' as UnidadMedidaMaterial,
    stock_actual: 0,
    stock_minimo: 5,
    costo_unitario: 0,
    ubicacion_bodega: 'Estante A-1',
    proveedor_habitual: ''
  });

  // Form State: Quick Stock Movement (Entry/Adjustment)
  const [movimientoForm, setMovimientoForm] = useState({
    material_id: '',
    tipo_movimiento: 'Entrada (Compra/Proveedor)' as const,
    cantidad: 1,
    motivo_observacion: ''
  });

  // BOM Recipe View State
  const [selectedDisenoId, setSelectedDisenoId] = useState<string>('');
  const [bomItems, setBomItems] = useState<ListaMaterialesDiseno[]>([]);
  const [loadingBOM, setLoadingBOM] = useState<boolean>(false);
  const [showAddBOMItem, setShowAddBOMItem] = useState<boolean>(false);
  const [newBOMItem, setNewBOMItem] = useState({
    material_id: '',
    cantidad_requerida: 1,
    notas: ''
  });

  // RBAC Permission Check
  const canManageInventory = currentUser.rol === 'Administrador' || currentUser.rol === 'Bodega / Inventario';

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [matData, disData, movData, statsData] = await Promise.all([
        api.getMateriales(),
        api.getDisenos(),
        api.getMovimientosInventario(),
        api.getStatsInventario()
      ]);
      
      const safeMat = Array.isArray(matData) ? matData : [];
      const safeDis = Array.isArray(disData) ? disData : [];
      const safeMov = Array.isArray(movData) ? movData : [];

      setMateriales(safeMat);
      setDisenos(safeDis);
      setMovimientos(safeMov);
      setStats(statsData || null);

      if (safeDis.length > 0 && !selectedDisenoId) {
        setSelectedDisenoId(safeDis[0].id);
      }

      // Notify parent about stock alert count
      const alertsCount = safeMat.filter(m => m.estado === 'Stock Bajo' || m.estado === 'Agotado').length;
      if (onStockAlertCountChange) {
        onStockAlertCountChange(alertsCount);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos de bodega e inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDisenoId) {
      fetchBOM(selectedDisenoId);
    }
  }, [selectedDisenoId]);

  const fetchBOM = async (disenoId: string) => {
    try {
      setLoadingBOM(true);
      const data = await api.getBOMByDiseno(disenoId);
      setBomItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setBomItems([]);
      console.error('Error fetching BOM:', err);
    } finally {
      setLoadingBOM(false);
    }
  };

  // Toast Helper
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Filtered Materials list
  const filteredMateriales = (materiales || []).filter(mat => {
    const matchesSearch = (mat.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (mat.codigo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (mat.proveedor_habitual && mat.proveedor_habitual.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (mat.ubicacion_bodega || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategoria === 'Todas' || mat.categoria === selectedCategoria;
    
    let matchesEstado = true;
    if (selectedEstado === 'Stock Bajo') matchesEstado = mat.estado === 'Stock Bajo';
    else if (selectedEstado === 'Agotado') matchesEstado = mat.estado === 'Agotado';
    else if (selectedEstado === 'Disponible') matchesEstado = mat.estado === 'Disponible';

    return matchesSearch && matchesCategory && matchesEstado;
  });

  const alertMateriales = (materiales || []).filter(m => m.estado === 'Stock Bajo' || m.estado === 'Agotado');

  // Modal Handlers
  const openCreateMaterialModal = () => {
    setEditingMaterial(null);
    setMaterialForm({
      nombre: '',
      categoria: 'Telas y Linos',
      unidad_medida: 'Metros',
      stock_actual: 0,
      stock_minimo: 5,
      costo_unitario: 10000,
      ubicacion_bodega: 'Estante A-1',
      proveedor_habitual: ''
    });
    setShowCreateMaterialModal(true);
  };

  const openEditMaterialModal = (mat: MaterialInsumo) => {
    setEditingMaterial(mat);
    setMaterialForm({
      nombre: mat.nombre,
      categoria: mat.categoria,
      unidad_medida: mat.unidad_medida,
      stock_actual: mat.stock_actual,
      stock_minimo: mat.stock_minimo,
      costo_unitario: mat.costo_unitario,
      ubicacion_bodega: mat.ubicacion_bodega,
      proveedor_habitual: mat.proveedor_habitual || ''
    });
    setShowCreateMaterialModal(true);
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageInventory) {
      setError('Solo el personal de Bodega / Inventario o Administradores pueden guardar materiales.');
      return;
    }

    try {
      setError(null);
      if (editingMaterial) {
        const updated = await api.updateMaterial(editingMaterial.id, materialForm);
        showSuccess(`Material "${updated.nombre}" actualizado correctamente.`);
      } else {
        const created = await api.createMaterial(materialForm);
        showSuccess(`Nuevo material "${created.nombre}" (${created.codigo}) registrado exitosamente.`);
      }
      setShowCreateMaterialModal(false);
      fetchInitialData();
    } catch (err: any) {
      setError(err.message || 'Error al guardar material.');
    }
  };

  const openQuickEntryModal = (mat?: MaterialInsumo) => {
    const targetMat = mat || materiales[0];
    if (targetMat) {
      setSelectedMaterialForMov(targetMat);
      setMovimientoForm({
        material_id: targetMat.id,
        tipo_movimiento: 'Entrada (Compra/Proveedor)',
        cantidad: Math.max(1, targetMat.stock_minimo * 2 - targetMat.stock_actual),
        motivo_observacion: `Reabastecimiento por pedido a proveedor ${targetMat.proveedor_habitual ? '(' + targetMat.proveedor_habitual + ')' : ''}`
      });
      setShowMovimientoModal(true);
    }
  };

  const handleSaveMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageInventory) {
      setError('No tiene permisos de bodega para registrar movimientos de insumos.');
      return;
    }

    try {
      setError(null);
      await api.registrarMovimientoInventario({
        ...movimientoForm,
        usuario_nombre: `${currentUser.nombre} (${currentUser.rol})`
      });
      showSuccess('Movimiento de bodega registrado con éxito y stock actualizado.');
      setShowMovimientoModal(false);
      fetchInitialData();
    } catch (err: any) {
      setError(err.message || 'Error al registrar movimiento.');
    }
  };

  // BOM Handlers
  const handleAddBOMItem = async () => {
    if (!newBOMItem.material_id) return;
    try {
      setError(null);
      const existingItems = (bomItems || []).map(b => ({
        material_id: b.material_id,
        cantidad_requerida: b.cantidad_requerida,
        notas: b.notas
      }));

      // Check if already in list
      const idx = existingItems.findIndex(i => i.material_id === newBOMItem.material_id);
      if (idx !== -1) {
        existingItems[idx].cantidad_requerida += Number(newBOMItem.cantidad_requerida);
      } else {
        existingItems.push({
          material_id: newBOMItem.material_id,
          cantidad_requerida: Number(newBOMItem.cantidad_requerida),
          notas: newBOMItem.notas
        });
      }

      await api.saveBOMDiseno(selectedDisenoId, existingItems);
      showSuccess('Receta de insumos para la prenda actualizada.');
      setShowAddBOMItem(false);
      setNewBOMItem({ material_id: '', cantidad_requerida: 1, notas: '' });
      fetchBOM(selectedDisenoId);
    } catch (err: any) {
      setError(err.message || 'Error al guardar elemento en la receta.');
    }
  };

  const handleRemoveBOMItem = async (materialId: string) => {
    try {
      setError(null);
      const updatedItems = (bomItems || [])
        .filter(b => b.material_id !== materialId)
        .map(b => ({
          material_id: b.material_id,
          cantidad_requerida: b.cantidad_requerida,
          notas: b.notas
        }));

      await api.saveBOMDiseno(selectedDisenoId, updatedItems);
      showSuccess('Insumo removido de la receta.');
      fetchBOM(selectedDisenoId);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar insumo de la receta.');
    }
  };

  // Calculate estimated material cost for selected design
  const totalBOMCost = (bomItems || []).reduce((acc, item) => {
    const costUnit = item.material ? item.material.costo_unitario : 0;
    return acc + (costUnit * item.cantidad_requerida);
  }, 0);

  const selectedDisenoObj = (disenos || []).find(d => d.id === selectedDisenoId);

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight font-serif">
              Control de Inventario y Bodega
            </h2>
            <span className="text-[11px] bg-purple-100 text-purple-800 font-medium px-2 py-0.5 rounded border border-purple-200">
              Almacén & Compras
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de insumos, telas, compras, recetas de materiales por prenda y trazabilidad de movimientos.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          {canManageInventory && (
            <>
              <button
                onClick={() => openQuickEntryModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Truck className="w-4 h-4" />
                <span>Entrada / Compra</span>
              </button>
              
              <button
                onClick={openCreateMaterialModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Material</span>
              </button>
            </>
          )}

          <button
            onClick={fetchInitialData}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-all"
            title="Actualizar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Notificación del Sistema:</p>
            <p className="mt-0.5 whitespace-pre-line">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 text-sm font-bold">×</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Stats Summary Panel */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Insumos Registrados</span>
              <Box className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xl font-extrabold text-slate-900 mt-2">{stats.totalMateriales}</p>
            <p className="text-[11px] text-slate-400 mt-1">Materiales en catálogo</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-700 font-medium">Alertas Stock Bajo</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xl font-extrabold text-amber-600 mt-2">{stats.materialesStockBajo}</p>
            <p className="text-[11px] text-slate-400 mt-1">Requieren reabastecimiento</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-red-700 font-medium">Insumos Agotados</span>
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-xl font-extrabold text-red-600 mt-2">{stats.materialesAgotados}</p>
            <p className="text-[11px] text-slate-400 mt-1">Bloquean confección (RN-008)</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Valorización de Bodega</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-extrabold text-emerald-700 mt-2">
              ${stats.valorTotalInventario.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Valor total en existencias</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-sm gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'stock'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Stock de Materiales ({materiales.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bom')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'bom'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Recetas de Insumos por Prenda</span>
        </button>

        <button
          onClick={() => setActiveTab('movimientos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'movimientos'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Movimientos y Trazabilidad</span>
        </button>

        <button
          onClick={() => setActiveTab('alertas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all relative whitespace-nowrap ${
            activeTab === 'alertas'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Alertas de Bodega</span>
          {alertMateriales.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {alertMateriales.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: STOCK DE MATERIALES */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por código, nombre, ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500 font-semibold">Categoría:</span>
                <select
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                  className="text-xs border border-slate-200 rounded-xl p-2 bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="Todas">Todas las categorías</option>
                  <option value="Telas y Linos">Telas y Linos</option>
                  <option value="Forros y Entretelas">Forros y Entretelas</option>
                  <option value="Cierres y Herrajes">Cierres y Herrajes</option>
                  <option value="Botones y Adornos">Botones y Adornos</option>
                  <option value="Hilos y Mercadería">Hilos y Mercadería</option>
                  <option value="Empaque y Presentación">Empaque y Presentación</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold">Estado:</span>
                <select
                  value={selectedEstado}
                  onChange={(e) => setSelectedEstado(e.target.value)}
                  className="text-xs border border-slate-200 rounded-xl p-2 bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="Todos">Todos los estados</option>
                  <option value="Disponible">Disponible</option>
                  <option value="Stock Bajo">Stock Bajo</option>
                  <option value="Agotado">Agotado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-xs">Cargando catálogo de insumos...</div>
            ) : filteredMateriales.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No se encontraron materiales con los filtros aplicados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-3.5 pl-5">Código / Insumo</th>
                      <th className="p-3.5">Categoría</th>
                      <th className="p-3.5">Existencia en Bodega</th>
                      <th className="p-3.5">Ubicación</th>
                      <th className="p-3.5">Costo Unitario</th>
                      <th className="p-3.5">Estado</th>
                      <th className="p-3.5 pr-5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMateriales.map((mat) => (
                      <tr key={mat.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 pl-5">
                          <div className="font-bold text-slate-900">{mat.nombre}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{mat.codigo} • Prov: {mat.proveedor_habitual || 'N/A'}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {mat.categoria}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 text-sm">
                            {mat.stock_actual} <span className="text-xs font-normal text-slate-500">{mat.unidad_medida}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Mínimo requerido: {mat.stock_minimo} {mat.unidad_medida}</div>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-600">
                          {mat.ubicacion_bodega}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          ${mat.costo_unitario.toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          {mat.estado === 'Disponible' && (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Disponible
                            </span>
                          )}
                          {mat.estado === 'Stock Bajo' && (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-600" /> Stock Bajo
                            </span>
                          )}
                          {mat.estado === 'Agotado' && (
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">
                              <XCircle className="w-3 h-3 text-red-600" /> Agotado
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 pr-5 text-right space-x-1">
                          {canManageInventory && (
                            <>
                              <button
                                onClick={() => openQuickEntryModal(mat)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-[11px] transition-all"
                                title="Ingresar o ajustar existencias"
                              >
                                + Stock
                              </button>
                              <button
                                onClick={() => openEditMaterialModal(mat)}
                                className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                title="Editar detalles"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RECETAS DE INSUMOS POR PRENDA (BOM) */}
      {activeTab === 'bom' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Design Selector Column */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              Seleccionar Diseño de Prenda
            </h3>
            <p className="text-xs text-slate-500">
              Elija una prenda del catálogo para ver o configurar su receta exacta de insumos.
            </p>

            <div className="space-y-2 mt-2">
              {(disenos || []).map((dis) => (
                <button
                  key={dis.id}
                  onClick={() => setSelectedDisenoId(dis.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                    selectedDisenoId === dis.id
                      ? 'border-purple-600 bg-purple-50/60 font-bold text-purple-950 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <span className="font-mono text-[10px] text-purple-600 block">{dis.codigo}</span>
                    <span className="font-bold block text-slate-900">{dis.nombre}</span>
                    <span className="text-[10px] text-slate-400">{dis.categoria}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">${dis.precio_base.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* BOM Details Panel */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            {selectedDisenoObj ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                  <div>
                    <span className="font-mono text-xs text-purple-600 font-bold">{selectedDisenoObj.codigo}</span>
                    <h3 className="text-lg font-bold text-slate-900 font-serif">{selectedDisenoObj.nombre}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedDisenoObj.descripcion}</p>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-right">
                    <span className="text-[10px] font-bold text-purple-700 uppercase block">Costo Est. Insumos/Prenda</span>
                    <span className="text-base font-extrabold text-purple-900">${totalBOMCost.toLocaleString()}</span>
                  </div>
                </div>

                {/* BOM Items Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      Lista de Insumos Requeridos por Unidad
                    </h4>
                    {canManageInventory && (
                      <button
                        onClick={() => setShowAddBOMItem(true)}
                        className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-800"
                      >
                        <Plus className="w-3.5 h-3.5" /> Agregar Insumo a Receta
                      </button>
                    )}
                  </div>

                  {loadingBOM ? (
                    <div className="p-6 text-center text-xs text-slate-400">Cargando receta...</div>
                  ) : bomItems.length === 0 ? (
                    <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                      No hay insumos registrados para esta prenda. Haga clic en "+ Agregar Insumo" para configurar la receta.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          <tr>
                            <th className="p-3">Material / Insumo</th>
                            <th className="p-3">Cantidad por Prenda</th>
                            <th className="p-3">Stock Actual Bodega</th>
                            <th className="p-3">Costo Est.</th>
                            <th className="p-3 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(bomItems || []).map((item) => {
                            const mat = item.material;
                            const isStockSufficient = mat ? mat.stock_actual >= item.cantidad_requerida : false;
                            
                            return (
                              <tr key={item.id} className="hover:bg-slate-50">
                                <td className="p-3">
                                  <span className="font-bold text-slate-900 block">{mat ? mat.nombre : 'Insumo'}</span>
                                  <span className="text-[10px] text-slate-400">{item.notas || (mat ? mat.categoria : '')}</span>
                                </td>
                                <td className="p-3 font-bold text-slate-900">
                                  {item.cantidad_requerida} {mat ? mat.unidad_medida : ''}
                                </td>
                                <td className="p-3">
                                  <span className={`font-semibold ${isStockSufficient ? 'text-emerald-600' : 'text-red-600 font-bold'}`}>
                                    {mat ? mat.stock_actual : 0} {mat ? mat.unidad_medida : ''}
                                  </span>
                                  {!isStockSufficient && (
                                    <span className="block text-[10px] text-red-500 font-bold">Insumo Insuficiente</span>
                                  )}
                                </td>
                                <td className="p-3 font-mono font-bold text-slate-800">
                                  ${((mat ? mat.costo_unitario : 0) * item.cantidad_requerida).toLocaleString()}
                                </td>
                                <td className="p-3 text-right">
                                  {canManageInventory && (
                                    <button
                                      onClick={() => handleRemoveBOMItem(item.material_id)}
                                      className="text-red-500 hover:text-red-700 font-bold text-xs"
                                    >
                                      Quitar
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

                {/* Inline Form to add item to BOM */}
                {showAddBOMItem && (
                  <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl space-y-3">
                    <h5 className="font-bold text-purple-900 text-xs">Añadir Insumo a la Receta de la Prenda</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Insumo / Material</label>
                        <select
                          value={newBOMItem.material_id}
                          onChange={(e) => setNewBOMItem({ ...newBOMItem, material_id: e.target.value })}
                          className="w-full text-xs p-2 border border-slate-300 rounded-xl bg-white outline-none"
                        >
                          <option value="">-- Seleccionar insumo --</option>
                          {(materiales || []).map(m => (
                            <option key={m.id} value={m.id}>
                              {m.nombre} ({m.unidad_medida}) - Available: {m.stock_actual}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Cantidad x Prenda</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={newBOMItem.cantidad_requerida}
                          onChange={(e) => setNewBOMItem({ ...newBOMItem, cantidad_requerida: parseFloat(e.target.value) || 0 })}
                          className="w-full text-xs p-2 border border-slate-300 rounded-xl bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Nota / Instrucción</label>
                        <input
                          type="text"
                          placeholder="Ej: Consumo en mangas"
                          value={newBOMItem.notas}
                          onChange={(e) => setNewBOMItem({ ...newBOMItem, notas: e.target.value })}
                          className="w-full text-xs p-2 border border-slate-300 rounded-xl bg-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setShowAddBOMItem(false)}
                        className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs text-slate-600 font-semibold"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleAddBOMItem}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold"
                      >
                        Guardar Insumo
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">Seleccione un diseño a la izquierda.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MOVIMIENTOS & TRAZABILIDAD DE BODEGA */}
      {activeTab === 'movimientos' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-purple-600" />
                Bitácora de Entradas y Salidas de Almacén
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Registro inalterable de ingresos de proveedores, mermas y descuentos automáticos por confección.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3.5 pl-5">Fecha y Hora</th>
                  <th className="p-3.5">Material</th>
                  <th className="p-3.5">Tipo de Movimiento</th>
                  <th className="p-3.5">Cantidad</th>
                  <th className="p-3.5">Stock (Antes ➔ Después)</th>
                  <th className="p-3.5 pr-5">Responsable / Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(movimientos || []).map((mov) => {
                  const isEntry = mov.tipo_movimiento.startsWith('Entrada');
                  return (
                    <tr key={mov.id} className="hover:bg-slate-50">
                      <td className="p-3.5 pl-5 text-[11px] text-slate-500 font-mono">
                        {new Date(mov.fecha_hora).toLocaleString('es-CO', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {mov.material_nombre}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${
                          isEntry ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isEntry ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {mov.tipo_movimiento}
                        </span>
                      </td>
                      <td className="p-3.5 font-extrabold text-sm">
                        {isEntry ? `+${mov.cantidad}` : `-${mov.cantidad}`}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-600">
                        {mov.stock_anterior} ➔ <strong className="text-slate-900">{mov.stock_nuevo}</strong>
                      </td>
                      <td className="p-3.5 pr-5">
                        <div className="font-semibold text-slate-800">{mov.usuario_nombre}</div>
                        <div className="text-[10px] text-slate-400">{mov.motivo_observacion}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ALERTAS DE STOCK CRÍTICO */}
      {activeTab === 'alertas' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Panel de Alertas y Reabastecimiento Crítico
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Insumos cuyo stock se encuentra agotado o por debajo del mínimo de seguridad establecido.
              </p>
            </div>
          </div>

          {alertMateriales.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-bold text-sm">¡Inventario Saludable!</p>
              <p className="text-xs">Todos los insumos en bodega cuentan con stock suficiente por encima del mínimo de seguridad.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(alertMateriales || []).map((mat) => {
                const missing = Math.max(0, mat.stock_minimo * 2 - mat.stock_actual);
                return (
                  <div key={mat.id} className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 flex flex-col justify-between space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[10px] text-slate-400 font-bold block">{mat.codigo} • {mat.categoria}</span>
                        <h4 className="font-bold text-slate-900 text-sm">{mat.nombre}</h4>
                        <p className="text-xs text-slate-500">Ubicación: {mat.ubicacion_bodega} | Proveedor: {mat.proveedor_habitual || 'No registrado'}</p>
                      </div>
                      
                      {mat.estado === 'Agotado' ? (
                        <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full">AGOTADO</span>
                      ) : (
                        <span className="bg-amber-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full">STOCK BAJO</span>
                      )}
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-amber-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Stock Actual: <strong className="text-slate-900">{mat.stock_actual} {mat.unidad_medida}</strong></span>
                        <span className="text-slate-500 block text-[10px]">Stock Mínimo: <strong className="text-slate-900">{mat.stock_minimo} {mat.unidad_medida}</strong></span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-purple-700 block">Sugerido Compra</span>
                        <span className="text-sm font-extrabold text-purple-950">+{missing} {mat.unidad_medida}</span>
                      </div>
                    </div>

                    {canManageInventory && (
                      <button
                        onClick={() => openQuickEntryModal(mat)}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Generar Orden de Entrada / Compra</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: REGISTRAR O EDITAR MATERIAL */}
      {showCreateMaterialModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                {editingMaterial ? 'Modificar Ficha de Material' : 'Registrar Nuevo Insumo en Bodega'}
              </h3>
              <button
                onClick={() => setShowCreateMaterialModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Nombre del Material e Insumo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Seda Piel de Durazno Verde Esmeralda"
                  value={materialForm.nombre}
                  onChange={(e) => setMaterialForm({ ...materialForm, nombre: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Categoría *</label>
                  <select
                    value={materialForm.categoria}
                    onChange={(e) => setMaterialForm({ ...materialForm, categoria: e.target.value as CategoriaMaterial })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white outline-none"
                  >
                    <option value="Telas y Linos">Telas y Linos</option>
                    <option value="Forros y Entretelas">Forros y Entretelas</option>
                    <option value="Cierres y Herrajes">Cierres y Herrajes</option>
                    <option value="Botones y Adornos">Botones y Adornos</option>
                    <option value="Hilos y Mercadería">Hilos y Mercadería</option>
                    <option value="Empaque y Presentación">Empaque y Presentación</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Unidad de Medida *</label>
                  <select
                    value={materialForm.unidad_medida}
                    onChange={(e) => setMaterialForm({ ...materialForm, unidad_medida: e.target.value as UnidadMedidaMaterial })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white outline-none"
                  >
                    <option value="Metros">Metros</option>
                    <option value="Yardas">Yardas</option>
                    <option value="Unidades">Unidades</option>
                    <option value="Rollos">Rollos</option>
                    <option value="Carretes">Carretes</option>
                    <option value="Paquetes">Paquetes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    min="0"
                    value={materialForm.stock_actual}
                    onChange={(e) => setMaterialForm({ ...materialForm, stock_actual: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    min="1"
                    value={materialForm.stock_minimo}
                    onChange={(e) => setMaterialForm({ ...materialForm, stock_minimo: parseFloat(e.target.value) || 1 })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Costo Unit. ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={materialForm.costo_unitario}
                    onChange={(e) => setMaterialForm({ ...materialForm, costo_unitario: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Ubicación en Bodega</label>
                  <input
                    type="text"
                    placeholder="Ej: Estante A-2, Cajón C-1"
                    value={materialForm.ubicacion_bodega}
                    onChange={(e) => setMaterialForm({ ...materialForm, ubicacion_bodega: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Proveedor Habitual</label>
                  <input
                    type="text"
                    placeholder="Ej: Textiles del Aburrá"
                    value={materialForm.proveedor_habitual}
                    onChange={(e) => setMaterialForm({ ...materialForm, proveedor_habitual: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateMaterialModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {editingMaterial ? 'Guardar Cambios' : 'Registrar Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTRAR MOVIMIENTO (ENTRADA / COMPRA / AJUSTE) */}
      {showMovimientoModal && selectedMaterialForMov && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                Registrar Movimiento de Existencia
              </h3>
              <button
                onClick={() => setShowMovimientoModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveMovimiento} className="p-6 space-y-4">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs">
                <span className="font-mono text-[10px] text-purple-700 block">{selectedMaterialForMov.codigo}</span>
                <span className="font-bold text-slate-900 block">{selectedMaterialForMov.nombre}</span>
                <span className="text-[11px] text-slate-500">
                  Existencia Actual: <strong>{selectedMaterialForMov.stock_actual} {selectedMaterialForMov.unidad_medida}</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Tipo de Movimiento *</label>
                <select
                  value={movimientoForm.tipo_movimiento}
                  onChange={(e) => setMovimientoForm({ ...movimientoForm, tipo_movimiento: e.target.value as any })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white outline-none"
                >
                  <option value="Entrada (Compra/Proveedor)">Entrada (Compra a Proveedor)</option>
                  <option value="Salida (Ajuste/Merma)">Salida (Ajuste por Merma / Daño)</option>
                  <option value="Entrada (Devolución/Cancelación)">Entrada (Devolución / Ajuste)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Cantidad ({selectedMaterialForMov.unidad_medida}) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={movimientoForm.cantidad}
                  onChange={(e) => setMovimientoForm({ ...movimientoForm, cantidad: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Motivo / Factura / Orden de Compra *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ej: Ingreso por Factura de Proveedor #10892"
                  value={movimientoForm.motivo_observacion}
                  onChange={(e) => setMovimientoForm({ ...movimientoForm, motivo_observacion: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMovimientoModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Registrar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
