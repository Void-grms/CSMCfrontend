/** Tarjeta métrica reutilizable con icono, valor y etiqueta */
export default function Card({ titulo, valor, icono: Icon, color = 'text-primary', className = '' }) {
  return (
    <div className={`flex items-center gap-4 rounded-xl glass-card p-5 border border-outline-variant/15 shadow-[0_4px_16px_rgba(27,94,83,0.04)] ${className}`}>
      {/* Icono */}
      {Icon && (
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-container ${color}`}>
          <Icon size={22} strokeWidth={1.8} />
        </div>
      )}

      {/* Contenido */}
      <div>
        <p className="text-2xl font-bold text-on-surface">{valor}</p>
        <p className="text-sm text-outline">{titulo}</p>
      </div>
    </div>
  );
}
