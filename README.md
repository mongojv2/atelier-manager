# 🧵 Sistema de Gestión para Local de Diseño y Confección de Ropa (Atelier Manager)

[![Stack](https://img.shields.io/badge/Stack-React_19_%7C_Node.js_%7C_TypeScript-indigo.svg)](https://react.dev/)
[![ORM](https://img.shields.io/badge/ORM-Drizzle_ORM-blue.svg)](https://orm.drizzle.team/)
[![Database](https://img.shields.io/badge/Database-SQLite_Cloud-emerald.svg)](https://sqlitecloud.io/)

> **Proyecto Educativo - Técnico en Programación de Software**  
> **Insumo ERS:** Especificación de Requisitos de Software (v1.0)  
> **Aprendiz:** Wendy Paola Montes Orozco | **Ficha:** 3337233  

---

## 📌 Descripción del Proyecto

**Atelier Manager** es una plataforma web integral diseñada para automatizar la operación completa de un taller o local de confección y sastrería. Centraliza la información en una base de datos en la nube garantizando trazabilidad completa desde la captación del cliente hasta la entrega final de la prenda.

### 🚀 Problemas que Resuelve:
- ❌ Pérdida de fichas técnicas e historial de medidas corporales.
- ❌ Desconocimiento del estado y avance de confección de pedidos.
- ❌ Retrasos en las fechas de entrega acordadas.
- ❌ Falta de control de inventario (telas, hilos, insumos).
- ❌ Dificultad para liquidar abonos y emitir comprobantes de venta.

---

## ✨ Funcionalidades Principales (Fases 1, 2 y 3)

### 🔹 Fase 1: Gestión Básica (Datos Maestros)
- **RF-001 | Clientes:** Registro, consulta, modificación y estado (Activo/Inactivo) con documento ID.
- **RF-002 | Medidas Corporales:** Ficha técnica de 9 medidas corporales por cliente con historial cronológico.
- **RF-003 | Diseños y BOM:** Catálogo de diseños de prendas con desglose de insumos (Lista de Materiales - BOM).
- **RF-004 | Registro de Pedidos:** Creación wizard de pedidos indicando cliente, diseño, fecha estimada y notas.

### 🔹 Fase 2: Operación del Taller e Inventario
- **RF-005 | Trazabilidad del Pedido:** Flujo de estados (`Pendiente` ➔ `En confección` ➔ `Terminado` ➔ `Entregado` ➔ `Cancelado`).
- **RF-006 | Inventario Kardex:** Control de existencias, entradas, salidas y alertas de stock mínimo.
- **Control de Taller:** Asignación de operarios/sastres y agenda de citas para pruebas de prenda.

### 🔹 Fase 3: Administración, Facturación y Reportes
- **RF-007 | Registro de Ventas y Abonos:** Liquidación de pagos parciales/totales con recálculo de saldos.
- **RF-008 | Comprobantes de Venta:** Generación de recibos de pago con numeración consecutiva (`REC-0001`).
- **RF-009 | Dashboard BI:** Reportes analíticos de ventas por período, rendimiento de taller y stock.
- **Auditoría:** Registro de traza de cambios de estado e historial de transacciones (RN-010).

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts.
- **Backend:** Node.js, Express.js (Arquitectura por capas con API REST).
- **Base de Datos & ORM:** SQLite Cloud, Drizzle ORM.
- **Arquitectura de Base de Datos:** Separación estricta entre consultas de aplicación (DML `READWRITE`) y scripts de migración (DDL `ADMIN`).

---

## 📋 Requisitos Previos

Asegúrate de tener instalado en tu sistema:
- [Node.js](https://nodejs.org/) (Versión `18.x` o superior)
- `npm` (incluido con Node.js) o `bun`

---

## 🚀 Guía de Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/mongojv2/atelier-manager.git
cd atelier-manager
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Copia el archivo de plantilla `.env.example` para crear tu archivo `.env` local:
```bash
cp .env.example .env
```
Edita `.env` e ingresa tus cadenas de conexión de SQLite Cloud:
```env
# Conexión principal de la aplicación (Rol READWRITE con permisos DML únicamente)
SQLITE_CLOUD_CONNECTION_STRING="sqlitecloud://usuario:token@host.sqlite.cloud:8860/nombre_de_tu_db?apikey=TU_API_KEY"

# Conexión administrativa para la migración de esquemas (Rol ADMIN con permisos DDL, requerido para npm run db:push)
SQLITE_CLOUD_ADMIN_CONNECTION_STRING="sqlitecloud://admin:token@host.sqlite.cloud:8860/nombre_de_tu_db?apikey=TU_API_KEY_ADMIN"
```
> ⚠️ **IMPORTANTE:** El archivo `.env` contiene credenciales sensibles y está excluido en `.gitignore`. Nunca lo subas a un repositorio público.

### 4. Ejecutar Migraciones DDL (Creación de Tablas)
Para crear las 13 tablas relacionales en la base de datos en la nube:
```bash
npm run db:push
```

### 5. (Opcional) Cargar Datos de Prueba
Si deseas sembrar la base de datos con información inicial de prueba:
```bash
npm run seed
```

### 6. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
Accede a la aplicación en tu navegador en: [http://localhost:3000](http://localhost:3000)

---

## 📁 Estructura del Proyecto

```text
atelier-manager/
├── src/                      # Código fuente del Frontend (React 19 + TS)
│   ├── components/           # Módulos UI (Clientes, Pedidos, Taller, Inventario, Facturación)
│   ├── services/             # Cliente API HTTP (Fetch)
│   ├── types.ts              # Definiciones e Interfaces TypeScript (RF/RN)
│   ├── App.tsx               # Componente principal y Router de pestañas
│   └── main.tsx              # Punto de entrada de React
├── server/                   # Código fuente del Backend (Node.js + Express)
│   ├── db/                   # Configuración de ORM y Migraciones
│   │   ├── index.ts          # Inicializador ORM Drizzle (DML)
│   │   ├── schema.ts         # Esquemas DDL de las 13 tablas
│   │   └── migrate.ts        # Script de migración independiente DDL (npm run db:push)
│   ├── dbStore.ts            # Lógica de Negocio y Persistencia (Reglas RN-001..RN-010)
│   └── seed.ts               # Sembrado de datos iniciales
├── .env.example              # Plantilla sanitizada de variables de entorno
├── .gitignore                # Reglas de exclusión de archivos en Git
├── package.json              # Dependencias y scripts npm
├── server.ts                 # Servidor de producción/desarrollo Express
└── vite.config.ts            # Configuración de Vite bundler
```

---

## 🔐 Seguridad y Buenas Prácticas de Git

1. **Credenciales Protegidas:** El archivo `.env` y las claves API de la nube están excluidas mediante `.gitignore`.
2. **Principio de Mínimo Privilegio:** La aplicación en ejecución (`npm run dev`) opera exclusivamente con permisos DML (`READWRITE`), aislando los permisos de modificación de esquema (`ADMIN`) al script `npm run db:push`.

---

## 📜 Licencia y Créditos

Este proyecto fue desarrollado como parte de la formación académica en la ficha **3337233 - Técnico en Programación de Software**.  
**Diseño de Requisitos:** Wendy Paola Montes Orozco.
