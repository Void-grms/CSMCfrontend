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
    { id: 'abiertos', titulo: 'Paquetes abiertos', valor: paquetesAbiertos, icono: Package, color: 'text-blue-600', ring: 'ring-blue-500', bg: 'bg-blue-50/50' },
    { id: 'completados', titulo: 'Paquetes completados', valor: completados, icono: CheckCircle, color: 'text-green-600', ring: 'ring-green-500', bg: 'bg-green-50/50' },
    { id: 'vencidos', titulo: 'Paquetes vencidos', valor: vencidos, icono: AlertTriangle, color: 'text-red-600', ring: 'ring-red-500', bg: 'bg-red-50/50' },
    { id: 'total', titulo: 'Total de paquetes', valor: total, icono: Activity, color: 'text-purple-600', ring: 'ring-purple-500', bg: 'bg-purple-50/50' }
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
              className={`h-full transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md ${
                isActive ? `ring-2 ${c.ring} shadow-md ${c.bg}` : 'ring-1 ring-gray-100 hover:ring-gray-300 bg-white'
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
