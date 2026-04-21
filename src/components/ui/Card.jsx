/** Tarjeta métrica reutilizable con icono, valor y etiqueta */
export default function Card({ titulo, valor, icono: Icon, color = 'text-blue-600', className = '' }) {
  return (
    <div className={`flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 ${className}`}>
      {/* Icono */}
      {Icon && (
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-50 ${color}`}>
          <Icon size={22} strokeWidth={1.8} />
        </div>
      )}

      {/* Contenido */}
      <div>
        <p className="text-2xl font-bold text-gray-800">{valor}</p>
        <p className="text-sm text-gray-500">{titulo}</p>
      </div>
    </div>
  );
}
