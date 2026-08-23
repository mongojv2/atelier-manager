import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Users, 
  Package, 
  Scissors, 
  DollarSign, 
  Download, 
  Printer, 
  Filter, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
  Search
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  UsuarioActual, 
  ReporteFiltroFechas, 
  ReportesGerenciales, 
  StatsDashboardGerencial 
} from '../types';
import { api } from '../services/api';

interface ReportesAnaliticosModuleProps {
  currentUser: UsuarioActual;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

export const ReportesAnaliticosModule: React.FC<ReportesAnaliticosModuleProps> = ({
  currentUser
}) => {
  const [filtroRango, setFiltroRango] = useState<ReporteFiltroFechas>('Historico Total');
  const [reportesData, setReportesData] = useState<ReportesGerenciales | null>(null);
  const [dashboardStats, setDashboardStats] = useState<StatsDashboardGerencial | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTabReporte, setActiveTabReporte] = useState<'ventas' | 'pedidos' | 'cartera' | 'inventario' | 'taller'>('ventas');
  const [searchTableTerm, setSearchTableTerm] = useState('');

  useEffect(() => {
    loadAllReportData();
  }, [filtroRango]);

  const loadAllReportData = async () => {
    setLoading(true);
    try {
      const [rep, dash] = await Promise.all([
        api.getReportesGerenciales(filtroRango),
        api.getStatsDashboardGerencial()
      ]);
      setReportesData(rep);
      setDashboardStats(dash);
    } catch (err) {
      console.error('Error cargando reportes analíticos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para exportar a CSV dinámico
  const handleExportCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintCurrentReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER PRINCIPAL Y FILTRO GLOBAL */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Tablero Analítico & Reportes Gerenciales
                </h2>
                {currentUser.rol === 'Gerente' && (
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full border border-amber-200 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>Visor Gerencial (Solo Lectura)</span>
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">
                Business Intelligence para Atelier Manager • Ventas, Margen, Taller, Insumos y Cartera
              </p>
            </div>
          </div>
        </div>

        {/* CONTROLES DE RANGO Y REFRESH */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
            {(['Este Mes', 'Ultimo Trimestre', 'Año Actual', 'Historico Total'] as ReporteFiltroFechas[]).map(rango => (
              <button
                key={rango}
                onClick={() => setFiltroRango(rango)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filtroRango === rango
                    ? 'bg-white text-indigo-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {rango}
              </button>
            ))}
          </div>

          <button
            onClick={loadAllReportData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
            title="Recargar datos de reportes"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Procesando métricas y consolidando reportes gerenciales...</p>
        </div>
      ) : (
        <>
          {/* KPI CARDS (DASHBOARD GERENCIAL BI) */}
          {dashboardStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <span>Ingresos Liquidados</span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900">
                  ${(dashboardStats.ingresosTotales || 0).toLocaleString('es-CO')}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{dashboardStats.totalPedidosFacturados || 0} pedidos facturados</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <span>Margen Rentabilidad Prom.</span>
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-indigo-700">
                  {dashboardStats.rentabilidadEstimadaPorcentaje || 0}%
                </p>
                <p className="text-[11px] text-slate-500">
                  Rentabilidad sobre prendas de alta costura
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <span>Tiempo Prom. Taller</span>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {dashboardStats.tiempoPromedioConfeccionDias || 0} <span className="text-xs font-normal text-slate-400">días</span>
                </p>
                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{dashboardStats.cumplimientoFechasEntregaPorcentaje || 0}% entregas a tiempo</span>
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <span>Prenda Más Vendida</span>
                  <div className="p-2 bg-pink-50 text-pink-600 rounded-xl">
                    <Scissors className="w-4 h-4 transform -rotate-45" />
                  </div>
                </div>
                <p className="text-lg font-extrabold text-slate-900 truncate" title={dashboardStats.prendaMasVendida?.tipo_prenda || 'Alta Costura'}>
                  {dashboardStats.prendaMasVendida?.tipo_prenda || 'Alta Costura'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {dashboardStats.prendaMasVendida?.cantidad || 0} solicitudes • ${(dashboardStats.prendaMasVendida?.totalIngresos || 0).toLocaleString('es-CO')}
                </p>
              </div>

            </div>
          )}

          {/* VISUALIZACIONES GRÁFICAS RECHARTS */}
          {dashboardStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* GRÁFICO 1: VENTAS E INGRESOS MENSUALES */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    <span>Evolución de Ventas e Ingresos Mensuales ($ COP)</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Consolidado de Facturación</span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardStats.ventasPorMes || []}>
                      <XAxis dataKey="mes" stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val / 1000000}M`} tickLine={false} />
                      <Tooltip 
                        formatter={(val: any) => [`$${Number(val || 0).toLocaleString('es-CO')}`, 'Ingresos']}
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                      />
                      <Bar dataKey="monto" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* GRÁFICO 2: PRENDAS MÁS SOLICITADAS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-indigo-600" />
                    <span>Distribución de Prendas por Categoría</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Demanda en Atelier</span>
                </div>

                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardStats.topPrendas || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="cantidad"
                        nameKey="tipo"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {(dashboardStats.topPrendas || []).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: any) => [`${val} prendas`, 'Solicitudes']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}

          {/* REPORTES TABS Y TABLAS EXECUTIVAS (RF-009) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* TABS DE REPORTES */}
            <div className="border-b border-slate-200 bg-slate-50 p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 overflow-x-auto">
                {[
                  { id: 'ventas', label: '1. Reporte de Ventas', icon: DollarSign },
                  { id: 'pedidos', label: '2. Estado de Pedidos', icon: BarChart3 },
                  { id: 'cartera', label: '3. Cartera de Clientes', icon: Users },
                  { id: 'inventario', label: '4. Valor de Insumos', icon: Package },
                  { id: 'taller', label: '5. Desempeño Taller', icon: Scissors }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTabReporte(tab.id as any)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        activeTabReporte === tab.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintCurrentReport}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>

            {/* BARRA DE BÚSQUEDA DENTRO DE TABLAS */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-white">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrar reporte actual..."
                  value={searchTableTerm}
                  onChange={(e) => setSearchTableTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* CSV EXPORT BUTTON */}
              {reportesData && (
                <button
                  onClick={() => {
                    if (activeTabReporte === 'ventas') {
                      handleExportCSV('Reporte_Ventas', ['ID', 'Fecha', 'Comprobante', 'Pedido', 'Cliente', 'Prenda', 'Monto', 'MetodoPago'],
                        (reportesData.ventas?.items || []).map(i => [i.id, i.fecha, i.comprobante, i.pedido, i.cliente, i.prenda, i.monto, i.metodoPago]));
                    } else if (activeTabReporte === 'cartera') {
                      handleExportCSV('Reporte_Cartera', ['Cliente', 'Telefono', 'Pedidos', 'TotalComprado', 'TotalPagado', 'SaldoPendiente'],
                        (reportesData.carteraClientes?.items || []).map(i => [i.nombre_completo, i.telefono, i.total_pedidos, i.total_comprado, i.total_pagado, i.saldo_pendiente]));
                    } else if (activeTabReporte === 'inventario') {
                      handleExportCSV('Reporte_Inventario', ['Codigo', 'Nombre', 'Categoria', 'Stock', 'Unidad', 'CostoUnitario', 'ValorTotal'],
                        (reportesData.inventario?.items || []).map(i => [i.codigo, i.nombre, i.categoria, i.stock_actual, i.unidad, i.costo_unitario, i.valor_total_bodega]));
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Exportar Excel/CSV</span>
                </button>
              )}
            </div>

            {/* CONTENIDO TABLA REPORTE 1: VENTAS */}
            {activeTabReporte === 'ventas' && reportesData && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Total Recaudado</span>
                    <span className="font-extrabold text-emerald-700 text-base">${(reportesData.ventas?.ingresosTotales || 0).toLocaleString('es-CO')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">N° Transacciones</span>
                    <span className="font-extrabold text-slate-800 text-base">{reportesData.ventas?.totalComprobantes || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Ticket Promedio</span>
                    <span className="font-extrabold text-indigo-700 text-base">${(reportesData.ventas?.promedioTicket || 0).toLocaleString('es-CO')}</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                        <th className="p-3">Comprobante</th>
                        <th className="p-3">Pedido</th>
                        <th className="p-3">Cliente</th>
                        <th className="p-3">Prenda</th>
                        <th className="p-3">Método</th>
                        <th className="p-3 text-right">Monto</th>
                        <th className="p-3">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(reportesData.ventas?.items || [])
                        .filter(i => (i.cliente || '').toLowerCase().includes(searchTableTerm.toLowerCase()) || (i.comprobante || '').toLowerCase().includes(searchTableTerm.toLowerCase()))
                        .map(item => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-indigo-700">{item.comprobante}</td>
                            <td className="p-3 font-mono">{item.pedido}</td>
                            <td className="p-3 font-medium text-slate-900">{item.cliente}</td>
                            <td className="p-3">{item.prenda}</td>
                            <td className="p-3 text-slate-500">{item.metodoPago}</td>
                            <td className="p-3 text-right font-black text-emerald-700">+${(item.monto || 0).toLocaleString('es-CO')}</td>
                            <td className="p-3 text-slate-400 text-[11px]">{item.fecha ? new Date(item.fecha).toLocaleDateString('es-CO') : 'N/A'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CONTENIDO TABLA REPORTE 2: ESTADO DE PEDIDOS */}
            {activeTabReporte === 'pedidos' && reportesData && (
              <div className="p-4 space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                        <th className="p-3">Estado Operativo</th>
                        <th className="p-3 text-center">Cantidad Pedidos</th>
                        <th className="p-3 text-right">Valor Total Proyectado</th>
                        <th className="p-3 text-right">% Participación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(reportesData.estadosPedidos || []).map((est, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-800">{est.estado}</td>
                          <td className="p-3 text-center font-bold">{est.cantidad || 0}</td>
                          <td className="p-3 text-right font-semibold text-slate-900">${(est.valorTotal || 0).toLocaleString('es-CO')}</td>
                          <td className="p-3 text-right font-bold text-indigo-700">{est.porcentaje || 0}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CONTENIDO TABLA REPORTE 3: CARTERA DE CLIENTES */}
            {activeTabReporte === 'cartera' && reportesData && (
              <div className="p-4 space-y-4">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex justify-between items-center text-amber-900 font-bold">
                  <span>Deuda Total Pendiente por Cobrar en Cartera:</span>
                  <span className="text-lg text-amber-800 font-black">${(reportesData.carteraClientes?.totalDeudaPendiente || 0).toLocaleString('es-CO')}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                        <th className="p-3">Cliente</th>
                        <th className="p-3">Teléfono</th>
                        <th className="p-3 text-center">Pedidos</th>
                        <th className="p-3 text-right">Total Comprado</th>
                        <th className="p-3 text-right">Total Pagado</th>
                        <th className="p-3 text-right">Saldo Pendiente</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(reportesData.carteraClientes?.items || [])
                        .filter(c => (c.nombre_completo || '').toLowerCase().includes(searchTableTerm.toLowerCase()))
                        .map(item => (
                          <tr key={item.cliente_id} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-900">{item.nombre_completo}</td>
                            <td className="p-3 text-slate-500">{item.telefono}</td>
                            <td className="p-3 text-center font-semibold">{item.total_pedidos || 0}</td>
                            <td className="p-3 text-right font-semibold text-slate-700">${(item.total_comprado || 0).toLocaleString('es-CO')}</td>
                            <td className="p-3 text-right text-emerald-700 font-semibold">${(item.total_pagado || 0).toLocaleString('es-CO')}</td>
                            <td className="p-3 text-right font-black text-amber-700">
                              {(item.saldo_pendiente || 0) > 0 ? `$${(item.saldo_pendiente || 0).toLocaleString('es-CO')}` : ' AL DÍA'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CONTENIDO TABLA REPORTE 4: INVENTARIO */}
            {activeTabReporte === 'inventario' && reportesData && (
              <div className="p-4 space-y-4">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs flex justify-between items-center text-blue-900 font-bold">
                  <span>Valoración Total de Materiales en Bodega:</span>
                  <span className="text-lg text-blue-900 font-black">${(reportesData.inventario?.valorTotalBodega || 0).toLocaleString('es-CO')}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                        <th className="p-3">Código & Material</th>
                        <th className="p-3">Categoría</th>
                        <th className="p-3 text-center">Stock Actual</th>
                        <th className="p-3 text-right">Costo Unitario</th>
                        <th className="p-3 text-right">Valor Total Bodega</th>
                        <th className="p-3 text-center">Estado Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(reportesData.inventario?.items || [])
                        .filter(m => (m.nombre || '').toLowerCase().includes(searchTableTerm.toLowerCase()))
                        .map(item => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="p-3 font-medium text-slate-900">
                              <span className="font-mono text-[10px] text-indigo-700 block">{item.codigo}</span>
                              {item.nombre}
                            </td>
                            <td className="p-3 text-slate-500">{item.categoria}</td>
                            <td className="p-3 text-center font-bold text-slate-800">{item.stock_actual} {item.unidad}</td>
                            <td className="p-3 text-right font-mono">${(item.costo_unitario || 0).toLocaleString('es-CO')}</td>
                            <td className="p-3 text-right font-black text-slate-900">${(item.valor_total_bodega || 0).toLocaleString('es-CO')}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.estado_stock === 'Agotado' ? 'bg-red-100 text-red-800' :
                                item.estado_stock === 'Bajo Stock' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {item.estado_stock}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CONTENIDO TABLA REPORTE 5: TALLER */}
            {activeTabReporte === 'taller' && reportesData && (
              <div className="p-4 space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                        <th className="p-3">Sastre / Operario</th>
                        <th className="p-3">Especialidad</th>
                        <th className="p-3 text-center">En Proceso</th>
                        <th className="p-3 text-center">Prendas Terminadas</th>
                        <th className="p-3 text-center">Prendas Entregadas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(reportesData.produccionTaller || [])
                        .filter(op => (op.sastre_nombre || '').toLowerCase().includes(searchTableTerm.toLowerCase()))
                        .map(op => (
                          <tr key={op.operario_id} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-900">{op.sastre_nombre}</td>
                            <td className="p-3 text-slate-500">{op.especialidad}</td>
                            <td className="p-3 text-center font-bold text-indigo-700">{op.prendas_en_proceso || 0}</td>
                            <td className="p-3 text-center font-bold text-emerald-700">{op.prendas_terminadas || 0}</td>
                            <td className="p-3 text-center font-bold text-blue-700">{op.prendas_entregadas || 0}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
};
