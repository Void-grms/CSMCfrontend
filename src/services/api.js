import axios from 'axios';
import { saveAs } from 'file-saver';

// Instancia base de axios — usa VITE_API_URL en producción o /api en desarrollo (proxy de Vite)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para inyectar Token JWT a todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para atrapar 401 Unauthorized (Token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/* ──────────────────────────────────────────
   Autenticación
   ────────────────────────────────────────── */

export const loginApi = (username, password) => 
  api.post('/auth/login', { username, password }).then((r) => r.data);

/* ──────────────────────────────────────────
   Dashboard
   ────────────────────────────────────────── */

/** Obtiene métricas generales y distribución de paquetes */
export const obtenerDashboard = (anio) => 
  api.get('/dashboard', { params: { anio } }).then((r) => r.data);

/* ──────────────────────────────────────────
   Paquetes
   ────────────────────────────────────────── */

/** Lista de paquetes próximos a vencer (por defecto 30 días) */
export const obtenerProximosAVencer = (dias = 30) =>
  api.get('/paquetes/proximos-a-vencer', { params: { dias } }).then((r) => r.data);

/** Lista paginada de paquetes con filtros (servidor hace el cálculo de avance) */
export const obtenerPaquetesPaginados = (filtros = {}) =>
  api.get('/paquetes', { params: filtros }).then((r) => r.data);

/** Detalle completo de un paquete */
export const obtenerPaquete = (id) =>
  api.get(`/paquetes/${id}`).then((r) => r.data);

/* ──────────────────────────────────────────
   Pacientes
   ────────────────────────────────────────── */

export const buscarPacientes = (q) =>
  api.get('/pacientes/buscar', { params: { q } }).then((r) => r.data);

/** Todos los paquetes de un paciente */
export const obtenerPaquetesPaciente = (id) =>
  api.get(`/pacientes/${id}/paquetes`).then((r) => r.data);

/* ──────────────────────────────────────────
   Profesionales
   ────────────────────────────────────────── */

/** Paquetes atendidos por un profesional */
export const obtenerPaquetesProfesional = (id) =>
  api.get(`/profesional/${id}/paquetes`).then((r) => r.data);

/* ──────────────────────────────────────────
   Importación de datos
   ────────────────────────────────────────── */

/** Sube archivo CSV de nominaltrama (multipart/form-data) */
export const importarNominaltrama = (archivo) => {
  const form = new FormData();
  form.append('archivo', archivo);
  return api.post('/importar/nominaltrama', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data.resumen ?? r.data);
};

/** Sube archivo CSV de maestros (multipart/form-data) */
export const importarMaestros = (archivo) => {
  const form = new FormData();
  form.append('archivo', archivo);
  return api.post('/importar/maestros', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data.resumen ?? r.data);
};

/** Borrar toda la base de datos (con clave de seguridad) */
export const limpiarBaseDeDatos = (clave) =>
  api.delete('/database/limpiar', { data: { clave } }).then((r) => r.data);

/** Historial de importaciones realizadas */
export const obtenerHistorialCargas = () =>
  api.get('/historial-cargas').then((r) => r.data);

/* ──────────────────────────────────────────
   Documentos
   ────────────────────────────────────────── */

/** Busca pacientes para el módulo de documentos */
export const buscarPacienteDocumentos = (q) =>
  api.get('/documentos/buscar-paciente', { params: { q } }).then((r) => r.data);

/** Genera un documento .docx y dispara la descarga en el navegador */
export const generarDocumento = async (tipo, pacienteId) => {
  const response = await api.get(`/documentos/${tipo}/${pacienteId}`, {
    responseType: 'blob',
  });

  // Extraer nombre del archivo del header Content-Disposition, o usar default
  const disposition = response.headers['content-disposition'] || '';
  const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
  const filename = filenameMatch ? filenameMatch[1] : `${tipo}_${pacienteId}.docx`;

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/** Actualiza el domicilio del paciente */
export const actualizarDomicilioPaciente = (id, domicilio) =>
  api.put(`/pacientes/${id}/domicilio`, { domicilio }).then((r) => r.data);

/* ──────────────────────────────────────────
   Reporte de Producción HIS
   ────────────────────────────────────────── */

/** Vista previa del reporte HIS (JSON) */
export const obtenerReporteHIS = (idPersonal, fechaInicio, fechaFin) =>
  api
    .get('/documentos/reporte-his', {
      params: {
        id_personal: idPersonal,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      },
    })
    .then((r) => r.data);

/** Descarga el reporte HIS en formato Excel (.xlsx) */
export const exportarReporteHIS = async (idPersonal, fechaInicio, fechaFin) => {
  const response = await api.get('/documentos/reporte-his/exportar', {
    params: {
      id_personal: idPersonal,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    },
    responseType: 'blob',
  });

  const disposition = response.headers['content-disposition'] || '';
  const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
  const filename = filenameMatch ? filenameMatch[1] : 'ReporteHIS.xlsx';

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/* ──────────────────────────────────────────
   Reporte de Producción HIS Diario
   ────────────────────────────────────────── */

/** Vista previa del reporte HIS Diario (JSON) */
export const obtenerReporteHISDiario = (idPersonal, fechaInicio) =>
  api
    .get('/documentos/reporte-his-diario', {
      params: {
        id_personal: idPersonal,
        fecha_inicio: fechaInicio,
      },
    })
    .then((r) => r.data);

/** Descarga el reporte HIS Diario usando file-saver */
export const exportarReporteHISDiario = async (idPersonal, fechaInicio) => {
  const response = await api.get('/documentos/reporte-his-diario/exportar', {
    params: {
      id_personal: idPersonal,
      fecha_inicio: fechaInicio,
    },
    responseType: 'blob',
  });

  const disposition = response.headers['content-disposition'] || '';
  const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
  const filename = filenameMatch ? filenameMatch[1] : 'ReporteHIS_Diario.xlsx';

  saveAs(new Blob([response.data]), filename);
};

export default api;
