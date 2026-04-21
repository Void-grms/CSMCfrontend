import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

/** Gráfico de barras agrupadas: abiertos / completados / vencidos por tipo de paquete */
export default function DistribucionChart({ datos = [] }) {
  if (!datos.length) return (
    <p className="text-center text-sm text-gray-400 py-8">
      Sin datos de distribución disponibles
    </p>
  );

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={datos}
        margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />

        <XAxis 
          dataKey="nombre" 
          tick={false} 
          axisLine={true} 
          tickLine={false} 
        />
        <YAxis 
          type="number" 
          allowDecimals={false} 
          tick={{ fontSize: 11 }} 
          width={40}
        />
        <Tooltip
          formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
          labelStyle={{ fontWeight: 'bold', color: '#374151' }}
        />
        <Legend formatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)} />

        <Bar dataKey="abiertos"    fill="#2563eb" radius={[3, 3, 0, 0]} />
        <Bar dataKey="completados" fill="#16a34a" radius={[3, 3, 0, 0]} />
        <Bar dataKey="vencidos"    fill="#dc2626" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}