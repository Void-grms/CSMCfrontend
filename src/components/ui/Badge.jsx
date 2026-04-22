/**
 * Badge.jsx
 *
 * Soporta dos formas de uso:
 *
 *   NUEVA (todos los callers actuales):
 *     <Badge color="green">completado</Badge>
 *     <Badge color="blue">abierto</Badge>
 *     <Badge color="red">vencido</Badge>
 *
 *   LEGACY (por si algún componente aún pasa la prop estado):
 *     <Badge estado="completado" />
 *
 * Colores válidos para la prop color: green | blue | red | amber | gray
 */

const estilosPorColor = {
  green: 'bg-[#dcfce7] text-[#166534] ring-[#166534]/20',
  blue:  'bg-primary/8 text-primary ring-primary/20',
  red:   'bg-error/10 text-error ring-error/20',
  amber: 'bg-secondary-container/30 text-on-secondary-container ring-secondary/20',
  gray:  'bg-surface-container text-outline ring-outline-variant/30',
};

// Mapeo legacy: estado → color
const colorPorEstado = {
  abierto:    'blue',
  completado: 'green',
  vencido:    'red',
};

export default function Badge({ estado, color, children }) {
  // Resolver qué color usar: prop color explícita > derivar del estado legacy
  const colorResuelto = color ?? colorPorEstado[estado] ?? 'gray';
  const clase = estilosPorColor[colorResuelto] ?? estilosPorColor.gray;

  // Resolver qué texto mostrar: children > estado legacy
  const texto = children ?? estado ?? '';

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${clase}`}>
      {texto}
    </span>
  );
}