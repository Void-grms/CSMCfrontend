import { useMemo } from 'react';
import DistribucionChart from '../charts/DistribucionChart';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

// Paleta de colores cohesiva con el design system (tonos del primary y secundarios)
const COLORS = ['#00463c', '#2a7d4f', '#735c00', '#613000', '#1b5e53', '#045046', '#574500', '#6f3800'];

export default function DashboardCharts({ datos, activeCard }) {
  const chartData = useMemo(() => {
    if (!datos || !datos.length) return [];
    
    // Transformar los datos para el gráfico circular según el card activo
    if (activeCard) {
      return datos.map(v => {
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
        <div className="glass-card p-3 border border-outline-variant/20 shadow-lg rounded-lg text-sm">
          <p className="font-semibold text-on-surface mb-1">{data.fullName}</p>
          <p className="text-outline">
            Cantidad: <span className="font-bold text-primary">{data.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const getTitle = () => {
    switch (activeCard) {
      case 'abiertos':    return 'Distribución de Paquetes Abiertos';
      case 'completados': return 'Distribución de Paquetes Completados';
      case 'vencidos':    return 'Distribución de Paquetes Vencidos';
      case 'total':       return 'Distribución de Total de Paquetes';
      default:            return 'Distribución general por tipo de paquete';
    }
  };

  if (!chartData.length) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8 bg-surface-container/40 rounded-lg">
        <p className="text-sm text-outline">Sin datos de distribución disponibles</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-[320px]">
      <h3 className="mb-4 text-sm font-semibold text-on-surface-variant transition-all">
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
                wrapperStyle={{ fontSize: '12px', color: '#6f7976' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
