/** Tarjeta métrica reutilizable con icono, valor y etiqueta */
export default function Card({ titulo, valor, icono: Icon, color = 'text-primary', className = '' }) {
  return (
    <div className={`flex items-center gap-3 sm:gap-4 rounded-xl glass-card p-3 sm:p-5 border border-outline-variant/15 shadow-[0_4px_16px_rgba(27,94,83,0.04)] min-w-0 ${className}`}>
      {/* Icono */}
      {Icon && (
        <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-surface-container ${color}`}>
          <Icon size={20} strokeWidth={1.8} />
        </div>
      )}

      {/* Contenido */}
      <div className="min-w-0">
        <p className="text-xl sm:text-2xl font-bold text-on-surface">{valor}</p>
        <p className="text-xs sm:text-sm text-outline truncate">{titulo}</p>
      </div>
    </div>
  );
}
