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
  green: 'bg-green-100 text-green-800',
  blue:  'bg-blue-100  text-blue-800',
  red:   'bg-red-100   text-red-800',
  amber: 'bg-amber-100 text-amber-800',
  gray:  'bg-gray-100  text-gray-600',
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
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${clase}`}>
      {texto}
    </span>
  );
}