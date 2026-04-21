export default function DashboardFilters({ anio, setAnio }) {
  const anios = ['todos', '2026', '2025', '2024'];

  return (
    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm ring-1 ring-gray-100">
      <label htmlFor="anio-select" className="text-sm font-medium text-gray-700">Periodo:</label>
      <select
        id="anio-select"
        value={anio}
        onChange={(e) => setAnio(e.target.value)}
        className="rounded-md border-gray-300 py-1.5 pl-3 pr-8 text-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 ring-1 ring-gray-200 outline-none transition-colors hover:bg-white"
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
