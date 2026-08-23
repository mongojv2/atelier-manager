import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { envConfig } from './server/config/env.js';
import { dbStore } from './server/dbStore.js';
import { initOrm } from './server/db/index.js';
import { RolUsuario, EstadoPedido } from './src/types.js';

async function startServer() {
  // Ensure ORM and cloud tables are bootstrapped
  initOrm();

  const app = express();
  const PORT = envConfig.port;

  app.use(cors({ origin: envConfig.corsOrigin }));
  app.use(express.json());

  // Log API requests
  app.use('/api', (req, res, next) => {
    console.log(`[API] ${req.method} ${req.path}`);
    next();
  });

  // --- API ENDPOINTS FOR FASE 1 ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', fase: 'FASE 1: GESTIÓN BÁSICA', version: '1.0.0' });
  });

  // 1. CLIENTES (RF-001)
  app.get('/api/clientes', (req, res) => {
    try {
      const clientes = dbStore.getClientes();
      res.json(clientes);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/clientes/:id', (req, res) => {
    try {
      const cliente = dbStore.getClienteById(req.params.id);
      if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
      res.json(cliente);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/clientes', (req, res) => {
    try {
      const { documento_id, nombre, apellido, telefono, email, direccion, estado, notas } = req.body;
      if (!documento_id || !nombre || !apellido) {
        return res.status(400).json({ error: 'Documento ID, Nombre y Apellido son campos obligatorios.' });
      }
      const newCliente = dbStore.createCliente({
        documento_id,
        nombre,
        apellido,
        telefono: telefono || '',
        email: email || '',
        direccion: direccion || '',
        estado: estado || 'Activo',
        notas: notas || ''
      });
      res.status(201).json(newCliente);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/clientes/:id', (req, res) => {
    try {
      const updated = dbStore.updateCliente(req.params.id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/clientes/:id/toggle-estado', (req, res) => {
    try {
      const updated = dbStore.toggleClienteEstado(req.params.id);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 2. MEDIDAS (RF-002 & RN-009)
  app.get('/api/medidas/cliente/:clienteId', (req, res) => {
    try {
      const medidas = dbStore.getMedidasByCliente(req.params.clienteId);
      res.json(medidas);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/medidas', (req, res) => {
    try {
      const { cliente_id, tomado_por, fecha_toma, ...medidasValues } = req.body;
      if (!cliente_id) {
        return res.status(400).json({ error: 'El ID de cliente es obligatorio.' });
      }
      const newMedida = dbStore.createMedidas({
        cliente_id,
        tomado_por: tomado_por || 'Recepcionista/Sastre',
        fecha_toma: fecha_toma || new Date().toISOString().split('T')[0],
        ...medidasValues
      });
      res.status(201).json(newMedida);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 3. DISEÑOS (RF-003)
  app.get('/api/disenos', (req, res) => {
    try {
      const disenos = dbStore.getDisenos();
      res.json(disenos);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/disenos', (req, res) => {
    try {
      const { nombre, categoria, descripcion, genero, precio_base, complejidad, imagen_url, estado } = req.body;
      if (!nombre || !categoria || precio_base === undefined) {
        return res.status(400).json({ error: 'Nombre, Categoría y Precio Base son obligatorios.' });
      }
      const newDiseno = dbStore.createDiseno({
        nombre,
        categoria,
        descripcion: descripcion || '',
        genero: genero || 'Unisex',
        precio_base: Number(precio_base),
        complejidad: complejidad || 'Media',
        imagen_url: imagen_url || '',
        estado: estado || 'Activo'
      });
      res.status(201).json(newDiseno);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/disenos/:id', (req, res) => {
    try {
      const updated = dbStore.updateDiseno(req.params.id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 4. PEDIDOS (RF-004, RF-005 & RN-001..RN-010)
  app.get('/api/pedidos', (req, res) => {
    try {
      const pedidos = dbStore.getPedidos();
      res.json(pedidos);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/pedidos/:id', (req, res) => {
    try {
      const pedido = dbStore.getPedidoById(req.params.id);
      if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
      res.json(pedido);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/pedidos', (req, res) => {
    try {
      const {
        cliente_id,
        diseno_id,
        tipo_prenda,
        color,
        material_principal,
        fecha_estimada_entrega,
        prioridad,
        monto_total,
        monto_pagado,
        observaciones,
        usuario_nombre,
        usuario_rol
      } = req.body;

      const newPedido = dbStore.createPedido({
        cliente_id,
        diseno_id,
        tipo_prenda,
        color,
        material_principal,
        fecha_estimada_entrega,
        prioridad,
        monto_total,
        monto_pagado,
        observaciones,
        usuario_nombre: usuario_nombre || 'Usuario Sistema',
        usuario_rol: usuario_rol || 'Recepción / Ventas'
      });

      res.status(201).json(newPedido);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/pedidos/:id/estado', (req, res) => {
    try {
      const { estado, usuario_nombre, usuario_rol, observacion } = req.body;
      if (!estado) {
        return res.status(400).json({ error: 'El nuevo estado es obligatorio.' });
      }

      const updated = dbStore.updatePedidoEstado(
        req.params.id,
        estado as EstadoPedido,
        usuario_nombre || 'Usuario Sistema',
        (usuario_rol as RolUsuario) || 'Administrador',
        observacion
      );

      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/pedidos/:id/detalles', (req, res) => {
    try {
      const updated = dbStore.updatePedidoDetails(req.params.id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/pedidos/:id', (req, res) => {
    try {
      const usuarioRol = (req.query.usuario_rol as RolUsuario) || 'Administrador';
      const result = dbStore.deletePedido(req.params.id, usuarioRol);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- FASE 2: INVENTARIO, BODEGA Y COMPRAS ---

  // Materiales (RF-006)
  app.get('/api/materiales', (req, res) => {
    try {
      const materiales = dbStore.getMateriales();
      res.json(materiales);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/materiales/:id', (req, res) => {
    try {
      const mat = dbStore.getMaterialById(req.params.id);
      if (!mat) return res.status(404).json({ error: 'Material no encontrado en bodega' });
      res.json(mat);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/materiales', (req, res) => {
    try {
      const { nombre, categoria, unidad_medida, stock_actual, stock_minimo, costo_unitario, ubicacion_bodega, proveedor_habitual } = req.body;
      if (!nombre || !categoria || !unidad_medida) {
        return res.status(400).json({ error: 'Nombre, Categoría y Unidad de Medida son obligatorios.' });
      }
      const newMat = dbStore.createMaterial({
        nombre,
        categoria,
        unidad_medida,
        stock_actual: Number(stock_actual) || 0,
        stock_minimo: Number(stock_minimo) || 0,
        costo_unitario: Number(costo_unitario) || 0,
        ubicacion_bodega: ubicacion_bodega || 'General',
        proveedor_habitual: proveedor_habitual || ''
      });
      res.status(201).json(newMat);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/materiales/:id', (req, res) => {
    try {
      const updated = dbStore.updateMaterial(req.params.id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Lista de Materiales por Prenda / Diseño (BOM)
  app.get('/api/disenos/:id/bom', (req, res) => {
    try {
      const bom = dbStore.getBOMByDiseno(req.params.id);
      res.json(bom);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/disenos/:id/bom', (req, res) => {
    try {
      const { items } = req.body; // array of { material_id, cantidad_requerida, notas }
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Formato inválido. Se requiere un arreglo "items".' });
      }
      const updatedBOM = dbStore.saveBOMDiseno(req.params.id, items);
      res.json(updatedBOM);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Movimientos de Bodega & Compras
  app.get('/api/inventario/movimientos', (req, res) => {
    try {
      const materialId = req.query.material_id as string | undefined;
      const movimientos = dbStore.getMovimientosInventario(materialId);
      res.json(movimientos);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/inventario/movimientos', (req, res) => {
    try {
      const { material_id, tipo_movimiento, cantidad, usuario_nombre, motivo_observacion, pedido_id } = req.body;
      if (!material_id || !tipo_movimiento || !cantidad) {
        return res.status(400).json({ error: 'Material, Tipo de Movimiento y Cantidad son requeridos.' });
      }
      const newMov = dbStore.registrarMovimientoInventario({
        material_id,
        tipo_movimiento,
        cantidad: Number(cantidad),
        usuario_nombre: usuario_nombre || 'Bodeguero',
        motivo_observacion: motivo_observacion || '',
        pedido_id
      });
      res.status(201).json(newMov);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/inventario/stats', (req, res) => {
    try {
      const stats = dbStore.getStatsInventario();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AUDIT LOGS (RN-010)
  app.get('/api/historial', (req, res) => {
    try {
      const logs = dbStore.getAllHistorialLogs();
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/historial/pedido/:pedidoId', (req, res) => {
    try {
      const logs = dbStore.getHistorialByPedido(req.params.pedidoId);
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- FASE 3: CONTROL DE TALLER, PRUEBAS Y NOTIFICACIONES ---

  // 1. Operarios de Taller
  app.get('/api/operarios', (req, res) => {
    try {
      const operarios = dbStore.getOperarios();
      res.json(operarios);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/operarios', (req, res) => {
    try {
      const { nombre, especialidad, capacidad_simultanea, contacto, estado, avatar_url } = req.body;
      if (!nombre || !especialidad) {
        return res.status(400).json({ error: 'Nombre y Especialidad del operario son requeridos.' });
      }
      const newOp = dbStore.createOperario({
        nombre,
        especialidad,
        capacidad_simultanea: Number(capacidad_simultanea) || 3,
        contacto: contacto || '',
        estado: estado || 'Disponible',
        avatar_url: avatar_url || ''
      });
      res.status(201).json(newOp);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/operarios/:id', (req, res) => {
    try {
      const updated = dbStore.updateOperario(req.params.id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 2. Asignación de Taller
  app.post('/api/taller/asignar', (req, res) => {
    try {
      const { pedido_id, operario_id, etapa_confeccion, notas_taller, usuario_nombre, usuario_rol } = req.body;
      if (!pedido_id || !operario_id) {
        return res.status(400).json({ error: 'Pedido ID y Operario ID son obligatorios para la asignación.' });
      }
      const updatedPedido = dbStore.asignarPedidoTaller({
        pedido_id,
        operario_id,
        etapa_confeccion,
        notas_taller,
        usuario_nombre: usuario_nombre || 'Usuario Sistema',
        usuario_rol: usuario_rol || 'Diseñador / Sastre'
      });
      res.json(updatedPedido);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 3. Calendario de Citas y Pruebas
  app.get('/api/citas', (req, res) => {
    try {
      const citas = dbStore.getCitasPruebas();
      res.json(citas);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/citas', (req, res) => {
    try {
      const { pedido_id, fecha_hora, tipo_prueba, sastre_atendio_id, observaciones_ajuste, usuario_nombre, usuario_rol, notificar_cliente } = req.body;
      if (!pedido_id || !fecha_hora || !tipo_prueba) {
        return res.status(400).json({ error: 'Pedido, Fecha/Hora y Tipo de Prueba son obligatorios.' });
      }
      const newCita = dbStore.createCitaPrueba({
        pedido_id,
        fecha_hora,
        tipo_prueba,
        sastre_atendio_id,
        observaciones_ajuste,
        usuario_nombre: usuario_nombre || 'Recepcionista',
        usuario_rol: usuario_rol || 'Recepción / Ventas',
        notificar_cliente: Boolean(notificar_cliente)
      });
      res.status(201).json(newCita);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/citas/:id', (req, res) => {
    try {
      const updated = dbStore.updateCitaPrueba(req.params.id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 4. Automatización de Notificaciones
  app.get('/api/notificaciones', (req, res) => {
    try {
      const notifs = dbStore.getNotificacionesClientes();
      res.json(notifs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/notificaciones/enviar', (req, res) => {
    try {
      const { cliente_id, pedido_id, cita_id, canal, evento, mensaje, usuario_nombre } = req.body;
      if (!cliente_id || !canal || !evento || !mensaje) {
        return res.status(400).json({ error: 'Cliente, Canal, Evento y Mensaje son requeridos.' });
      }
      const newNotif = dbStore.enviarNotificacionCliente({
        cliente_id,
        pedido_id,
        cita_id,
        canal,
        evento,
        mensaje,
        usuario_nombre: usuario_nombre || 'Sistema Atelier'
      });
      res.status(201).json(newNotif);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 5. Estadísticas de Taller
  app.get('/api/taller/stats', (req, res) => {
    try {
      const stats = dbStore.getStatsTaller();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- FASE 4: LIQUIDACIÓN, FACTURACIÓN Y REPORTES GERENCIALES (RF-007, RF-008, RF-009) ---

  // Obtener todos los comprobantes de venta
  app.get('/api/comprobantes', (req, res) => {
    try {
      const comprobantes = dbStore.getComprobantesVenta();
      res.json(comprobantes);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Obtener comprobante por ID
  app.get('/api/comprobantes/:id', (req, res) => {
    try {
      const comp = dbStore.getComprobanteById(req.params.id);
      if (!comp) return res.status(404).json({ error: 'Comprobante no encontrado' });
      res.json(comp);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Emitir / Registrar un nuevo comprobante de pago o factura (Aplica RN-007)
  app.post('/api/comprobantes', (req, res) => {
    try {
      const {
        pedido_id,
        monto_pagado_momento,
        tipo_comprobante,
        metodo_pago,
        concepto,
        emitido_por_usuario,
        notas
      } = req.body;

      // RN-007 check
      if (!pedido_id) {
        return res.status(400).json({
          error: 'RN-007: No se puede emitir un comprobante de venta o abono sin asociar un Pedido válido.'
        });
      }

      const nuevoComp = dbStore.createComprobanteVenta({
        pedido_id,
        monto_pagado_momento: Number(monto_pagado_momento),
        tipo_comprobante: tipo_comprobante || 'Recibo de Pago',
        metodo_pago: metodo_pago || 'Efectivo',
        concepto,
        emitido_por_usuario: emitido_por_usuario || 'Administrador',
        notas
      });

      res.status(201).json(nuevoComp);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Reportes Gerenciales Detallados (RF-009)
  app.get('/api/reportes/gerenciales', (req, res) => {
    try {
      const rango = (req.query.rango as any) || 'Historico Total';
      const reportes = dbStore.getReportesGerenciales(rango);
      res.json(reportes);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Dashboard Analítico Gerencial (BI)
  app.get('/api/reportes/dashboard', (req, res) => {
    try {
      const stats = dbStore.getStatsDashboardGerencial();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // STATS & ARCHITECTURE METADATA
  app.get('/api/stats', (req, res) => {
    try {
      const stats = dbStore.getStatsFase1();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite Middleware in Dev, Static serve in Prod
  if (!envConfig.isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Atelier Manager Backend] Server running on port ${PORT} (env: ${envConfig.nodeEnv})`);
  });
}

startServer();
