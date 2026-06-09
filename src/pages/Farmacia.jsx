import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import { useAuth } from '../context/AuthContext';
import {
  obtenerFarmaciaResumen,
  obtenerFarmaciaPacientes,
  obtenerConfigFarmacia,
  editarConfigFarmacia,
} from '../services/api';
import {
  Pill, Search, RefreshCw, Loader2, Eye, Settings2,
  AlertTriangle, Clock, CheckCircle2, Save, X,
} from 'lucide-react';
import { formatearFecha } from '../utils/fecha';

// Metadatos de cada estado del semáforo.
const ESTADO_META = {
  vencido:  { label: 'Vencido',  color: 'red' },
  proximo:  { label: 'Próximo',  color: 'amber' },
  al_dia:   { label: 'Al día',   color: 'green' },
  inactivo: { label: 'Inactivo', color: 'gray' },
};

const FILTROS_ESTADO = [
  { value: 'todos',   label: 'Todos' },
  { value: 'vencido', label: 'Vencidos' },
  { value: 'proximo', label: 'Próximos' },
  { value: 'al_dia',  label: 'Al día' },
];

const fmtFecha = formatearFecha;

function DiasRestantes({ dias, estado }) {
  if (estado === 'inactivo' || dias == null) return <span className="text-gray-400">—</span>;
  if (dias < 0) return <span className="text-red-600 font-semibold">{Math.abs(dias)}d vencido</span>;
  if (dias === 0) return <span className="text-amber-600 font-semibold">Hoy</span>;
  return <span className={dias <= 5 ? 'text-amber-600 font-semibold' : 'text-green-600'}>{dias}d</span>;
}

// ── Panel de configuración global (solo admin) ───────────────────────────────
function PanelConfig({ onClose }) {
  const [form, setForm] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    obtenerConfigFarmacia().then(setForm).catch((e) => setError(e?.response?.data?.error || e.message));
  }, []);

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    setOk(false);
    try {
      await editarConfigFarmacia({
        intervalo_default_dias:  Number(form.intervalo_default_dias),
        ventana_relevancia_dias: Number(form.ventana_relevancia_dias),
        dias_aviso_previo:       Number(form.dias_aviso_previo),
      });
      setOk(true);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setGuardando(false);
    }
  };

  const campo = (key, label, ayuda) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <input
        type="number"
        min="0"
        value={form?.[key] ?? ''}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-400 w-28"
      />
      <span className="text-[11px] text-gray-400">{ayuda}</span>
    </div>
  );

  return (
    <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Settings2 size={15} /> Configuración global
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-red-500" aria-label="Cerrar">
          <X size={16} />
        </button>
      </div>

      {form ? (
        <>
          <div className="flex flex-wrap gap-4">
            {campo('intervalo_default_dias', 'Intervalo por defecto', 'Días entre entregas si el paciente no tiene uno propio.')}
            {campo('ventana_relevancia_dias', 'Ventana de relevancia', 'Si la última entrega es más antigua, el paciente pasa a "inactivo".')}
            {campo('dias_aviso_previo', 'Aviso previo', 'Días antes de la fecha en que se marca como "próximo".')}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {ok && <p className="text-sm text-green-600">Configuración guardada.</p>}
          <button
            onClick={guardar}
            disabled={guardando}
            className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {guardando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar
          </button>
        </>
      ) : (
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      )}
    </div>
  );
}

export default function Farmacia() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const esAdmin = user?.rol === 'admin';

  const [resumen, setResumen] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Filtros
  const [estado, setEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const [mostrarConfig, setMostrarConfig] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const params = {};
      if (estado !== 'todos') params.estado = estado;
      if (busqueda.trim()) params.q = busqueda.trim();
      if (incluirInactivos) params.incluirInactivos = 1;

      const [res, pac] = await Promise.all([
        obtenerFarmaciaResumen(),
        obtenerFarmaciaPacientes(params),
      ]);
      setResumen(res);
      setPacientes(pac);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setCargando(false);
    }
  }, [estado, busqueda, incluirInactivos]);

  // Recargar al cambiar filtros (con pequeño debounce para la búsqueda).
  useEffect(() => {
    const t = setTimeout(cargar, 250);
    return () => clearTimeout(t);
  }, [cargar]);

  const columnas = [
    {
      key: 'paciente',
      label: 'Paciente',
      render: (r) => (
        <div className="min-w-0">
          <p className="font-medium text-on-surface break-words">{r.nombre_paciente || r.id_paciente}</p>
          <p className="text-[11px] text-gray-500 font-mono">DNI {r.dni || '—'}</p>
        </div>
      ),
    },
    { key: 'ultima', label: 'Última entrega', render: (r) => <span className="text-xs text-gray-600">{fmtFecha(r.ultima_dispensacion)}</span> },
    { key: 'proxima', label: 'Próxima esperada', render: (r) => <span className="text-xs text-gray-600">{fmtFecha(r.proxima_fecha)}</span> },
    { key: 'dias', label: 'Días', render: (r) => <DiasRestantes dias={r.dias_restantes} estado={r.estado} /> },
    {
      key: 'intervalo',
      label: 'Intervalo',
      render: (r) => (
        <span className="text-xs text-gray-600">
          {r.intervalo_dias}d{' '}
          {r.intervalo_personalizado && <Badge color="blue">propio</Badge>}
        </span>
      ),
    },
    { key: 'total', label: 'Entregas', render: (r) => <span className="text-xs text-gray-600">{r.total_dispensaciones}</span> },
    {
      key: 'estado',
      label: 'Estado',
      render: (r) => <Badge color={ESTADO_META[r.estado]?.color}>{ESTADO_META[r.estado]?.label ?? r.estado}</Badge>,
    },
    {
      key: 'accion',
      label: '',
      render: (r) => (
        <button
          onClick={() => navigate(`/farmacia/${r.id_paciente}`)}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
          title="Ver historial"
        >
          <Eye size={14} /> Ver
        </button>
      ),
    },
  ];

  return (
    <div className="p-2 sm:p-4 space-y-4">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <Pill size={20} className="text-primary" /> Farmacia — Dispensación de medicamentos
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          {esAdmin && (
            <button
              onClick={() => setMostrarConfig((v) => !v)}
              className="flex items-center gap-1 text-sm text-gray-700 border border-gray-300 px-2 py-1 rounded hover:bg-gray-50"
            >
              <Settings2 size={14} /> Configuración
            </button>
          )}
          <button
            onClick={cargar}
            disabled={cargando}
            className="flex items-center gap-1 text-sm text-blue-600 border border-blue-300 px-2 py-1 rounded hover:bg-blue-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={cargando ? 'animate-spin' : ''} /> Recargar
          </button>
        </div>
      </div>

      {esAdmin && mostrarConfig && <PanelConfig onClose={() => setMostrarConfig(false)} />}

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <Card titulo="En seguimiento" valor={resumen?.en_seguimiento ?? '—'} icono={Pill} color="text-primary" />
        <Card titulo="Vencidos" valor={resumen?.vencido ?? '—'} icono={AlertTriangle} color="text-error" />
        <Card titulo="Próximos" valor={resumen?.proximo ?? '—'} icono={Clock} color="text-amber-500" />
        <Card titulo="Al día" valor={resumen?.al_dia ?? '—'} icono={CheckCircle2} color="text-green-600" />
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-end gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</label>
          <div className="flex flex-wrap gap-1">
            {FILTROS_ESTADO.map((e) => (
              <button
                key={e.value}
                onClick={() => setEstado(e.value)}
                className={`px-3 py-1 rounded-full text-sm border transition ${
                  estado === e.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Buscar</label>
          <div className="flex items-center border border-gray-300 rounded px-2 bg-white focus-within:ring-1 focus-within:ring-blue-400">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre o DNI…"
              className="flex-1 text-sm py-1.5 px-2 bg-transparent outline-none"
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')} className="text-gray-400 hover:text-red-500" aria-label="Limpiar búsqueda">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={incluirInactivos}
            onChange={(e) => setIncluirInactivos(e.target.checked)}
            className="rounded border-gray-300"
          />
          Incluir inactivos
        </label>
      </div>

      {/* Contador */}
      <p className="text-sm text-gray-500">
        {cargando
          ? 'Cargando…'
          : `${pacientes.length} paciente${pacientes.length !== 1 ? 's' : ''} con dispensaciones`}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">{error}</div>
      )}

      {/* Tabla */}
      <Table
        columns={columnas}
        data={pacientes}
        loading={cargando}
        emptyMessage="No hay pacientes con dispensaciones para este filtro."
      />
    </div>
  );
}
