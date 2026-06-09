# CSMC RENACER — Frontend

Aplicación web del **Sistema de Monitoreo de Paquetes Terapéuticos PP 0131** del Centro de
Salud Mental Comunitario (CSMC) RENACER. Es la interfaz que consume la API de
[CSMCbackend](https://github.com/Void-grms/CSMCbackend): permite cargar las tramas del HIS,
visualizar el avance de los paquetes, monitorear la dispensación de medicamentos, generar
documentos y auditar la codificación.

## Funcionalidades

- **Dashboard** con indicadores y gráficos del avance de paquetes (recharts).
- **Paquetes** y **Pacientes**: listados, filtros, detalle por paquete y descarga de su
  resumen en `.docx`.
- **Farmacia**: seguimiento de la dispensación de medicamentos por paciente (semáforo de
  próxima entrega) con historial y notas.
- **Importar datos**: carga de CSV (`nominaltrama` y maestros) y borrado de datos —total o
  **por periodo/mes**.
- **Documentos**: constancias, reporte HIS (40A y diario), reporte de atenciones
  multiusuario y **verificación de errores de codificación** (aperturas de paquete).
- **Reportes**: producción por profesional, exportable.
- **Ajustes** (admin): catálogo de paquetes con versionado, personal, usuarios y auditoría.
- **Autenticación** por JWT con rutas protegidas y control de rol (`admin`).

## Stack

- **React 19** + **Vite 8**
- **Tailwind CSS 4** (`@tailwindcss/vite`)
- **react-router-dom 7**
- **axios** (cliente HTTP), **recharts** (gráficos), **lucide-react** (iconos),
  **file-saver** (descargas)
- **ESLint 9** (flat config) con plugins de React

## Requisitos

- Node.js 18+
- El backend [CSMCbackend](https://github.com/Void-grms/CSMCbackend) corriendo (por defecto
  en `http://localhost:3000`).

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el servidor de desarrollo (HMR)
npm run dev

# 3. Compilar para producción
npm run build

# 4. Previsualizar el build
npm run preview

# Linting
npm run lint
```

Por defecto Vite sirve la app en `http://localhost:5173`.

### Configuración de la URL del backend

El cliente HTTP vive en [`src/services/api.js`](src/services/api.js). Ajusta ahí la
`baseURL` (o la variable de entorno correspondiente) si el backend no está en
`http://localhost:3000/api`.

## Estructura

```
src/
├── main.jsx               Punto de entrada
├── App.jsx                Rutas (react-router-dom)
├── context/
│   └── AuthContext.jsx    Sesión, token y rol del usuario
├── services/
│   └── api.js             Cliente axios y todas las llamadas a la API
├── components/
│   ├── layout/            Sidebar, TopBar, ProtectedRoute
│   ├── dashboard/         Tarjetas, gráficos y tablas del dashboard
│   ├── charts/            Gráficos reutilizables
│   └── ui/                Card, Table, Badge
├── pages/                 Una página por vista
│   ├── Dashboard, Paquetes, PaqueteDetalle, Pacientes
│   ├── Farmacia, FarmaciaPacienteDetalle
│   ├── Importar, Historial, Documentos, ReporteProfesionales
│   ├── Form*               Formularios de documentos/verificación
│   └── ajustes/            Catálogo, personal, usuarios, auditoría
└── utils/
    └── fecha.js           Formateo de fechas DATE sin desfase de zona horaria
```

## Rutas principales

| Ruta | Vista |
|------|-------|
| `/login` | Inicio de sesión |
| `/dashboard` | Indicadores y gráficos |
| `/paquetes`, `/paquetes/:id` | Paquetes y detalle |
| `/pacientes` | Pacientes |
| `/farmacia`, `/farmacia/:idPaciente` | Dispensación de medicamentos |
| `/importar` | Carga y borrado de datos |
| `/historial` | Historial de cargas |
| `/documentos` | Generación de documentos y verificación de codificación |
| `/reportes/profesionales` | Producción por profesional |
| `/ajustes/*` | Administración (solo admin) |

## Notas

- Las fechas de calendario (`fecha_atencion`, `fecha_inicio`, etc.) se muestran con
  `formatearFecha` de [`src/utils/fecha.js`](src/utils/fecha.js), que toma la parte
  `YYYY-MM-DD` **sin** convertir a zona horaria, para evitar el desfase de un día que
  ocurre cuando el backend corre en UTC. Los timestamps reales (auditoría, creación) sí se
  muestran en hora local.
- El módulo de Documentos y los Ajustes son exclusivos del rol `admin`.
