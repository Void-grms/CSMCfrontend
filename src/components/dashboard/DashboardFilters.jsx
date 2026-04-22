export default function DashboardFilters({ anio, setAnio }) {
  const anios = ['todos', '2026', '2025', '2024'];

  return (
    <div className="flex items-center gap-3 bg-surface-bright border border-outline-variant/20 px-4 py-2 rounded-lg shadow-sm">
      <label htmlFor="anio-select" className="text-sm font-medium text-on-surface-variant whitespace-nowrap">
        Periodo:
      </label>
      <select
        id="anio-select"
        value={anio}
        onChange={(e) => setAnio(e.target.value)}
        className="rounded-lg border border-outline-variant/30 py-1.5 pl-3 pr-8 text-sm text-on-surface bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 hover:bg-surface-container cursor-pointer"
      >
        {anios.map(a => (
          <option key={a} value={a}>
            {a === 'todos' ? 'Todos los años' : a}
          </option>
        ))}
      </select>
    </div>
  );
}
