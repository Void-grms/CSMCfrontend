/**
 * fecha.js — Utilidades de formateo de fechas.
 *
 * Las columnas DATE de PostgreSQL (fecha_atencion, fecha_inicio, fecha_limite,
 * fecha_nacimiento, etc.) son fechas de CALENDARIO, sin hora ni zona horaria.
 * El driver `pg` las serializa como un instante a medianoche del servidor, p. ej.
 * "2026-06-02T00:00:00.000Z" cuando el servidor corre en UTC. Si se formatean con
 * `new Date(x).toLocaleDateString('es-PE')`, el navegador en Perú (UTC-5) resta 5 h
 * y la fecha retrocede un día (02 → 01).
 *
 * `formatearFecha` evita ese desfase tomando directamente la parte YYYY-MM-DD del
 * string, sin convertir a zona horaria. Para timestamps reales (auditoría, creación
 * de usuarios, etc.) sí debe usarse `new Date(...).toLocaleString('es-PE')`, porque
 * ahí la hora local sí es la representación correcta.
 */

/**
 * Formatea una fecha de calendario como dd/mm/yyyy SIN desfase de zona horaria.
 * Acepta tanto "YYYY-MM-DD" como un ISO con hora ("YYYY-MM-DDThh:mm:ssZ") y, en
 * ambos casos, usa solo la parte de la fecha.
 *
 * @param {string|Date|null|undefined} valor
 * @param {string} [fallback='—'] - Texto a devolver si no hay fecha válida.
 * @returns {string}
 */
export function formatearFecha(valor, fallback = '—') {
  if (!valor) return fallback;
  const m = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const [, y, mo, d] = m;
    return `${d}/${mo}/${y}`;
  }
  // Fallback para formatos no estándar.
  const dt = new Date(valor);
  return isNaN(dt.getTime()) ? fallback : dt.toLocaleDateString('es-PE');
}
