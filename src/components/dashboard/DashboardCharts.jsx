import { useMemo } from 'react';
import DistribucionChart from '../charts/DistribucionChart';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#f59e0b', '#06b6d4', '#10b981', '#f43f5e'];

export default function DashboardCharts({ datos, activeCard }) {
  const chartData = useMemo(() => {
    if (!datos || !datos.length) return [];
    
    // Transformar los datos para el gráfico circular según el card activo
    if (activeCard) {
      return datos.map(v => {
        // En un caso real, el título de la porción podría ser el código y el tooltip el nombre completo.
        // Asumimos que la prop v.codigo existe, o usamos nombre cortado.
        const value = activeCard === 'abiertos' ? (v.abiertos || 0) :
                      activeCard === 'completados' ? (v.completados || 0) :
                      activeCard === 'vencidos' ? (v.vencidos || 0) :
                      (v.abiertos || 0) + (v.completados || 0) + (v.vencidos || 0);
        return {
          name: v.codigo || v.nombre || 'Paquete',
          fullName: v.nombre_completo || v.nombre || 'Paquete',
          value
        };
      }).filter(d => d.value > 0);
    }
    return datos;
  }, [datos, activeCard]);

  const renderTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-md text-sm">
          <p className="font-semibold text-gray-800 mb-1">{data.fullName}</p>
          <p className="text-gray-600">
            Cantidad: <span className="font-bold">{data.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const getTitle = () => {
    switch (activeCard) {
      case 'abiertos': return 'Distribución de Paquetes Abiertos';
      case 'completados': return 'Distribución de Paquetes Completados';
      case 'vencidos': return 'Distribución de Paquetes Vencidos';
      case 'total': return 'Distribución de Total de Paquetes';
      default: return 'Distribución general por tipo de paquete';
    }
  };

  if (!chartData.length) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8 bg-gray-50/50 rounded-lg">
        <p className="text-sm text-gray-400">Sin datos de distribución disponibles</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-[320px]">
      <h3 className="mb-4 text-sm font-semibold text-gray-700 transition-all">
        {getTitle()}
      </h3>
      <div className="flex-1 min-h-[250px] w-full relative">
        {!activeCard ? (
          <DistribucionChart datos={chartData} />
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={renderTooltip} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
