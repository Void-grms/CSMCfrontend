import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy, Loader2, ChevronRight, AlertTriangle, RefreshCw } from 'lucide-react';
import { obtenerSalvavidasPaquetes } from '../services/api';

const ANIO_ACTUAL = new Date().getFullYear();

/** Tablero principal del módulo Salvavidas: un botón por paquete del catálogo. */
export default function Salvavidas() {
  const [paquetes, setPaquetes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerSalvavidasPaquetes(ANIO_ACTUAL);
      setPaquetes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Error al cargar');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(cargar, 0);
    return () => clearTimeout(t);
  }, [cargar]);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
          <LifeBuoy size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Salvavidas</h2>
          <p className="text-sm text-gray-500">
            Rescate de paquetes que vencen en {ANIO_ACTUAL}. Elige un paquete para ver
            los casos por salvar (abiertos) y por corregir (vencidos).
          </p>
        </div>
        <button
          type="button"
          onClick={cargar}
          disabled={cargando}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          title="Actualizar"
        >
          <RefreshCw size={15} className={cargando ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {cargando ? (
        <div className="flex items-center gap-2 py-12 text-sm text-gray-500">
          <Loader2 size={18} className="animate-spin" /> Cargando paquetes…
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle size={16} /> {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {paquetes.map((p) => {
            const hayCasos = p.salvables > 0 || p.corregibles > 0;
            return (
              <Link
                key={p.id_paquete}
                to={`/salvavidas/${p.id_paquete}`}
                className={`group flex flex-col rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md ${
                  hayCasos ? 'border-cyan-200 hover:border-cyan-400' : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-800">{p.nombre}</p>
                    <p className="font-mono text-[11px] text-gray-400">{p.id_paquete}</p>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-gray-300 group-hover:text-cyan-500" />
                </div>
                <div className="mt-3 flex gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                    {p.salvables} por salvar
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                    {p.corregibles} por corregir
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
