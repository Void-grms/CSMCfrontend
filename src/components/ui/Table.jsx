import { Loader2 } from 'lucide-react';

/**
 * Tabla genérica reutilizable.
 * @param {Array} columns - [{ key, label, render? }]
 * @param {Array} data - filas de datos
 * @param {boolean} loading - muestra spinner
 * @param {string} emptyMessage - mensaje cuando no hay datos
 */
export default function Table({ columns = [], data = [], loading = false, emptyMessage = 'Sin datos' }) {
  /* ── Cargando ── */
  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  /* ── Sin datos ── */
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg bg-white text-sm text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  /* ── Tabla con datos ── */
  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row, idx) => (
            <tr key={row.id ?? idx} className="transition-colors hover:bg-gray-50/60">
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-4 py-3 text-gray-700">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
