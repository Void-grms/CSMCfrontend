import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw, Users } from 'lucide-react';
import { obtenerDetalleAcpDashboard } from '../services/api';
import { formatearFecha } from '../utils/fecha';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export default function DashboardAcpDetalle() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const anio = searchParams.get('anio') || 'todos';
  const mes = searchParams.get('mes') || '';
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const periodo = [
    mes && Number(mes) >= 1 && Number(mes) <= 12 ? MESES[Number(mes) - 1] : '',
    anio !== 'todos' ? anio : '',
  ].filter(Boolean).join(' de ') || 'todos los periodos';

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const data = await obtenerDetalleAcpDashboard(anio, mes);
      setRegistros(data.registros || []);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'No se pudo cargar el detalle de ACP.');
    } finally {
      setCargando(false);
    }
  }, [anio, mes]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <div className="p-2 sm:p-4 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-0.5 rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50"
            aria-label="Volver al dashboard"
            title="Volver al dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800 sm:text-xl">
              Acompañamientos Clínicos Psicosociales
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Atenciones APP100 de coordinadores que suman a la meta en {periodo}.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 ring-1 ring-blue-200">
            <Users size={15} /> {registros.length} atención{registros.length === 1 ? '' : 'es'}
          </span>
          <button
            type="button"
            onClick={cargar}
            disabled={cargando}
            className="inline-flex items-center gap-1 rounded-lg border border-blue-300 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={cargando ? 'animate-spin' : ''} /> Recargar
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
        Cada fila corresponde a una cita válida con C7004, tipo D, LAB 1 = ACP, sesión del 1 al 10 y cantidad de personal mayor que cero. Además, debe tener C7002 tipo D con el EESS asignado del 1 al 4 en el segundo LAB; esta condición identifica al coordinador. Los registros de apoyo sin ese segundo LAB no suman a la meta.
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {cargando ? (
        <div className="flex justify-center py-12">
          <Loader2 size={30} className="animate-spin text-blue-500" />
        </div>
      ) : registros.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white py-12 text-center text-sm text-gray-500">
          No hay atenciones ACP válidas para el periodo seleccionado.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {registros.map((r) => (
              <article key={`${r.id_cita}-${r.fecha_atencion}`} className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-800">{r.coordinador || r.id_personal || 'Sin coordinador'}</p>
                    <p className="text-xs text-gray-500">{formatearFecha(r.fecha_atencion)} · Cita {r.id_cita}</p>
                  </div>
                  <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">C7004 · D</span>
                </div>
                <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-sm">
                  <Dato label="Sesión" valor={r.numero_sesion} />
                  <Dato label="Personal que recibió ACP" valor={r.cantidad_personal} />
                  <Dato label="Profesión (C7002)" valor={r.profesion_actividad} />
                  <Dato label="EESS coordinado" valor={r.eess_numero ? `EESS ${r.eess_numero}` : null} />
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-lg border border-gray-200 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-3 py-3">Fecha</th>
                  <th className="px-3 py-3">Coordinador</th>
                  <th className="px-3 py-3 text-center">Sesión</th>
                  <th className="px-3 py-3 text-center">Personal que recibió ACP</th>
                  <th className="px-3 py-3">Supervisión / profesión</th>
                  <th className="px-3 py-3 text-center">EESS</th>
                  <th className="px-3 py-3">Cita</th>
                  <th className="px-3 py-3 text-center">Código</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {registros.map((r) => (
                  <tr key={`${r.id_cita}-${r.fecha_atencion}`} className="hover:bg-blue-50">
                    <td className="whitespace-nowrap px-3 py-3 text-gray-700">{formatearFecha(r.fecha_atencion)}</td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-gray-800">{r.coordinador || r.id_personal || '—'}</p>
                      <p className="text-xs text-gray-500">{r.coordinador_documento || r.coordinador_profesion || ''}</p>
                    </td>
                    <td className="px-3 py-3 text-center font-semibold text-blue-700">{r.numero_sesion}</td>
                    <td className="px-3 py-3 text-center font-semibold text-gray-800">{r.cantidad_personal}</td>
                    <td className="px-3 py-3 text-gray-700">{r.profesion_actividad || '—'}</td>
                    <td className="px-3 py-3 text-center text-gray-700">{r.eess_numero ? `EESS ${r.eess_numero}` : '—'}</td>
                    <td className="px-3 py-3 font-mono text-xs text-gray-500">{r.id_cita}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="whitespace-nowrap rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">C7004 · D</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Dato({ label, valor }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 font-medium text-gray-700">{valor ?? '—'}</p>
    </div>
  );
}
