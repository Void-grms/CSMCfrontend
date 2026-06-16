import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Loader2, AlertTriangle, LifeBuoy, Wrench, CalendarClock, RefreshCw,
} from 'lucide-react';
import {
  obtenerSalvavidasSalvables,
  obtenerSalvavidasCorregibles,
} from '../services/api';
import { formatearFecha } from '../utils/fecha';

const ANIO_ACTUAL = new Date().getFullYear();

/** Convierte 'psicoterapia_individual' → 'Psicoterapia individual'. */
function etiquetaComponente(tipo) {
  if (!tipo) return '';
  const limpio = tipo.replace(/_/g, ' ');
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

/** Resumen legible de lo que le falta a un paciente. */
function textoFaltantes(faltantes) {
  if (!Array.isArray(faltantes) || faltantes.length === 0) return '—';
  return faltantes
    .map((f) => `${f.falta} ${etiquetaComponente(f.tipo_componente)}`)
    .join(' · ');
}

function DiasRestantes({ dias }) {
  if (dias == null) return <span className="text-gray-400">—</span>;
  if (dias < 0) return <span className="font-semibold text-red-600">{Math.abs(dias)}d vencido</span>;
  if (dias <= 7) return <span className="font-semibold text-orange-500">{dias}d</span>;
  if (dias <= 30) return <span className="font-semibold text-yellow-600">{dias}d</span>;
  return <span className="text-green-600">{dias}d</span>;
}

// ── Pestaña: por salvar (abiertos) ──────────────────────────────────────────
function PestanaSalvar({ idPaquete }) {
  const [umbral, setUmbral] = useState(2);
  const [filas, setFilas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerSalvavidasSalvables(idPaquete, ANIO_ACTUAL, umbral);
      setFilas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Error al cargar');
    } finally {
      setCargando(false);
    }
  }, [idPaquete, umbral]);

  useEffect(() => {
    const t = setTimeout(cargar, 0);
    return () => clearTimeout(t);
  }, [cargar]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          Máximo de atenciones pendientes:
          <input
            type="number"
            min="1"
            max="50"
            value={umbral}
            onChange={(e) => setUmbral(Math.max(1, Number(e.target.value) || 1))}
            className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </label>
        <span className="text-xs text-gray-400">
          Solo se muestran los pacientes a los que les faltan ≤ {umbral} atención(es).
        </span>
        <button
          type="button"
          onClick={cargar}
          disabled={cargando}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          title="Actualizar"
        >
          <RefreshCw size={15} className={cargando ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {cargando ? (
        <div className="flex items-center gap-2 py-10 text-sm text-gray-500">
          <Loader2 size={18} className="animate-spin" /> Cargando…
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle size={16} /> {error}
        </div>
      ) : filas.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          No hay paquetes abiertos cercanos a completarse con este criterio.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Paciente</th>
                <th className="px-4 py-3">DNI</th>
                <th className="px-4 py-3">Le falta</th>
                <th className="px-4 py-3 text-center">Pendientes</th>
                <th className="px-4 py-3 text-center">Vence</th>
                <th className="px-4 py-3 text-center">Restan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filas.map((f) => (
                <tr key={f.id} className="hover:bg-cyan-50/40">
                  <td className="px-4 py-3 font-medium text-gray-800">{f.nombre_paciente}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{f.dni || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{textoFaltantes(f.faltantes)}</td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-800">{f.pendientes}</td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">{formatearFecha(f.fecha_limite)}</td>
                  <td className="px-4 py-3 text-center"><DiasRestantes dias={f.dias_restantes} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Pestaña: por corregir (vencidos) ────────────────────────────────────────
function PestanaCorregir({ idPaquete }) {
  const [casos, setCasos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerSalvavidasCorregibles(idPaquete, ANIO_ACTUAL);
      setCasos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Error al cargar');
    } finally {
      setCargando(false);
    }
  }, [idPaquete]);

  useEffect(() => {
    const t = setTimeout(cargar, 0);
    return () => clearTimeout(t);
  }, [cargar]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-gray-400">
          Vencidos {ANIO_ACTUAL} con al menos una atención recuperable.
        </p>
        <button
          type="button"
          onClick={cargar}
          disabled={cargando}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          title="Actualizar"
        >
          <RefreshCw size={15} className={cargando ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {cargando ? (
        <div className="flex items-center gap-2 py-10 text-sm text-gray-500">
          <Loader2 size={18} className="animate-spin" /> Cargando…
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle size={16} /> {error}
        </div>
      ) : casos.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          No hay paquetes vencidos con atenciones corregibles para este paquete.
        </p>
      ) : (
        <>
          <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">
            Estos paquetes vencieron sin completarse, pero tienen atenciones que no contaron
            para ningún componente. Revisa si un código se registró por error: corrígelo en el
            HIS y vuelve a importar para recuperarlos.
          </p>

          {casos.map((c) => (
        <div key={c.id} className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <p className="font-semibold text-gray-800">{c.nombre_paciente}</p>
              <p className="font-mono text-xs text-gray-400">DNI {c.dni || '—'}</p>
            </div>
            <span className="text-xs text-gray-500">
              Periodo {formatearFecha(c.fecha_inicio)} → {formatearFecha(c.fecha_limite)}
            </span>
          </div>

          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {/* Componentes que faltaron */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Le faltó completar
              </p>
              <ul className="space-y-1.5">
                {c.componentes_faltantes.map((comp) => (
                  <li key={comp.tipo_componente} className="text-sm">
                    <span className="font-medium text-gray-800">
                      {comp.falta} × {etiquetaComponente(comp.tipo_componente)}
                    </span>
                    <span className="block font-mono text-[11px] text-gray-400">
                      códigos válidos: {(comp.codigos_validos || []).join(', ') || '—'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Atenciones no aprovechadas */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Atenciones que podrían recodificarse
              </p>
              <ul className="space-y-1.5">
                {c.atenciones_no_aprovechadas.map((a) => (
                  <li
                    key={`${a.id_cita}-${a.id_correlativo}`}
                    className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700"
                  >
                    <span className="font-mono font-semibold text-amber-700">{a.codigo_item}</span>
                    {' · '}{formatearFecha(a.fecha_atencion)}
                    {a.nombre_profesional && <span className="text-gray-500"> · {a.nombre_profesional}</span>}
                    {a.id_turno && <span className="text-gray-400"> · turno {a.id_turno}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
          ))}
        </>
      )}
    </div>
  );
}

// ── Página ──────────────────────────────────────────────────────────────────
export default function SalvavidasPaquete() {
  const { idPaquete } = useParams();
  const [pestana, setPestana] = useState('salvar');

  return (
    <div className="space-y-5">
      <Link to="/salvavidas" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-cyan-700">
        <ArrowLeft size={16} /> Volver a Salvavidas
      </Link>

      <div className="flex items-center gap-2">
        <CalendarClock size={20} className="text-cyan-600" />
        <h2 className="font-mono text-lg font-bold text-gray-800">{idPaquete}</h2>
        <span className="text-sm text-gray-400">· año {ANIO_ACTUAL}</span>
      </div>

      {/* Pestañas */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setPestana('salvar')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            pestana === 'salvar'
              ? 'border-cyan-500 text-cyan-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <LifeBuoy size={16} /> Por salvar (abiertos)
        </button>
        <button
          type="button"
          onClick={() => setPestana('corregir')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            pestana === 'corregir'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Wrench size={16} /> Por corregir (vencidos)
        </button>
      </div>

      {pestana === 'salvar'
        ? <PestanaSalvar idPaquete={idPaquete} />
        : <PestanaCorregir idPaquete={idPaquete} />}
    </div>
  );
}
