import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import {
  obtenerFarmaciaPaciente,
  editarIntervaloPaciente,
  guardarNotaDispensacion,
} from '../services/api';
import {
  ArrowLeft, Loader2, Save, Pill, Edit3, X, Check, Pause, Play,
} from 'lucide-react';
import { formatearFecha } from '../utils/fecha';

const ESTADO_META = {
  vencido:  { label: 'Vencido',  color: 'red' },
  proximo:  { label: 'Próximo',  color: 'amber' },
  al_dia:   { label: 'Al día',   color: 'green' },
  inactivo: { label: 'Inactivo', color: 'gray' },
};

const fmtFecha = formatearFecha;

// ── Fila del historial con edición inline de la nota (solo admin) ─────────────
function FilaEntrega({ entrega, esAdmin, onGuardada }) {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    medicamento: entrega.medicamento || '',
    cantidad: entrega.cantidad || '',
    observaciones: entrega.observaciones || '',
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      await guardarNotaDispensacion(entrega.id_cita, entrega.id_correlativo, form);
      setEditando(false);
      onGuardada?.();
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setGuardando(false);
    }
  };

  if (editando) {
    return (
      <tr className="bg-blue-50/40 align-top">
        <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{fmtFecha(entrega.fecha_atencion)}</td>
        <td className="px-3 py-2 text-xs font-mono text-gray-700">{entrega.dx || '—'}</td>
        <td className="px-3 py-2 text-xs text-gray-700">{entrega.num_dispensacion ?? '—'}</td>
        <td className="px-3 py-2">
          <input
            value={form.medicamento}
            onChange={(e) => setForm((f) => ({ ...f, medicamento: e.target.value }))}
            placeholder="Medicamento"
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-400"
          />
        </td>
        <td className="px-3 py-2">
          <input
            value={form.cantidad}
            onChange={(e) => setForm((f) => ({ ...f, cantidad: e.target.value }))}
            placeholder="Cantidad"
            className="w-24 border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-400"
          />
        </td>
        <td className="px-3 py-2" colSpan={2}>
          <input
            value={form.observaciones}
            onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value }))}
            placeholder="Observaciones"
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-400"
          />
          {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
        </td>
        <td className="px-3 py-2 whitespace-nowrap">
          <div className="flex items-center gap-1">
            <button onClick={guardar} disabled={guardando} className="text-green-600 hover:text-green-800 disabled:opacity-50" title="Guardar">
              {guardando ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            </button>
            <button onClick={() => setEditando(false)} className="text-gray-400 hover:text-red-500" title="Cancelar">
              <X size={15} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50 align-top">
      <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">{fmtFecha(entrega.fecha_atencion)}</td>
      <td className="px-3 py-2 text-xs font-mono font-semibold text-gray-800">{entrega.dx || <span className="text-gray-300">—</span>}</td>
      <td className="px-3 py-2">
        {entrega.num_dispensacion != null
          ? <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-bold">N° {entrega.num_dispensacion}</span>
          : <span className="text-gray-300 text-xs">—</span>}
      </td>
      <td className="px-3 py-2 text-xs text-gray-700">{entrega.medicamento || <span className="text-gray-300">—</span>}</td>
      <td className="px-3 py-2 text-xs text-gray-700">{entrega.cantidad || <span className="text-gray-300">—</span>}</td>
      <td className="px-3 py-2 text-xs text-gray-600">{entrega.observaciones || <span className="text-gray-300">—</span>}</td>
      <td className="px-3 py-2 text-xs text-gray-500">{entrega.nombre_profesional || <span className="text-gray-300">—</span>}</td>
      <td className="px-3 py-2 whitespace-nowrap">
        {esAdmin && (
          <button
            onClick={() => setEditando(true)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
            title="Editar nota"
          >
            <Edit3 size={13} /> Nota
          </button>
        )}
      </td>
    </tr>
  );
}

export default function FarmaciaPacienteDetalle() {
  const { idPaciente } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const esAdmin = user?.rol === 'admin';

  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Edición de intervalo
  const [intervalo, setIntervalo] = useState('');
  const [activo, setActivo] = useState(true);
  const [guardandoInt, setGuardandoInt] = useState(false);
  const [okInt, setOkInt] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const d = await obtenerFarmaciaPaciente(idPaciente);
      setData(d);
      if (d?.estado) {
        setIntervalo(String(d.estado.intervalo_dias ?? ''));
        setActivo(d.estado.activo ?? true);
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setCargando(false);
    }
  }, [idPaciente]);

  useEffect(() => { cargar(); }, [cargar]);

  const guardarIntervalo = async () => {
    setGuardandoInt(true);
    setOkInt(false);
    setError(null);
    try {
      await editarIntervaloPaciente(idPaciente, {
        intervalo_dias: Number(intervalo),
        activo,
      });
      setOkInt(true);
      await cargar();
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setGuardandoInt(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={28} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-4 space-y-3">
        <button onClick={() => navigate('/farmacia')} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
          <ArrowLeft size={15} /> Volver
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">{error}</div>
      </div>
    );
  }

  const { paciente, estado, historial = [] } = data || {};
  const meta = estado ? ESTADO_META[estado.estado] : null;

  return (
    <div className="p-2 sm:p-4 space-y-4 max-w-5xl">
      {/* Volver */}
      <button onClick={() => navigate('/farmacia')} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
        <ArrowLeft size={15} /> Volver a Farmacia
      </button>

      {/* Cabecera del paciente */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Pill size={18} className="text-primary" />
            {paciente?.nombre_paciente || paciente?.id_paciente}
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            DNI {paciente?.dni || '—'} · HC {paciente?.historia_clinica || '—'}
          </p>
        </div>
        {meta && <Badge color={meta.color}>{meta.label}</Badge>}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">{error}</div>
      )}

      {/* Estado de dispensación */}
      {estado ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          <Dato label="Diagnóstico (Dx)" valor={estado.dx_actual || '—'} />
          <Dato label="N° dispensación" valor={estado.num_dispensacion_actual != null ? `N° ${estado.num_dispensacion_actual}` : '—'} />
          <Dato label="Última entrega" valor={fmtFecha(estado.ultima_dispensacion)} />
          <Dato label="Próxima esperada" valor={fmtFecha(estado.proxima_fecha)} />
          <Dato
            label="Días restantes"
            valor={
              estado.estado === 'inactivo'
                ? '—'
                : estado.dias_restantes < 0
                ? `${Math.abs(estado.dias_restantes)}d vencido`
                : `${estado.dias_restantes}d`
            }
          />
          <Dato label="Intervalo" valor={`${estado.intervalo_dias}d${estado.intervalo_personalizado ? ' (propio)' : ''}`} />
          <Dato label="Total entregas" valor={estado.total_dispensaciones} />
          <Dato label="Primera entrega" valor={fmtFecha(estado.primera_dispensacion)} />
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded text-sm">
          Este paciente aún no tiene dispensaciones registradas (código 99199.05).
        </div>
      )}

      {/* Configuración del intervalo (solo admin) */}
      {esAdmin && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Configuración del paciente</h3>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Intervalo (días)</label>
              <input
                type="number"
                min="1"
                value={intervalo}
                onChange={(e) => setIntervalo(e.target.value)}
                className="w-28 border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <button
              onClick={() => setActivo((v) => !v)}
              className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded border transition ${
                activo
                  ? 'border-green-300 text-green-700 hover:bg-green-50'
                  : 'border-gray-300 text-gray-500 hover:bg-gray-100'
              }`}
              title={activo ? 'Alertas activas — clic para pausar' : 'Alertas pausadas — clic para activar'}
            >
              {activo ? <Play size={14} /> : <Pause size={14} />}
              {activo ? 'Alertas activas' : 'Alertas pausadas'}
            </button>
            <button
              onClick={guardarIntervalo}
              disabled={guardandoInt}
              className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {guardandoInt ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar
            </button>
            {okInt && <span className="text-sm text-green-600">Guardado.</span>}
          </div>
          <p className="text-[11px] text-gray-400">
            Si el paciente no necesita un intervalo propio, déjalo en el valor por defecto del sistema.
            Pausar las alertas lo mantiene en el historial pero lo marca como inactivo en el listado.
          </p>
        </div>
      )}

      {/* Historial de entregas */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Historial de entregas ({historial.length})</h3>
        {historial.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">Sin entregas registradas.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Dx</th>
                  <th className="px-3 py-2 text-left">N° disp.</th>
                  <th className="px-3 py-2 text-left">Medicamento</th>
                  <th className="px-3 py-2 text-left">Cantidad</th>
                  <th className="px-3 py-2 text-left">Observaciones</th>
                  <th className="px-3 py-2 text-left">Profesional</th>
                  <th className="px-3 py-2 text-left"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historial.map((e) => (
                  <FilaEntrega
                    key={`${e.id_cita}-${e.id_correlativo}`}
                    entrega={e}
                    esAdmin={esAdmin}
                    onGuardada={cargar}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Pequeña celda de dato (label + valor).
function Dato({ label, valor }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 min-w-0">
      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-gray-800 truncate">{valor}</p>
    </div>
  );
}
