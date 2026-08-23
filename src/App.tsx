import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PedidosModule } from './components/PedidosModule';
import { ClientesModule } from './components/ClientesModule';
import { DisenosModule } from './components/DisenosModule';
import { AuditLogsModule } from './components/AuditLogsModule';
import { InventarioModule } from './components/InventarioModule';
import { TallerModule } from './components/TallerModule';
import { CalendarioPruebasModule } from './components/CalendarioPruebasModule';
import { NotificacionesModule } from './components/NotificacionesModule';
import { FacturacionModule } from './components/FacturacionModule';
import { ReportesAnaliticosModule } from './components/ReportesAnaliticosModule';
import { UsuarioActual, Pedido, Cliente } from './types';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('pedidos');
  const [stockAlertCount, setStockAlertCount] = useState<number>(0);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  
  // Active RBAC User context (allows testing permissions per role)
  const [currentUser, setCurrentUser] = useState<UsuarioActual>({
    id: 'usr-001',
    nombre: 'Mariana López (Ventas)',
    rol: 'Recepción / Ventas',
    email: 'mariana@atelier.com'
  });

  const [systemStatusOk, setSystemStatusOk] = useState<boolean>(true);

  useEffect(() => {
    // Check backend health
    fetch('/api/health')
      .then(r => r.json())
      .then(() => setSystemStatusOk(true))
      .catch(() => setSystemStatusOk(false));

    refreshSharedData();
  }, []);

  const refreshSharedData = async () => {
    try {
      const [pData, cData] = await Promise.all([
        api.getPedidos(),
        api.getClientes()
      ]);
      setPedidos(pData);
      setClientes(cData);
    } catch (e) {
      console.error('Error cargando datos compartidos:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header & Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        systemStatusOk={systemStatusOk}
        stockAlertCount={stockAlertCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: PEDIDOS */}
        {activeTab === 'pedidos' && (
          <PedidosModule currentUser={currentUser} />
        )}

        {/* TAB 2: CLIENTES & MEDIDAS */}
        {activeTab === 'clientes' && (
          <ClientesModule currentUser={currentUser} />
        )}

        {/* TAB 3: DISEÑOS & CATALOGO */}
        {activeTab === 'disenos' && (
          <DisenosModule currentUser={currentUser} />
        )}

        {/* TAB 4: INVENTARIO & BODEGA */}
        {activeTab === 'inventario' && (
          <InventarioModule 
            currentUser={currentUser} 
            onStockAlertCountChange={setStockAlertCount}
          />
        )}

        {/* TAB 5: CONTROL DE TALLER & OPERARIOS */}
        {activeTab === 'taller' && (
          <TallerModule 
            currentUser={currentUser}
            pedidos={pedidos}
            onRefreshPedidos={refreshSharedData}
          />
        )}

        {/* TAB 6: AGENDA DE PRUEBAS */}
        {activeTab === 'pruebas' && (
          <CalendarioPruebasModule 
            currentUser={currentUser}
            pedidos={pedidos}
            onRefreshPedidos={refreshSharedData}
          />
        )}

        {/* TAB 7: AVISOS & NOTIFICACIONES */}
        {activeTab === 'notificaciones' && (
          <NotificacionesModule 
            currentUser={currentUser}
            clientes={clientes}
            pedidos={pedidos}
          />
        )}

        {/* TAB 8: FACTURACIÓN & RECAUDOS (RF-007, RF-008) */}
        {activeTab === 'facturacion' && (
          <FacturacionModule 
            currentUser={currentUser}
            pedidos={pedidos}
            onRefreshData={refreshSharedData}
          />
        )}

        {/* TAB 9: DASHBOARD & REPORTES ANALÍTICOS (RF-009) */}
        {activeTab === 'reportes' && (
          <ReportesAnaliticosModule 
            currentUser={currentUser}
          />
        )}

        {/* TAB 10: AUDITORÍA */}
        {activeTab === 'auditoria' && (
          <AuditLogsModule />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-300">
              Atelier Manager • Sistema de Gestión de Confección & Alta Costura
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Gestión Integral de Pedidos, Medidas, Bodega, Taller, Pruebas y Notificaciones
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">© {new Date().getFullYear()} Atelier Manager Enterprise. Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
