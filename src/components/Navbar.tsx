import React from 'react';
import { 
  Scissors, 
  Users, 
  Palette, 
  ShoppingBag, 
  History, 
  ShieldCheck,
  Sparkles,
  Package,
  CalendarCheck,
  Bell,
  Receipt,
  BarChart3
} from 'lucide-react';
import { RolUsuario, UsuarioActual } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UsuarioActual;
  setCurrentUser: (user: UsuarioActual) => void;
  systemStatusOk: boolean;
  stockAlertCount?: number;
}

export const ROLES_LIST: { rol: RolUsuario; color: string; desc: string }[] = [
  { rol: 'Administrador', color: 'bg-purple-100 text-purple-800 border-purple-200', desc: 'Acceso total y configuración de todas las funciones.' },
  { rol: 'Recepción / Ventas', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', desc: 'Clientes, Medidas, Pedidos y Cobros de anticipos.' },
  { rol: 'Diseñador / Sastre', color: 'bg-amber-100 text-amber-800 border-amber-200', desc: 'Sastre: Ver pedidos, actualizar estado de confección.' },
  { rol: 'Bodega / Inventario', color: 'bg-blue-100 text-blue-800 border-blue-200', desc: 'Gestión de Telas e Insumos.' },
  { rol: 'Gerente', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', desc: 'Lectura exclusiva de reportes y estadísticas.' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  systemStatusOk,
  stockAlertCount
}) => {
  return (
    <header className="bg-slate-900 text-slate-100 shadow-md border-b border-slate-800 sticky top-0 z-40">
      {/* Top Bar: Clean Brand & System Status */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs text-slate-300 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium text-[11px]">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            Atelier Manager Enterprise
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="font-medium text-slate-300 hidden sm:inline">
            Sistema de Confección, Alta Costura & Control de Pedidos
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${systemStatusOk ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-[11px] text-slate-400 font-medium">Estado del Sistema: Operativo</span>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* App Title & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('pedidos')}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
              <Scissors className="w-5 h-5 text-indigo-100 transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-white tracking-tight leading-none font-serif">
                  Atelier Manager
                </h1>
                <span className="text-[10px] bg-indigo-900/80 text-indigo-200 border border-indigo-700/50 px-1.5 py-0.5 rounded font-mono">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sistema de Confección & Medidas
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'pedidos'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Pedidos</span>
            </button>

            <button
              onClick={() => setActiveTab('clientes')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'clientes'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Clientes & Medidas</span>
            </button>

            <button
              onClick={() => setActiveTab('disenos')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'disenos'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Diseños</span>
            </button>

            <button
              onClick={() => setActiveTab('inventario')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'inventario'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Inventario & Bodega</span>
              {stockAlertCount !== undefined && stockAlertCount > 0 && (
                <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full animate-pulse">
                  {stockAlertCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('taller')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'taller'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Scissors className="w-4 h-4 transform -rotate-45" />
              <span>Control Taller</span>
            </button>

            <button
              onClick={() => setActiveTab('pruebas')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'pruebas'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Agenda Pruebas</span>
            </button>

            <button
              onClick={() => setActiveTab('notificaciones')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'notificaciones'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Avisos Clientes</span>
            </button>

            <button
              onClick={() => setActiveTab('facturacion')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'facturacion'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Facturación & Pagos</span>
            </button>

            <button
              onClick={() => setActiveTab('reportes')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'reportes'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Reportes & BI</span>
            </button>

            <button
              onClick={() => setActiveTab('auditoria')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'auditoria'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Auditoría</span>
            </button>
          </nav>

          {/* User Active Role Switcher */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-1.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400 ml-1 hidden sm:block" />
              <div className="text-right hidden xl:block">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Usuario Activo</p>
                <p className="text-xs font-semibold text-white">{currentUser.nombre}</p>
              </div>

              <select
                value={currentUser.rol}
                onChange={(e) => {
                  const newRol = e.target.value as RolUsuario;
                  setCurrentUser({
                    ...currentUser,
                    rol: newRol,
                    nombre: newRol === 'Administrador' ? 'Carlos Admin' :
                            newRol === 'Recepción / Ventas' ? 'Mariana López (Ventas)' :
                            newRol === 'Diseñador / Sastre' ? 'Don Mateo (Sastre Master)' :
                            newRol === 'Bodega / Inventario' ? 'Jorge Bodega' : 'Gloria Gerente'
                  });
                }}
                className="bg-slate-900 text-slate-100 text-xs rounded-lg px-2.5 py-1.5 border border-slate-600 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {ROLES_LIST.map((r) => (
                  <option key={r.rol} value={r.rol}>
                    {r.rol}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="md:hidden border-t border-slate-800 bg-slate-900 px-2 py-1.5 flex justify-around">
        <button
          onClick={() => setActiveTab('pedidos')}
          className={`flex flex-col items-center p-1 text-xs font-medium ${
            activeTab === 'pedidos' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Pedidos</span>
        </button>

        <button
          onClick={() => setActiveTab('clientes')}
          className={`flex flex-col items-center p-1 text-xs font-medium ${
            activeTab === 'clientes' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Clientes</span>
        </button>

        <button
          onClick={() => setActiveTab('disenos')}
          className={`flex flex-col items-center p-1 text-xs font-medium ${
            activeTab === 'disenos' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Diseños</span>
        </button>

        <button
          onClick={() => setActiveTab('inventario')}
          className={`flex flex-col items-center p-1 text-xs font-medium ${
            activeTab === 'inventario' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Inventario</span>
        </button>

        <button
          onClick={() => setActiveTab('taller')}
          className={`flex flex-col items-center p-1 text-[11px] font-medium ${
            activeTab === 'taller' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <Scissors className="w-4 h-4 transform -rotate-45" />
          <span>Taller</span>
        </button>

        <button
          onClick={() => setActiveTab('pruebas')}
          className={`flex flex-col items-center p-1 text-[11px] font-medium ${
            activeTab === 'pruebas' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Pruebas</span>
        </button>

        <button
          onClick={() => setActiveTab('notificaciones')}
          className={`flex flex-col items-center p-1 text-[11px] font-medium ${
            activeTab === 'notificaciones' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Avisos</span>
        </button>

        <button
          onClick={() => setActiveTab('facturacion')}
          className={`flex flex-col items-center p-1 text-[11px] font-medium ${
            activeTab === 'facturacion' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Facturas</span>
        </button>

        <button
          onClick={() => setActiveTab('reportes')}
          className={`flex flex-col items-center p-1 text-[11px] font-medium ${
            activeTab === 'reportes' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>BI/Reportes</span>
        </button>

        <button
          onClick={() => setActiveTab('auditoria')}
          className={`flex flex-col items-center p-1 text-[11px] font-medium ${
            activeTab === 'auditoria' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Auditoría</span>
        </button>
      </div>
    </header>
  );
};
