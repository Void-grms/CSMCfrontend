import { useState, useEffect, useCallback, useMemo } from 'react';
import Badge from '../components/ui/Badge';
import { obtenerPaquetesPaginados } from '../services/api';
import { Eye, RefreshCw, X, ChevronDown, Loader2 } from 'lucide-react';

const PAGE_SIZE = 50;

function colorEstado(estado) {
  if (estado === 'completado') return 'green';
  if (estado === 'vencido') return 'red';
  return 'blue';
}

function DiasRestantes({ fechaLimite }) {
  if (!fechaLimite) return <span className="text-gray-400">—</span>;
  const diff = Math.ceil((new Date(fechaLimite) - new Date()) / 86400000);
  if (diff < 0)
    return <span className="text-red-600 font-semibold">{Math.abs(diff)}d vencido</span>;
  if (diff <= 7)
    return <span className="text-orange-500 font-semibold">{diff}d</span>;
  if (diff <= 30)
    return <span className="text-yellow-600 font-semibold">{diff}d</span>;
  return <span className="text-green-600">{diff}d</span>;
}

function BarraAvance({ porcentaje }) {
  const pct = Math.min(Math.max(porcentaje ?? 0, 0), 100);
  let color = 'bg-blue-500';
  if (pct >= 100) color = 'bg-green-500';
  else if (pct >= 60) color = 'bg-sky-500';
  else if (pct >= 30) color = 'bg-yellow-500';
  else color = 'bg-red-400';

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-10 text-right">{Math.round(pct)}%</span>
    </div>
  );
}

const ESTADOS = ['abierto', 'completado', 'vencido', 'todos'];
const CAMPOS_FECHA = [
  { value: 'fecha_inicio', label: 'Fecha inicio' },
  { value: 'fecha_limite', label: 'Fecha límite' },
];
const ORDEN_DIAS = [
  { value: 'ninguno', label: 'Sin orden' },
  { value: 'asc',     label: '↑ Menos días primero' },
  { value: 'desc',    label: '↓ Más días primero' },
];

export default function Paquetes() {

  // ── Datos y paginación ───────────────────────────────
  const [paquetes, setPaquetes]             = useState([]);
  const [cargando, setCargando]             = useState(false);
  const [cargandoMas, setCargandoMas]       = useState(false);
  const [error, setError]                   = useState(null);
  const [hayMas, setHayMas]                 = useState(true);
  const [offset, setOffset]                 = useState(0);

  // ── Filtros ──────────────────────────────────────────
  const [filtroEstado, setFiltroEstado]     = useState('abierto');
  const [filtroTipo, setFiltroTipo]         = useState('todos');
  const [campofecha, setCampoFecha]         = useState('fecha_inicio');
  const [fechaDesde, setFechaDesde]         = useState('');
  const [fechaHasta, setFechaHasta]         = useState('');
  const [ordenDias, setOrdenDias]           = useState('ninguno');

  // ── Tipos de paquetes (cargados dinámicamente una vez) ──
  const [tiposPaquete, setTiposPaquete]     = useState([]);

  // Construir parámetros de consulta
  const buildParams = useCallback((customOffset) => {
    const params = {
      limite: PAGE_SIZE,
      offset: customOffset ?? 0,
    };
    if (filtroEstado !== 'todos') params.estado = filtroEstado;
    if (filtroTipo !== 'todos') params.tipo = filtroTipo;
    if (fechaDesde) { params.campoFecha = campofecha; params.fechaDesde = fechaDesde; }
    if (fechaHasta) { params.campoFecha = campofecha; params.fechaHasta = fechaHasta; }
    if (ordenDias !== 'ninguno') params.ordenDias = ordenDias;
    return params;
  }, [filtroEstado, filtroTipo, campofecha, fechaDesde, fechaHasta, ordenDias]);

  // ── Cargar primer bloque (reset) ─────────────────────
  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    setOffset(0);
    setHayMas(true);
    try {
      const data = await obtenerPaquetesPaginados(buildParams(0));
      setPaquetes(data);
      setHayMas(data.length >= PAGE_SIZE);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setCargando(false);
    }
  }, [buildParams]);

  // ── Cargar más (siguiente bloque) ────────────────────
  const cargarMas = useCallback(async () => {
    const nextOffset = offset + PAGE_SIZE;
    setCargandoMas(true);
    try {
      const data = await obtenerPaquetesPaginados(buildParams(nextOffset));
      setPaquetes(prev => [...prev, ...data]);
      setOffset(nextOffset);
      setHayMas(data.length >= PAGE_SIZE);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setCargandoMas(false);
    }
  }, [offset, buildParams]);

  // Cargar al montar y cuando cambian los filtros
  useEffect(() => { cargar(); }, [filtroEstado, filtroTipo, campofecha, fechaDesde, fechaHasta, ordenDias]);

  // Cargar tipos de paquete una sola vez (sin filtros, solo nombres únicos)
  useEffect(() => {
    obtenerPaquetesPaginados({ limite: 2000 })
      .then(data => {
        const mapa = new Map();
        data.forEach(p => {
          if (p.id_paquete && !mapa.has(p.id_paquete))
            mapa.set(p.id_paquete, p.nombre_paquete ?? p.id_paquete);
        });
        setTiposPaquete([...mapa.entries()].sort((a, b) => a[1].localeCompare(b[1])));
      })
      .catch(() => {}); // silently fail
  }, []);

  const hayFiltrosActivos =
    filtroEstado !== 'abierto' || filtroTipo !== 'todos' ||
    fechaDesde !== '' || fechaHasta !== '' || ordenDias !== 'ninguno';

  const limpiarFiltros = () => {
    setFiltroEstado('abierto'); setFiltroTipo('todos');
    setCampoFecha('fecha_inicio'); setFechaDesde('');
    setFechaHasta(''); setOrdenDias('ninguno');
  };

  return (
    <div className="p-4 space-y-4">

      {/* Cabecera */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold text-gray-800">Paquetes de atención</h1>
        <div className="flex items-center gap-2">
          {hayFiltrosActivos && (
            <button onClick={limpiarFiltros}
              className="flex items-center gap-1 text-sm text-red-600 border border-red-300 px-2 py-1 rounded hover:bg-red-50">
              <X size={14} /> Limpiar filtros
            </button>
          )}
          <button onClick={cargar} disabled={cargando}
            className="flex items-center gap-1 text-sm text-blue-600 border border-blue-300 px-2 py-1 rounded hover:bg-blue-50 disabled:opacity-50">
            <RefreshCw size={14} className={cargando ? 'animate-spin' : ''} /> Recargar
          </button>
        </div>
      </div>

      {/* Panel de filtros */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Estado */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</label>
          <div className="flex flex-wrap gap-1">
            {ESTADOS.map((e) => (
              <button key={e} onClick={() => setFiltroEstado(e)}
                className={`px-3 py-1 rounded-full text-sm border transition ${
                  filtroEstado === e
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
                {e.charAt(0).toUpperCase() + e.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tipo de paquete */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo de paquete</label>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:ring-1 focus:ring-blue-400">
            <option value="todos">Todos los tipos</option>
            {tiposPaquete.map(([id, nombre]) => (
              <option key={id} value={id}>{nombre}</option>
            ))}
          </select>
        </div>

        {/* Orden días */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ordenar por días restantes</label>
          <select value={ordenDias} onChange={(e) => setOrdenDias(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:ring-1 focus:ring-blue-400">
            {ORDEN_DIAS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Rango de fechas */}
        <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-3">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rango de fechas</label>
          <div className="flex flex-wrap items-center gap-2">
            <select value={campofecha} onChange={(e) => setCampoFecha(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:ring-1 focus:ring-blue-400">
              {CAMPOS_FECHA.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <span className="text-gray-400 text-sm">desde</span>
            <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-400" />
            <span className="text-gray-400 text-sm">hasta</span>
            <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-400" />
            {(fechaDesde || fechaHasta) && (
              <button onClick={() => { setFechaDesde(''); setFechaHasta(''); }}
                className="text-gray-400 hover:text-red-500" title="Limpiar fechas">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contador */}
      <p className="text-sm text-gray-500">
        {cargando ? 'Cargando…'
          : `${paquetes.length} paquete${paquetes.length !== 1 ? 's' : ''} cargado${paquetes.length !== 1 ? 's' : ''}${hayFiltrosActivos ? ' (con filtros activos)' : ''}`}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">{error}</div>
      )}

      {/* Tabla */}
      {!cargando && paquetes.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">
          No hay paquetes con los filtros seleccionados.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left">Paciente</th>
                <th className="px-4 py-2 text-left">DNI</th>
                <th className="px-4 py-2 text-left">Tipo paquete</th>
                <th className="px-4 py-2 text-left">Avance</th>
                <th className="px-4 py-2 text-left">Inicio</th>
                <th className="px-4 py-2 text-left">Límite</th>
                <th className="px-4 py-2 text-left">Días rest.</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paquetes.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50 transition">
                  <td className="px-4 py-2 font-medium">{p.paciente_nombre ?? p.id_paciente}</td>
                  <td className="px-4 py-2 text-gray-500">{p.dni ?? '—'}</td>
                  <td className="px-4 py-2">
                    <span className="font-mono text-xs text-gray-400">{p.id_paquete}</span>
                    {p.nombre_paquete && <span className="ml-1 text-gray-700">{p.nombre_paquete}</span>}
                  </td>
                  <td className="px-4 py-2"><BarraAvance porcentaje={p.porcentaje_avance} /></td>
                  <td className="px-4 py-2 text-gray-500">
                    {p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString('es-PE') : '—'}
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {p.fecha_limite ? new Date(p.fecha_limite).toLocaleDateString('es-PE') : '—'}
                  </td>
                  <td className="px-4 py-2"><DiasRestantes fechaLimite={p.fecha_limite} /></td>
                  <td className="px-4 py-2"><Badge color={colorEstado(p.estado)}>{p.estado}</Badge></td>
                  <td className="px-4 py-2">
                    <button onClick={() => window.open(`/paquetes/${p.id}`, '_blank')}
                      className="text-blue-500 hover:text-blue-700" title="Ver detalle (nueva pestaña)">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Botón Cargar más */}
      {!cargando && hayMas && paquetes.length > 0 && (
        <div className="flex justify-center pt-2">
          <button onClick={cargarMas} disabled={cargandoMas}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition disabled:opacity-50">
            {cargandoMas
              ? <><Loader2 size={16} className="animate-spin" /> Cargando…</>
              : <><ChevronDown size={16} /> Cargar más paquetes</>
            }
          </button>
        </div>
      )}

      {/* Indicador de carga inicial */}
      {cargando && (
        <div className="flex justify-center py-8">
          <Loader2 size={28} className="animate-spin text-blue-500" />
        </div>
      )}
    </div>
  );
}