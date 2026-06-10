import { useState, useEffect } from 'react';
import {
  ChevronLeft, Search, Loader2, Download, AlertTriangle,
  CheckCircle2, ShieldCheck,
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import {
  obtenerPeriodosDatos,
  obtenerVerificacionCodificacion,
  descargarVerificacionCodificacion,
} from '../services/api';
import { formatearFecha } from '../utils/fecha';

const MESES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const etiquetaPeriodo = (p) => `${MESES[p.mes]} ${p.anio}`;

/** Tarjeta de conteo del resumen. */
function CardResumen({ label, valor, color = 'text-gray-800' }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{valor}</p>
    </div>
  );
}

/**
 * Verificación de errores de codificación de los usuarios NUEVOS de un periodo.
 * Regla (en la misma cita): el diagnóstico CIE-10 debe ser definitivo (D) y debe
 * existir el código PAI 99366.
 */
export default function FormVerificacionCodificacion({ volver, tipoSeleccionado }) {
  const [periodos, setPeriodos] = useState([]);
  const [cargandoPeriodos, setCargandoPeriodos] = useState(true);
  const [periodoSel, setPeriodoSel] = useState(''); // "anio-mes"
  const [verificando, setVerificando] = useState(false);
  const [resultado, setResultado] = useState(null); // { periodo, resumen, filas }
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState(null);

  // Cargar la lista de periodos disponibles.
  useEffect(() => {
    obtenerPeriodosDatos()
      .then((data) => setPeriodos(Array.isArray(data) ? data : []))
      .catch(() => setError('No se pudieron cargar los periodos.'))
      .finally(() => setCargandoPeriodos(false));
  }, []);

  const parsearPeriodo = () => {
    const [anio, mes] = periodoSel.split('-').map(Number);
    return { anio, mes };
  };

  const handleVerificar = async () => {
    if (!periodoSel) return;
    const { anio, mes } = parsearPeriodo();
    setVerificando(true);
    setError(null);
    setResultado(null);
    try {
      const data = await obtenerVerificacionCodificacion(anio, mes);
      setResultado(data);
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Error al verificar.');
    } finally {
      setVerificando(false);
    }
  };

  const handleDescargar = async () => {
    if (!periodoSel) return;
    const { anio, mes } = parsearPeriodo();
    setDescargando(true);
    setError(null);
    try {
      await descargarVerificacionCodificacion(anio, mes);
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Error al descargar.');
    } finally {
      setDescargando(false);
    }
  };

  const r = resultado?.resumen;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <button
          onClick={volver}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft size={16} />
          Volver
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{tipoSeleccionado?.nombre ?? 'Verificación de Codificación'}</h1>
          <p className="text-sm text-gray-500">{tipoSeleccionado?.descripcion}</p>
        </div>
      </div>

      {/* Controles */}
      <div className="rounded-xl glass-card border border-outline-variant/20 shadow-[0_4px_16px_rgba(27,94,83,0.04)] p-6 space-y-4">
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          <ShieldCheck size={18} className="mt-0.5 shrink-0" />
          <span>
            Revisa las <strong>aperturas de paquete</strong> del periodo: la primera vez que un paciente
            presenta un diagnóstico, en una cita <strong>Nuevo (N)</strong> o <strong>Reingreso (R)</strong>.
            Esa cita debe tener el diagnóstico en <strong>Definitivo (D)</strong> y el código <strong>PAI 99366</strong>.
            En las atenciones siguientes el Dx pasa a Repetido y ya no se exigen.
          </span>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periodo a verificar:</label>
            <select
              value={periodoSel}
              onChange={(e) => { setPeriodoSel(e.target.value); setResultado(null); setError(null); }}
              disabled={cargandoPeriodos}
              className="rounded-lg border border-gray-300 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            >
              <option value="">{cargandoPeriodos ? 'Cargando periodos…' : '— Seleccionar mes —'}</option>
              {periodos.map((p) => (
                <option key={`${p.anio}-${p.mes}`} value={`${p.anio}-${p.mes}`}>
                  {etiquetaPeriodo(p)} ({p.citas} citas)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleVerificar}
            disabled={!periodoSel || verificando}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {verificando ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Verificar
          </button>

          {resultado && resultado.filas.length > 0 && (
            <button
              onClick={handleDescargar}
              disabled={descargando}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {descargando ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} className="text-gray-500" />}
              Descargar .docx
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            <AlertTriangle size={16} /> {error}
          </div>
        )}
      </div>

      {/* Resumen */}
      {r && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <CardResumen label={`Aperturas (N:${r.nuevos} · R:${r.reingresos})`} valor={r.total} />
          <CardResumen label="Correctas" valor={r.ok} color="text-green-600" />
          <CardResumen label="Con errores" valor={r.con_errores} color="text-red-600" />
          <CardResumen label="Dx no definitivo" valor={r.dx_no_definitivo} color="text-amber-600" />
          <CardResumen label="Sin 99366" valor={r.sin_pai} color="text-amber-600" />
        </div>
      )}

      {/* Tabla de resultados */}
      {resultado && (
        resultado.filas.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 py-10 text-center">
            <CheckCircle2 size={32} className="mx-auto mb-2 text-gray-400" />
            <p className="font-medium text-gray-700">No hay aperturas de paquete en este periodo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-3">Fecha</th>
                  <th className="px-3 py-3">Nombres y apellidos</th>
                  <th className="px-3 py-3">DNI</th>
                  <th className="px-3 py-3">Profesional</th>
                  <th className="px-3 py-3">Condición</th>
                  <th className="px-3 py-3">Dx (CIE-10)</th>
                  <th className="px-3 py-3">Tipo Dx</th>
                  <th className="px-3 py-3 text-center">PAI 99366</th>
                  <th className="px-3 py-3">Estado / Observación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {resultado.filas.map((f) => {
                  const esError = f.estado === 'error';
                  return (
                    <tr key={f.id_cita} className={esError ? 'bg-red-50/40' : ''}>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-600">{formatearFecha(f.fecha_atencion)}</td>
                      <td className="px-3 py-2 font-medium text-gray-800">{f.nombre}</td>
                      <td className="px-3 py-2 font-mono text-xs text-gray-500">{f.dni}</td>
                      <td className="px-3 py-2 text-gray-700">{f.profesional}</td>
                      <td className="px-3 py-2">
                        <Badge color={f.cond === 'R' ? 'amber' : 'blue'}>{f.cond_label}</Badge>
                      </td>
                      <td className="px-3 py-2 font-mono text-gray-700">{f.dx}</td>
                      <td className="px-3 py-2">
                        <Badge color={f.tipo_dx === 'D' ? 'green' : (f.tipo_dx ? 'red' : 'gray')}>
                          {f.tipo_dx_label}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Badge color={f.tiene_pai ? 'green' : 'red'}>{f.tiene_pai ? 'Sí' : 'No'}</Badge>
                      </td>
                      <td className="px-3 py-2">
                        {esError ? (
                          <span className="flex items-center gap-1.5 text-red-600">
                            <AlertTriangle size={14} className="shrink-0" />
                            {f.errores.join('; ')}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-green-600">
                            <CheckCircle2 size={14} className="shrink-0" /> Correcto
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
