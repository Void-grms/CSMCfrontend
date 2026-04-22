import { Package, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import Card from '../ui/Card';

export default function DashboardCards({ datos, activeCard, setActiveCard }) {
  const {
    paquetesAbiertos = 0,
    completados = 0,
    vencidos = 0
  } = datos || {};

  const total = paquetesAbiertos + completados + vencidos;

  const cards = [
    { id: 'abiertos',    titulo: 'Paquetes abiertos',    valor: paquetesAbiertos, icono: Package,       color: 'text-primary',            ring: 'ring-primary/40',          bg: 'bg-primary/6' },
    { id: 'completados', titulo: 'Paquetes completados', valor: completados,       icono: CheckCircle,   color: 'text-[#2a7d4f]',          ring: 'ring-[#2a7d4f]/40',        bg: 'bg-[#2a7d4f]/6' },
    { id: 'vencidos',    titulo: 'Paquetes vencidos',    valor: vencidos,          icono: AlertTriangle, color: 'text-error',               ring: 'ring-error/40',            bg: 'bg-error/6' },
    { id: 'total',       titulo: 'Total de paquetes',    valor: total,             icono: Activity,      color: 'text-on-secondary-container', ring: 'ring-secondary/40',     bg: 'bg-secondary-container/20' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
      {cards.map((c) => {
        const isActive = activeCard === c.id;
        return (
          <div
            key={c.id}
            onClick={() => setActiveCard(isActive ? null : c.id)}
            className="cursor-pointer transition-all duration-200"
          >
            <Card
              titulo={c.titulo}
              valor={c.valor}
              icono={c.icono}
              color={c.color}
              className={`h-full transition-all duration-200 transform hover:-translate-y-1 ${
                isActive
                  ? `ring-2 ${c.ring} shadow-lg ${c.bg}`
                  : 'ring-1 ring-outline-variant/15 hover:ring-outline-variant/30 hover:shadow-md'
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
