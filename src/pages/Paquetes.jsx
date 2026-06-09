import { useState, useEffect, useCallback, useRef } from 'react';
import { saveAs } from 'file-saver';
import Badge from '../components/ui/Badge';
import { obtenerPaquetesPaginados } from '../services/api';
import { Eye, RefreshCw, X, ChevronDown, Loader2, Download, Search } from 'lucide-react';
import { formatearFecha } from '../utils/fecha';

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

// ── Combobox genérico: escritura + multi-selección con chips ─────────────────
function MultiSelectCombobox({ opciones, seleccionados, onChange, placeholder, placeholderAdd }) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const seleccionadosSet = new Set(seleccionados);
  const filtradas = opciones.filter(([id, nombre]) => {
    if (seleccionadosSet.has(id)) return false;
    if (!texto.trim()) return true;
    const t = texto.toLowerCase();
    return nombre.toLowerCase().includes(t) || id.toLowerCase().includes(t);
  });

  const agregar = (id) => {
    if (!seleccionadosSet.has(id)) onChange([...seleccionados, id]);
    setTexto('');
  };
  const quitar = (id) => onChange(seleccionados.filter(s => s !== id));
  const nombreDe = (id) => {
    const op = opciones.find(([oid]) => oid === id);
    return op ? op[1] : id;
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className="min-h-[34px] flex flex-wrap items-center gap-1 border border-gray-300 rounded px-2 py-1 bg-white focus-within:ring-1 focus-within:ring-blue-400 cursor-text"
        onClick={() => setAbierto(true)}
      >
        {seleccionados.map(id => (
          <span key={id} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
            {nombreDe(id)}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); quitar(id); }}
              className="hover:text-blue-900"
              aria-label={`Quitar ${nombreDe(id)}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <div className="flex items-center flex-1 min-w-[120px]">
          <Search size={12} className="text-gray-400 mr-1 shrink-0" />
          <input
            type="text"
            value={texto}
            onChange={(e) => { setTexto(e.target.value); setAbierto(true); }}
            onFocus={() => setAbierto(true)}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !texto && seleccionados.length) {
                quitar(seleccionados[seleccionados.length - 1]);
              }
              if (e.key === 'Enter' && filtradas.length) {
                e.preventDefault();
                agregar(filtradas[0][0]);
              }
            }}
            placeholder={seleccionados.length ? (placeholderAdd ?? 'Añadir otro…') : (placeholder ?? 'Escribe para buscar…')}
            className="flex-1 text-sm bg-transparent outline-none"
          />
        </div>
        {seleccionados.length > 0 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange([]); }}
            className="text-gray-400 hover:text-red-500"
            title="Limpiar selección"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {abierto && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filtradas.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-400">
              {opciones.length === 0 ? 'Cargando…' : 'Sin coincidencias'}
            </div>
          ) : filtradas.slice(0, 100).map(([id, nombre]) => (
            <button
              type="button"
              key={id}
              onClick={() => agregar(id)}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 flex justify-between items-center gap-2"
            >
              <span className="truncate">{nombre}</span>
              <span className="font-mono text-[10px] text-gray-400 shrink-0">{id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [tiposSeleccionados, setTiposSeleccionados] = useState([]); // string[]
  const [dxsSeleccionados, setDxsSeleccionados]     = useState([]); // string[]
  const [campofecha, setCampoFecha]         = useState('fecha_inicio');
  const [fechaDesde, setFechaDesde]         = useState('');
  const [fechaHasta, setFechaHasta]         = useState('');
  const [ordenDias, setOrdenDias]           = useState('ninguno');

  // ── Descarga ─────────────────────────────────────────
  const [descargando, setDescargando]       = useState(false);

  // ── Opciones dinámicas (cargadas una vez) ────────────
  const [tiposPaquete, setTiposPaquete]     = useState([]); // [[id, nombre], …]
  const [dxsDisponibles, setDxsDisponibles] = useState([]); // [[codigo, codigo], …]

  // Construir parámetros de consulta
  const buildParams = useCallback((customOffset) => {
    const params = {
      limite: PAGE_SIZE,
      offset: customOffset ?? 0,
    };
    if (filtroEstado !== 'todos') params.estado = filtroEstado;
    if (tiposSeleccionados.length > 0) params.tipo = tiposSeleccionados.join(',');
    if (dxsSeleccionados.length > 0) params.dx = dxsSeleccionados.join(',');
    if (fechaDesde) { params.campoFecha = campofecha; params.fechaDesde = fechaDesde; }
    if (fechaHasta) { params.campoFecha = campofecha; params.fechaHasta = fechaHasta; }
    if (ordenDias !== 'ninguno') params.ordenDias = ordenDias;
    return params;
  }, [filtroEstado, tiposSeleccionados, dxsSeleccionados, campofecha, fechaDesde, fechaHasta, ordenDias]);

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
  useEffect(() => { cargar(); }, [filtroEstado, tiposSeleccionados, dxsSeleccionados, campofecha, fechaDesde, fechaHasta, ordenDias]);

  // Cargar tipos de paquete y diagnósticos una sola vez (catálogos derivados)
  useEffect(() => {
    obtenerPaquetesPaginados({ limite: 2000 })
      .then(data => {
        const tiposMap = new Map();
        const dxSet = new Set();
        data.forEach(p => {
          if (p.id_paquete && !tiposMap.has(p.id_paquete))
            tiposMap.set(p.id_paquete, p.nombre_paquete ?? p.id_paquete);
          if (p.dx_principal) dxSet.add(p.dx_principal);
        });
        setTiposPaquete([...tiposMap.entries()].sort((a, b) => a[1].localeCompare(b[1])));
        setDxsDisponibles(
          [...dxSet].sort((a, b) => a.localeCompare(b)).map(d => [d, d])
        );
      })
      .catch(() => {}); // silently fail
  }, []);

  const hayFiltrosActivos =
    filtroEstado !== 'abierto' || tiposSeleccionados.length > 0 || dxsSeleccionados.length > 0 ||
    fechaDesde !== '' || fechaHasta !== '' || ordenDias !== 'ninguno';

  const limpiarFiltros = () => {
    setFiltroEstado('abierto'); setTiposSeleccionados([]); setDxsSeleccionados([]);
    setCampoFecha('fecha_inicio'); setFechaDesde('');
    setFechaHasta(''); setOrdenDias('ninguno');
  };

  // ── Descarga (CSV con BOM, UTF-8) ────────────────────
  const descargarVisibles = useCallback(async () => {
    if (paquetes.length === 0) return;
    setDescargando(true);
    try {
      const fmtFecha = (f) => formatearFecha(f, '');
      const diasRestantes = (f) => {
        if (!f) return '';
        const d = Math.ceil((new Date(f) - new Date()) / 86400000);
        return String(d);
      };
      const esc = (v) => {
        if (v === null || v === undefined) return '';
        return String(v).replace(/"/g, '""');
      };

      // ── Construir columnas de componentes (unión de todos los visibles) ──
      // Para cada tipo_componente guardamos la cantidad_minima vista (si difiere
      // entre paquetes, nos quedamos con la mayor para no subestimar el requisito).
      const componentMap = new Map();
      paquetes.forEach(p => {
        (p.componentes || []).forEach(c => {
          const prev = componentMap.get(c.tipo_componente);
          const min = Number(c.cantidad_minima) || 0;
          if (!prev) componentMap.set(c.tipo_componente, min);
          else componentMap.set(c.tipo_componente, Math.max(prev, min));
        });
      });
      const compKeys = [...componentMap.keys()].sort((a, b) => a.localeCompare(b));
      const compHeaders = compKeys.map(k => `${k}(${componentMap.get(k)})`);

      const headersBase = [
        'Paciente', 'DNI', 'ID Paquete', 'Tipo de paquete',
        'Avance (%)', 'Fecha inicio', 'Fecha límite',
        'Días restantes', 'Estado', 'Dx principal',
      ];
      const headers = [...headersBase, ...compHeaders];

      const filas = paquetes.map(p => {
        const baseRow = [
          esc(p.paciente_nombre ?? p.id_paciente),
          esc(p.dni ?? ''),
          esc(p.id_paquete ?? ''),
          esc(p.nombre_paquete ?? ''),
          esc(Math.round(p.porcentaje_avance ?? 0)),
          esc(fmtFecha(p.fecha_inicio)),
          esc(fmtFecha(p.fecha_limite)),
          esc(diasRestantes(p.fecha_limite)),
          esc(p.estado ?? ''),
          esc(p.dx_principal ?? ''),
        ];
        const compRow = compKeys.map(k => {
          const c = (p.componentes || []).find(x => x.tipo_componente === k);
          // Si el paquete no tiene ese componente, queda vacío
          if (!c) return '';
          return esc(c.cantidad_realizada ?? 0);
        });
        return [...baseRow, ...compRow];
      });

      const sep = ',';
      const contenido = [
        headers.map(h => `"${h}"`).join(sep),
        ...filas.map(f => f.map(v => `"${v}"`).join(sep)),
      ].join('\r\n');

      const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
      const datos = new TextEncoder().encode(contenido);
      const blob = new Blob([BOM, datos], { type: 'text/csv;charset=utf-8' });

      const fecha = new Date().toISOString().slice(0, 10);
      const partes = ['paquetes', filtroEstado !== 'todos' ? filtroEstado : null]
        .filter(Boolean).join('_');
      saveAs(blob, `${partes}_${fecha}.csv`);
    } finally {
      setDescargando(false);
    }
  }, [paquetes, filtroEstado]);

  return (
    <div className="p-2 sm:p-4 space-y-4">

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Paquetes de atención</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {hayFiltrosActivos && (
            <button onClick={limpiarFiltros}
              className="flex items-center gap-1 text-sm text-red-600 border border-red-300 px-2 py-1 rounded hover:bg-red-50">
              <X size={14} /> Limpiar filtros
            </button>
          )}
          <button
            onClick={descargarVisibles}
            disabled={descargando || cargando || paquetes.length === 0}
            title="Descargar los paquetes visibles (con filtros aplicados) como CSV"
            className="flex items-center gap-1 text-sm text-green-700 border border-green-300 px-2 py-1 rounded hover:bg-green-50 disabled:opacity-50"
          >
            {descargando
              ? <Loader2 size={14} className="animate-spin" />
              : <Download size={14} />}
            Descargar
          </button>
          <button onClick={cargar} disabled={cargando}
            className="flex items-center gap-1 text-sm text-blue-600 border border-blue-300 px-2 py-1 rounded hover:bg-blue-50 disabled:opacity-50">
            <RefreshCw size={14} className={cargando ? 'animate-spin' : ''} /> Recargar
          </button>
        </div>
      </div>

      {/* Panel de filtros */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">

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

        {/* Tipo de paquete (combobox con búsqueda + multi-selección) */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Tipo de paquete {tiposSeleccionados.length > 0 && (
              <span className="text-blue-600 normal-case">({tiposSeleccionados.length} seleccionado{tiposSeleccionados.length !== 1 ? 's' : ''})</span>
            )}
          </label>
          <MultiSelectCombobox
            opciones={tiposPaquete}
            seleccionados={tiposSeleccionados}
            onChange={setTiposSeleccionados}
            placeholder="Escribe para buscar tipos…"
            placeholderAdd="Añadir otro tipo…"
          />
        </div>

        {/* Diagnóstico principal (combobox con búsqueda + multi-selección) */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Diagnóstico {dxsSeleccionados.length > 0 && (
              <span className="text-blue-600 normal-case">({dxsSeleccionados.length} seleccionado{dxsSeleccionados.length !== 1 ? 's' : ''})</span>
            )}
          </label>
          <MultiSelectCombobox
            opciones={dxsDisponibles}
            seleccionados={dxsSeleccionados}
            onChange={setDxsSeleccionados}
            placeholder="Escribe código CIE-10…"
            placeholderAdd="Añadir otro Dx…"
          />
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

      {/* Lista en móvil */}
      {!cargando && paquetes.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">
          No hay paquetes con los filtros seleccionados.
        </p>
      ) : (
        <>
        {/* Cards (móvil/tablet) */}
        <div className="grid grid-cols-1 gap-2.5 md:hidden">
          {paquetes.map((p) => (
            <div key={p.id} className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm leading-snug break-words">
                    {p.paciente_nombre ?? p.id_paciente}
                  </p>
                  <p className="text-[11px] text-gray-500">DNI {p.dni ?? '—'}</p>
                </div>
                <Badge color={colorEstado(p.estado)}>{p.estado}</Badge>
              </div>
              <p className="text-xs text-gray-700">
                <span className="font-mono text-[10px] text-gray-400">{p.id_paquete}</span>
                <span className="ml-1">{p.nombre_paquete}</span>
              </p>
              <div className="pt-1">
                <BarraAvance porcentaje={p.porcentaje_avance} />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-[11px]">
                <div>
                  <p className="text-gray-400 uppercase tracking-wide">Inicio</p>
                  <p className="text-gray-700">{formatearFecha(p.fecha_inicio)}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase tracking-wide">Límite</p>
                  <p className="text-gray-700">{formatearFecha(p.fecha_limite)}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase tracking-wide">Días</p>
                  <DiasRestantes fechaLimite={p.fecha_limite} />
                </div>
              </div>
              <button onClick={() => window.open(`/paquetes/${p.id}`, '_blank')}
                className="w-full flex items-center justify-center gap-1 mt-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100">
                <Eye size={13} /> Ver detalle
              </button>
            </div>
          ))}
        </div>

        {/* Tabla (md+) — ancho fijo por columna, texto envuelve a la siguiente línea */}
        <div className="hidden md:block rounded-lg border border-gray-200">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col style={{ width: '20%' }} />{/* Paciente */}
              <col style={{ width: '9%'  }} />{/* DNI */}
              <col style={{ width: '24%' }} />{/* Tipo paquete (más ancho para textos largos) */}
              <col style={{ width: '14%' }} />{/* Avance */}
              <col style={{ width: '8%'  }} />{/* Inicio */}
              <col style={{ width: '8%'  }} />{/* Límite */}
              <col style={{ width: '8%'  }} />{/* Días rest. */}
              <col style={{ width: '9%'  }} />{/* Estado */}
            </colgroup>
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-3 py-2 text-left">Paciente</th>
                <th className="px-3 py-2 text-left">DNI</th>
                <th className="px-3 py-2 text-left">Tipo paquete</th>
                <th className="px-3 py-2 text-left">Avance</th>
                <th className="px-3 py-2 text-left">Inicio</th>
                <th className="px-3 py-2 text-left">Límite</th>
                <th className="px-3 py-2 text-left">Días</th>
                <th className="px-3 py-2 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paquetes.map((p) => {
                const nombrePaciente = p.paciente_nombre ?? p.id_paciente;
                return (
                  <tr
                    key={p.id}
                    onClick={() => window.open(`/paquetes/${p.id}`, '_blank')}
                    className="hover:bg-blue-50 transition cursor-pointer align-top"
                    title="Click para ver detalle (nueva pestaña)"
                  >
                    <td className="px-3 py-2 font-medium break-words">
                      {nombrePaciente}
                    </td>
                    <td className="px-3 py-2 text-gray-500 font-mono text-xs break-all">
                      {p.dni ?? '—'}
                    </td>
                    <td
                      className="px-3 py-2 text-xs text-gray-700 break-words"
                      title={p.id_paquete}
                    >
                      {p.nombre_paquete ?? p.id_paquete}
                    </td>
                    <td className="px-3 py-2"><BarraAvance porcentaje={p.porcentaje_avance} /></td>
                    <td className="px-3 py-2 text-gray-500 text-xs">
                      {formatearFecha(p.fecha_inicio)}
                    </td>
                    <td className="px-3 py-2 text-gray-500 text-xs">
                      {formatearFecha(p.fecha_limite)}
                    </td>
                    <td className="px-3 py-2"><DiasRestantes fechaLimite={p.fecha_limite} /></td>
                    <td className="px-3 py-2"><Badge color={colorEstado(p.estado)}>{p.estado}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
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
