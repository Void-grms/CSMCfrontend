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
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  /* ── Sin datos ── */
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl bg-surface-container/40 text-sm text-outline border border-outline-variant/15">
        {emptyMessage}
      </div>
    );
  }

  /* ── Tabla con datos ── */
  return (
    <div className="overflow-x-auto rounded-xl glass-card border border-outline-variant/15 shadow-[0_4px_16px_rgba(27,94,83,0.04)]">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-outline-variant/20 bg-surface-container-low text-xs font-semibold uppercase tracking-wide text-outline">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {data.map((row, idx) => (
            <tr key={row.id ?? idx} className="transition-colors hover:bg-primary/4">
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-4 py-3 text-on-surface">
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
