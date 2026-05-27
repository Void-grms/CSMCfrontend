import { useState, useEffect, useMemo, useCallback, useRef, Fragment } from 'react';
import {
  Search, RefreshCw, FileText, ChevronDown, ChevronRight, User, MapPin,
  Activity, Download, X, GripVertical, Plus, BarChart3
} from 'lucide-react';
import api from '../services/api';
import { saveAs } from 'file-saver';

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-componente: Autocomplete de profesional
// ═══════════════════════════════════════════════════════════════════════════════
function AutocompleteProfesional({ profesionales, value, onChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (value) {
      const p = profesionales.find(p => p.id_personal === value);
      if (p) setSearchTerm(p.nombre_completo);
    } else {
      setSearchTerm('');
    }
  }, [value, profesionales]);

  const filtered = profesionales.filter(p =>
    p.nombre_completo.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Todos los profesionales..."
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
          onChange({ target: { name: 'idProfesional', value: '' } });
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      />
      {isOpen && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg border border-slate-200 focus:outline-none">
          {searchTerm.length > 0 && (
            <li
              className="cursor-pointer select-none py-2 px-3 text-slate-500 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => {
                setSearchTerm('');
                onChange({ target: { name: 'idProfesional', value: '' } });
                setIsOpen(false);
              }}
            >
              -- Limpiar filtro --
            </li>
          )}
          {filtered.length === 0 ? (
            <li className="select-none py-2 px-3 text-slate-500">Sin coincidencias</li>
          ) : (
            filtered.map(p => (
              <li
                key={p.id_personal}
                className="cursor-pointer select-none py-2 px-3 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                onClick={() => {
                  setSearchTerm(p.nombre_completo);
                  onChange({ target: { name: 'idProfesional', value: p.id_personal } });
                  setIsOpen(false);
                }}
              >
                {p.nombre_completo}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-componente: Input de tags para múltiples códigos CIE-10 / HIS
// ═══════════════════════════════════════════════════════════════════════════════
function MultiCodigoInput({ codigos, onChange }) {
  const [inputValue, setInputValue] = useState('');

  const agregarCodigo = () => {
    const val = inputValue.trim().toUpperCase();
    if (val && !codigos.includes(val)) {
      onChange([...codigos, val]);
    }
    setInputValue('');
  };

  const eliminarCodigo = (idx) => {
    onChange(codigos.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      agregarCodigo();
    }
    if (e.key === 'Backspace' && inputValue === '' && codigos.length > 0) {
      eliminarCodigo(codigos.length - 1);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 min-h-[38px] rounded-lg border border-slate-300 px-2 py-1.5 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
      {codigos.map((c, i) => (
        <span key={i} className="inline-flex items-center gap-1 rounded-md bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-semibold">
          {c}
          <button type="button" onClick={() => eliminarCodigo(i)} className="text-blue-500 hover:text-blue-800">
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={agregarCodigo}
        placeholder={codigos.length === 0 ? 'Ej. F32, 90806...' : ''}
        className="flex-1 min-w-[80px] text-sm outline-none border-none bg-transparent"
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-componente: Combobox multi-selección para tipos de paquete
// ═══════════════════════════════════════════════════════════════════════════════
function MultiSelectPaquete({ opciones, seleccionados, onChange }) {
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
  const filtradas = opciones.filter(o => {
    if (seleccionadosSet.has(o.id_paquete)) return false;
    if (!texto.trim()) return true;
    const t = texto.toLowerCase();
    return (o.nombre || '').toLowerCase().includes(t)
        || (o.id_paquete || '').toLowerCase().includes(t)
        || (o.codigo_paquete || '').toLowerCase().includes(t);
  });

  const agregar = (id) => {
    if (!seleccionadosSet.has(id)) onChange([...seleccionados, id]);
    setTexto('');
  };
  const quitar = (id) => onChange(seleccionados.filter(s => s !== id));
  const nombreDe = (id) => {
    const op = opciones.find(o => o.id_paquete === id);
    return op ? (op.nombre || op.id_paquete) : id;
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className="min-h-[38px] flex flex-wrap items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 cursor-text"
        onClick={() => setAbierto(true)}
      >
        {seleccionados.map(id => (
          <span key={id} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-md font-semibold">
            {nombreDe(id)}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); quitar(id); }}
              className="text-blue-500 hover:text-blue-800"
              aria-label={`Quitar ${nombreDe(id)}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <div className="flex items-center flex-1 min-w-[100px]">
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
                agregar(filtradas[0].id_paquete);
              }
            }}
            placeholder={seleccionados.length ? 'Añadir otro paquete…' : 'Todos los paquetes…'}
            className="flex-1 text-sm bg-transparent outline-none"
          />
        </div>
        {seleccionados.length > 0 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange([]); }}
            className="text-slate-400 hover:text-red-500"
            title="Limpiar selección"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {abierto && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filtradas.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400">
              {opciones.length === 0 ? 'Cargando…' : 'Sin coincidencias'}
            </div>
          ) : filtradas.slice(0, 100).map(o => (
            <button
              type="button"
              key={o.id_paquete}
              onClick={() => agregar(o.id_paquete)}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 flex justify-between items-center gap-2"
            >
              <span className="truncate">{o.nombre || o.id_paquete}</span>
              <span className="font-mono text-[10px] text-slate-400 shrink-0">
                {o.codigo_paquete || o.id_paquete}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Utilidades de exportación
// ═══════════════════════════════════════════════════════════════════════════════
function generarArchivo(headers, filas, formato, nombreBase) {
  const sep = formato === 'excel' ? '\t' : ',';
  const ext = formato === 'excel' ? 'xls' : 'csv';

  const contenido = formato === 'excel'
    ? [headers.join(sep), ...filas.map(f => f.join(sep))].join('\r\n')
    : [headers.map(h => `"${h}"`).join(sep), ...filas.map(f => f.map(v => `"${v}"`).join(sep))].join('\r\n');

  const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const encoder = new TextEncoder();
  const datos = encoder.encode(contenido);

  const mimeType = formato === 'excel'
    ? 'application/vnd.ms-excel;charset=utf-8'
    : 'text/csv;charset=utf-8';

  const blob = new Blob([BOM, datos], { type: mimeType });
  const filename = `${nombreBase}_${new Date().toISOString().slice(0, 10)}.${ext}`;
  saveAs(blob, filename);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Modal: Exportar reporte detallado (con campos configurables y descarga total)
// ═══════════════════════════════════════════════════════════════════════════════
const TODOS_CAMPOS = [
  { key: 'fecha_atencion',     label: 'Fecha Atención',        checked: true },
  { key: 'nombre_profesional', label: 'Profesional',           checked: true },
  { key: 'profesion',          label: 'Profesión',             checked: false },
  { key: 'dni_paciente',       label: 'DNI Paciente',          checked: true },
  { key: 'nombre_paciente',    label: 'Nombre Paciente',       checked: true },
  { key: 'edad_reg',           label: 'Edad',                  checked: true },
  { key: 'tipo_edad',          label: 'Tipo Edad (A/M/D)',     checked: false },
  { key: 'codigo_item',        label: 'Código Item',           checked: true },
  { key: 'tipo_diagnostico',   label: 'Tipo Diagnóstico',      checked: true },
  { key: 'valor_lab',          label: 'Valor Lab',             checked: false },
  { key: 'id_cita',            label: 'ID Cita',               checked: false },
  { key: 'id_correlativo',     label: 'ID Correlativo',        checked: false },
  { key: 'id_turno',           label: 'Turno',                 checked: false },
  { key: 'peso',               label: 'Peso',                  checked: false },
  { key: 'talla',              label: 'Talla',                 checked: false },
  { key: 'domicilio_declarado',label: 'Domicilio',             checked: false },
];

function ExportModal({ reporte, totalDisponible, descargarTodo, onClose }) {
  const [campos, setCampos] = useState(() => TODOS_CAMPOS.map(c => ({ ...c })));
  const [dragIdx, setDragIdx] = useState(null);
  const [usarTotal, setUsarTotal] = useState(totalDisponible);
  const [descargando, setDescargando] = useState(false);

  const toggleCampo = (idx) => {
    setCampos(prev => prev.map((c, i) => i === idx ? { ...c, checked: !c.checked } : c));
  };

  const seleccionarTodos = () => setCampos(prev => prev.map(c => ({ ...c, checked: true })));
  const deseleccionarTodos = () => setCampos(prev => prev.map(c => ({ ...c, checked: false })));

  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setCampos(prev => {
      const copy = [...prev];
      const [item] = copy.splice(dragIdx, 1);
      copy.splice(idx, 0, item);
      return copy;
    });
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  const exportar = async (formato) => {
    const activos = campos.filter(c => c.checked);
    if (activos.length === 0) return alert('Selecciona al menos un campo.');

    setDescargando(true);
    try {
      const datos = usarTotal ? await descargarTodo() : reporte;
      if (!datos || datos.length === 0) {
        alert('No hay registros para exportar.');
        return;
      }
      const headers = activos.map(c => c.label);
      const filas = datos.map(row =>
        activos.map(c => {
          let val = row[c.key];
          if (c.key === 'fecha_atencion' && val) val = new Date(val).toLocaleDateString('es-PE');
          if (val === null || val === undefined) val = '';
          return String(val).replace(/"/g, '""');
        })
      );
      generarArchivo(headers, filas, formato, 'reporte_produccion');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error al exportar: ' + (err?.message || 'desconocido'));
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Exportar Reporte Detallado</h3>
            <p className="text-xs text-slate-500">
              {usarTotal
                ? 'Se descargarán todos los registros que cumplen los filtros (sin límite).'
                : `${reporte.length} registros · Arrastra para reordenar`}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>

        <div className="px-6 pt-3">
          <label className="flex items-center gap-2 text-xs text-slate-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={usarTotal}
              onChange={(e) => setUsarTotal(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <span>
              Descargar <strong>todos los registros</strong> que cumplen los filtros
              (no solo los {reporte.length} mostrados en pantalla).
            </span>
          </label>
        </div>

        <div className="flex gap-3 px-6 pt-3">
          <button onClick={seleccionarTodos} className="text-xs text-blue-600 hover:underline">Seleccionar todos</button>
          <button onClick={deseleccionarTodos} className="text-xs text-slate-500 hover:underline">Deseleccionar todos</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-1">
          {campos.map((c, i) => (
            <div
              key={c.key}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm cursor-grab select-none transition ${
                c.checked ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50 border border-slate-200 opacity-60'
              } ${dragIdx === i ? 'ring-2 ring-blue-400 scale-[1.02]' : ''}`}
            >
              <GripVertical size={14} className="text-slate-400 shrink-0" />
              <input
                type="checkbox"
                checked={c.checked}
                onChange={() => toggleCampo(i)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className={c.checked ? 'font-medium text-slate-800' : 'text-slate-500'}>{c.label}</span>
              <span className="ml-auto text-[10px] font-mono text-slate-400">{c.key}</span>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
          <button
            onClick={() => exportar('csv')}
            disabled={descargando}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:bg-green-300 transition"
          >
            <Download size={16} /> {descargando ? 'Generando…' : 'Exportar CSV'}
          </button>
          <button
            onClick={() => exportar('excel')}
            disabled={descargando}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300 transition"
          >
            <Download size={16} /> {descargando ? 'Generando…' : 'Exportar Excel'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Componente principal
// ═══════════════════════════════════════════════════════════════════════════════
export default function ReporteProfesionales() {
  const [reporte, setReporte] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [paquetesCatalogo, setPaquetesCatalogo] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [descargandoResumen, setDescargandoResumen] = useState(false);
  const [mostrarExport, setMostrarExport] = useState(false);

  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    idProfesional: '',
    qPaciente: '',
    limite: 500,
  });

  const [codigosItem, setCodigosItem] = useState([]);
  const [paquetesSeleccionados, setPaquetesSeleccionados] = useState([]);

  useEffect(() => {
    cargarProfesionales();
    cargarPaquetesCatalogo();
  }, []);

  const cargarProfesionales = async () => {
    try {
      const { data } = await api.get('/profesionales');
      setProfesionales(data || []);
    } catch (error) {
      console.error('Error cargando profesionales:', error);
    }
  };

  const cargarPaquetesCatalogo = async () => {
    try {
      const { data } = await api.get('/reportes/paquetes-catalogo');
      setPaquetesCatalogo(data || []);
    } catch (error) {
      console.error('Error cargando catálogo de paquetes:', error);
    }
  };

  // Construye los query params en base a los filtros y opciones extras
  const buildParams = useCallback((extras = {}) => {
    const base = { ...filtros };
    if (codigosItem.length > 0) base.codigoItem = codigosItem.join(',');
    if (paquetesSeleccionados.length > 0) base.idPaquetes = paquetesSeleccionados.join(',');
    Object.assign(base, extras);
    return new URLSearchParams(
      Object.entries(base).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
    ).toString();
  }, [filtros, codigosItem, paquetesSeleccionados]);

  const cargarReporte = async (e) => {
    if (e) e.preventDefault();
    setCargando(true);
    try {
      const { data } = await api.get(`/reportes/produccion-profesional?${buildParams()}`);
      setReporte(data || []);
    } catch (error) {
      console.error('Error cargando reporte:', error);
      alert('Hubo un error al cargar el reporte.');
    } finally {
      setCargando(false);
    }
  };

  // Descarga TODOS los registros (sin límite de 500) aplicando los mismos filtros
  const descargarTodo = useCallback(async () => {
    const params = buildParams({ sinLimite: '1', limite: '' });
    const { data } = await api.get(`/reportes/produccion-profesional?${params}`);
    return data || [];
  }, [buildParams]);

  // Descarga resumen por profesional (cantidad de atenciones) — directo a archivo
  const descargarResumen = async (formato) => {
    setDescargandoResumen(true);
    try {
      const params = buildParams();
      const { data } = await api.get(`/reportes/produccion-profesional/resumen?${params}`);
      const filas = (data || []).map(r => [
        r.id_personal ?? '',
        (r.nombre_profesional ?? '').replace(/"/g, '""'),
        r.profesion ?? '',
        r.total_atenciones ?? 0,
        r.total_citas ?? 0,
        r.total_pacientes ?? 0,
        r.primera_atencion ? new Date(r.primera_atencion).toLocaleDateString('es-PE') : '',
        r.ultima_atencion  ? new Date(r.ultima_atencion ).toLocaleDateString('es-PE') : '',
      ]);
      if (filas.length === 0) {
        alert('No hay datos para el resumen con los filtros aplicados.');
        return;
      }
      const headers = [
        'ID Personal', 'Profesional', 'Profesión',
        'Total Atenciones', 'Total Citas', 'Total Pacientes',
        'Primera Atención', 'Última Atención',
      ];
      generarArchivo(headers, filas, formato, 'resumen_atenciones');
    } catch (error) {
      console.error('Error descargando resumen:', error);
      alert('Hubo un error al generar el resumen.');
    } finally {
      setDescargandoResumen(false);
    }
  };

  const handleInputChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const citasAgrupadas = useMemo(() => {
    const grupos = {};
    for (const r of reporte) {
      if (!grupos[r.id_cita]) {
        grupos[r.id_cita] = {
          id_cita: r.id_cita,
          fecha_atencion: r.fecha_atencion,
          nombre_profesional: r.nombre_profesional,
          profesion: r.profesion,
          dni_paciente: r.dni_paciente,
          nombre_paciente: r.nombre_paciente,
          edad_reg: r.edad_reg,
          tipo_edad: r.tipo_edad,
          peso: r.peso,
          talla: r.talla,
          domicilio_declarado: r.domicilio_declarado,
          items: []
        };
      }
      grupos[r.id_cita].items.push({
        id_correlativo: r.id_correlativo,
        codigo_item: r.codigo_item,
        tipo_diagnostico: r.tipo_diagnostico,
        valor_lab: r.valor_lab
      });
    }
    return Object.values(grupos);
  }, [reporte]);

  const [citasAbiertas, setCitasAbiertas] = useState({});
  const toggleCita = (id_cita) => setCitasAbiertas(p => ({ ...p, [id_cita]: !p[id_cita] }));

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Reporte de Producción</h1>
          <p className="text-xs sm:text-sm text-slate-500">Atenciones realizadas por profesionales</p>
        </div>
        {reporte.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => descargarResumen('excel')}
              disabled={descargandoResumen}
              className="flex items-center justify-center gap-2 rounded-lg border border-purple-300 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 disabled:opacity-60 transition"
              title="Descargar resumen agregado por profesional (cantidad de atenciones)"
            >
              <BarChart3 size={16} /> {descargandoResumen ? 'Generando…' : 'Resumen (atenciones)'}
            </button>
            <button
              onClick={() => setMostrarExport(true)}
              className="flex items-center justify-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100 transition"
            >
              <Download size={16} /> Exportar detallado ({reporte.length})
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm">
        <form className="grid gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6" onSubmit={cargarReporte}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Fecha Inicio</label>
            <input type="date" name="fechaInicio" value={filtros.fechaInicio} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Fecha Fin</label>
            <input type="date" name="fechaFin" value={filtros.fechaFin} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Profesional</label>
            <AutocompleteProfesional
              profesionales={profesionales}
              value={filtros.idProfesional}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">DNI / Paciente</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input type="text" name="qPaciente" value={filtros.qPaciente} onChange={handleInputChange} placeholder="Buscar paciente..." className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Códigos CIE-10 / HIS</label>
            <MultiCodigoInput codigos={codigosItem} onChange={setCodigosItem} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Tipo de paquete {paquetesSeleccionados.length > 0 && (
                <span className="text-blue-600 font-normal">({paquetesSeleccionados.length})</span>
              )}
            </label>
            <MultiSelectPaquete
              opciones={paquetesCatalogo}
              seleccionados={paquetesSeleccionados}
              onChange={setPaquetesSeleccionados}
            />
          </div>

          <div className="md:col-span-3 lg:col-span-6 flex items-end">
            <button type="submit" disabled={cargando} className="flex w-full md:w-auto md:ml-auto items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 px-6 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300">
              <RefreshCw size={16} className={cargando ? "animate-spin" : ""} />
              {cargando ? 'Cargando...' : 'Generar Reporte'}
            </button>
          </div>
        </form>
      </div>

      {/* Cards (móvil) */}
      <div className="md:hidden space-y-2.5">
        {citasAgrupadas.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
            <FileText className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            <p className="text-sm">No hay datos. Presione "Generar Reporte" usando los filtros de arriba.</p>
          </div>
        ) : (
          citasAgrupadas.map((c) => {
            const isOpen = citasAbiertas[c.id_cita] || false;
            return (
              <div key={c.id_cita} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleCita(c.id_cita)}
                  className="w-full p-3 text-left flex items-start gap-2 hover:bg-slate-50"
                >
                  <div className="text-slate-400 pt-1 shrink-0">
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500">{new Date(c.fecha_atencion).toLocaleDateString('es-PE')}</span>
                      <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 shrink-0">
                        {c.items.length} items
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 break-words leading-snug">{c.nombre_profesional}</p>
                    <p className="text-[11px] text-slate-400">{c.profesion}</p>
                    <p className="text-xs text-slate-600 break-words"><span className="font-mono">{c.dni_paciente}</span> · {c.nombre_paciente}</p>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-3 py-3 bg-blue-50/30 border-l-4 border-blue-500 space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5"><User size={12} /> Paciente</h4>
                      <div className="grid grid-cols-3 gap-1.5 text-xs">
                        <div><span className="text-slate-400">Edad:</span> <span className="font-medium">{c.edad_reg !== null ? `${c.edad_reg}${c.tipo_edad || ''}` : '-'}</span></div>
                        <div><span className="text-slate-400">Peso:</span> <span className="font-medium">{c.peso ? `${c.peso}kg` : '-'}</span></div>
                        <div><span className="text-slate-400">Talla:</span> <span className="font-medium">{c.talla ? `${c.talla}cm` : '-'}</span></div>
                      </div>
                      <div className="text-xs text-slate-700 flex items-start gap-1">
                        <MapPin size={12} className="text-slate-400 mt-0.5 shrink-0" />
                        <span className="break-words">{c.domicilio_declarado || <span className="text-slate-400 italic">Sin domicilio declarado</span>}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5 mb-2"><Activity size={12} /> Procedimientos</h4>
                      <ul className="space-y-1.5">
                        {c.items.map((it) => (
                          <li key={it.id_correlativo} className="flex items-start bg-white border border-slate-200 rounded p-2 gap-2">
                            <div className="bg-slate-100 font-mono text-[11px] font-bold text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                              {it.codigo_item}
                            </div>
                            <div className="flex-1 text-xs text-slate-700 flex flex-wrap gap-1">
                              {it.tipo_diagnostico && (
                                <span className="inline-flex items-center rounded-sm bg-purple-100 px-1 py-0.5 text-[9px] font-bold text-purple-700">
                                  {it.tipo_diagnostico}
                                </span>
                              )}
                              {it.valor_lab && <span className="bg-yellow-100 text-yellow-800 px-1 rounded text-[10px] border border-yellow-200 font-medium">VAL: {it.valor_lab}</span>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        {reporte.length >= filtros.limite && (
          <div className="bg-yellow-50 rounded-lg px-3 py-2 text-center text-xs text-yellow-800 border border-yellow-100">
            Mostrando {reporte.length} registros (límite de vista previa). Usa "Exportar detallado" con la opción
            "todos los registros" para descargar el total sin recorte.
          </div>
        )}
      </div>

      {/* Tabla (md+) */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="w-10 px-4 py-3"></th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Profesional</th>
                <th className="px-4 py-3">DNI Paciente</th>
                <th className="px-4 py-3">Paciente</th>
                <th className="px-4 py-3 text-center">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {citasAgrupadas.length > 0 ? (
                citasAgrupadas.map((c) => {
                  const isOpen = citasAbiertas[c.id_cita] || false;
                  return (
                    <Fragment key={c.id_cita}>
                      <tr
                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => toggleCita(c.id_cita)}
                      >
                        <td className="px-4 py-3 text-slate-400">
                          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">{new Date(c.fecha_atencion).toLocaleDateString('es-PE')}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{c.nombre_profesional}</div>
                          <div className="text-[11px] text-slate-400">{c.profesion}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600">{c.dni_paciente}</td>
                        <td className="px-4 py-3 truncate max-w-[200px]" title={c.nombre_paciente}>
                          {c.nombre_paciente}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                            {c.items.length}
                          </span>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-slate-50/50">
                          <td colSpan="6" className="p-0 border-t-0">
                            <div className="px-14 py-4 grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/30 border-l-4 border-blue-500 shadow-inner">
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5"><User size={14} className="text-slate-400" /> Datos del Paciente</h4>
                                <div className="text-sm text-slate-700 grid grid-cols-2 gap-y-2 gap-x-4">
                                  <div><span className="text-slate-400">Edad:</span> <span className="font-medium">{c.edad_reg !== null ? `${c.edad_reg} ${c.tipo_edad === 'A' ? 'Años' : c.tipo_edad === 'M' ? 'Meses' : c.tipo_edad === 'D' ? 'Días' : ''}` : '-'}</span></div>
                                  <div><span className="text-slate-400">Peso:</span> <span className="font-medium">{c.peso ? `${c.peso} kg` : '-'}</span></div>
                                  <div><span className="text-slate-400">Talla:</span> <span className="font-medium">{c.talla ? `${c.talla} cm` : '-'}</span></div>
                                </div>
                                <div className="text-sm text-slate-700 flex items-start mt-2">
                                  <MapPin size={14} className="text-slate-400 mt-0.5 mr-1.5 shrink-0" />
                                  <span className="font-medium break-words leading-tight">{c.domicilio_declarado || <span className="text-slate-400 italic font-normal">No tiene domicilio declarado</span>}</span>
                                </div>
                              </div>

                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5 mb-3"><Activity size={14} className="text-slate-400" /> Procedimientos y Diagnósticos</h4>
                                <ul className="space-y-2">
                                  {c.items.map((it) => (
                                    <li key={it.id_correlativo} className="flex items-start bg-white border border-slate-200 rounded-md p-2 shadow-sm">
                                      <div className="bg-slate-100 font-mono text-xs font-bold text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 mr-2 shrink-0">
                                        {it.codigo_item}
                                      </div>
                                      <div className="flex-1 text-sm text-slate-700 leading-tight pt-0.5">
                                        {it.tipo_diagnostico && (
                                          <span className="mr-1 inline-flex items-center rounded-sm bg-purple-100 px-1 py-0.5 text-[9px] font-bold text-purple-700 leading-none">
                                            {it.tipo_diagnostico}
                                          </span>
                                        )}
                                        {it.valor_lab ? <span className="bg-yellow-100 text-yellow-800 px-1 rounded text-xs ml-1 border border-yellow-200 font-medium">VAL: {it.valor_lab}</span> : null}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                    <FileText className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                    <p>No hay datos. Presione "Generar Reporte" usando los filtros de arriba.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {reporte.length >= filtros.limite && (
          <div className="bg-yellow-50 px-4 py-3 text-center text-sm text-yellow-800 border-t border-yellow-100">
            Mostrando {reporte.length} registros (límite de la vista previa). Usa
            <strong> "Exportar detallado"</strong> con la opción "todos los registros" para descargar el total sin recorte.
          </div>
        )}
      </div>

      {/* Modal de exportación */}
      {mostrarExport && (
        <ExportModal
          reporte={reporte}
          totalDisponible={true}
          descargarTodo={descargarTodo}
          onClose={() => setMostrarExport(false)}
        />
      )}
    </div>
  );
}
