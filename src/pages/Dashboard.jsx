import { useState, useEffect } from 'react';
import { obtenerDashboard } from '../services/api';

import DashboardFilters from '../components/dashboard/DashboardFilters';
import DashboardCards from '../components/dashboard/DashboardCards';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import DashboardProgressTable from '../components/dashboard/DashboardProgressTable';

export default function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado global del dashboard
  const [anio, setAnio] = useState('2026');
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCargando(true);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setError(null);
        const data = await obtenerDashboard(anio);
        setDatos(data);
      } catch (err) {
        setError(err.message ?? 'Error al cargar el dashboard');
      } finally {
        setCargando(false);
      }
    }
    fetchData();
  }, [anio]);

  if (cargando && !datos) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"/>
      </div>
    );
  }

  if (error && !datos) {
    return (
      <div className="mx-auto mt-20 max-w-md rounded-xl glass-card p-6 text-center text-error shadow-sm border border-error/20">
        <p className="font-semibold text-lg">No se pudo cargar el dashboard</p>
        <p className="mt-2 text-sm opacity-90">{error}</p>
        <button 
          onClick={() => setAnio('2026')} 
          className="mt-4 px-4 py-2 bg-error/10 rounded-lg hover:bg-error/20 transition-colors text-sm font-medium border border-error/20"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Desestructuración de datos seguros para pasar a los componentes
  const safeData = datos || {};
  const distribucion = safeData.distribucion || [];
  const paquetes = safeData.paquetes || [];

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER + FILTERS */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 glass-card p-5 rounded-xl border border-outline-variant/20 shadow-[0_10px_30px_rgba(27,94,83,0.05)]">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight font-inter">
            Dashboard Interactivo
          </h2>
          <p className="mt-1 text-sm text-outline">
            Monitoreo y seguimiento de paquetes terapéuticos
          </p>
        </div>
        
        <DashboardFilters anio={anio} setAnio={setAnio} />
      </div>

      {/* Indicador de recarga */}
      {cargando && datos && (
        <div className="h-1 bg-primary/10 w-full overflow-hidden rounded-full">
          <div className="h-full bg-primary w-1/3 animate-[pulse_2s_ease-in-out_infinite]"/>
        </div>
      )}

      {/* TARJETAS CON KPI + GRAFICOS DINÁMICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 items-start">
        
        {/* CARDS (Izquierda en desktop, ocupa ~40%) */}
        <div className="lg:col-span-4 grid">
          <DashboardCards 
            datos={safeData} 
            activeCard={activeCard} 
            setActiveCard={setActiveCard} 
          />
        </div>

        {/* GRÁFICOS (Derecha en desktop, ocupa ~60%) */}
        <div className="lg:col-span-6 rounded-xl glass-card p-6 border border-outline-variant/20 shadow-[0_10px_30px_rgba(27,94,83,0.05)] flex flex-col min-h-[380px]">
          <DashboardCharts 
            datos={distribucion} 
            activeCard={activeCard} 
          />
        </div>
      </div>

      {/* TABLA DE AVANCE (Abajo) */}
      <div className="rounded-xl glass-card p-6 border border-outline-variant/20 shadow-[0_10px_30px_rgba(27,94,83,0.05)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-on-surface font-inter">
            Avance de paquetes {anio === 'todos' ? '(Todos los años)' : `(${anio})`}
          </h3>
          <span className="text-xs font-medium bg-primary/8 text-primary px-3 py-1 rounded-full ring-1 ring-primary/20">
            Vista Detallada
          </span>
        </div>
        
        <DashboardProgressTable paquetes={paquetes} />
      </div>

    </div>
  );
}