import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Search, Loader2, X, FileText, Download, AlertTriangle } from 'lucide-react';
import { buscarPacienteDocumentos, descargarReporteAtenciones } from '../services/api';

/** Hook de debounce para la búsqueda. */
function useDebounce(value, delay = 400) {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return d;
}

const nombreCompleto = (p) =>
  [p.apellido_paterno, p.apellido_materno, p.nombres].filter(Boolean).join(' ');

/**
 * Reporte de atenciones para varios pacientes a la vez.
 * Busca pacientes, los agrega a una lista y genera un .docx con una fila por usuario.
 */
export default function FormReporteAtenciones({ volver, tipoSeleccionado }) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [seleccionados, setSeleccionados] = useState([]); // pacientes
  const [generando, setGenerando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo, texto }

  const dropdownRef = useRef(null);
  const debounced = useDebounce(query, 400);

  // Cerrar dropdown al hacer clic fuera.
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAbierto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Buscar pacientes con debounce.
  useEffect(() => {
    const q = debounced.trim();
    if (q.length < 2) {
      setResultados([]);
      setDropdownAbierto(false);
      return;
    }
    setBuscando(true);
    buscarPacienteDocumentos(q)
      .then((data) => {
        setResultados(Array.isArray(data) ? data : []);
        setDropdownAbierto(true);
      })
      .catch(() => setResultados([]))
      .finally(() => setBuscando(false));
  }, [debounced]);

  const yaSeleccionado = (id) => seleccionados.some((p) => p.id_paciente === id);

  const agregar = (pac) => {
    if (!yaSeleccionado(pac.id_paciente)) setSeleccionados((s) => [...s, pac]);
    setQuery('');
    setDropdownAbierto(false);
    setMensaje(null);
  };

  const quitar = (id) => setSeleccionados((s) => s.filter((p) => p.id_paciente !== id));

  const handleGenerar = async () => {
    if (!seleccionados.length) return;
    setGenerando(true);
    setMensaje(null);
    try {
      await descargarReporteAtenciones(seleccionados.map((p) => p.id_paciente));
      setMensaje({ tipo: 'exito', texto: 'Reporte generado y descargado.' });
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo generar el reporte. Inténtalo de nuevo.' });
    } finally {
      setGenerando(false);
    }
  };

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
          <h1 className="text-xl font-bold text-gray-800">{tipoSeleccionado?.nombre ?? 'Reporte de Atenciones'}</h1>
          <p className="text-sm text-gray-500">{tipoSeleccionado?.descripcion}</p>
        </div>
      </div>

      <div className="rounded-xl glass-card border border-outline-variant/20 shadow-[0_4px_16px_rgba(27,94,83,0.04)] p-6 space-y-5">
        {/* Buscador */}
        <div ref={dropdownRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Agregar pacientes:</label>
          <div className="flex items-center border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-400">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => resultados.length && setDropdownAbierto(true)}
              placeholder="Buscar por nombre o DNI…"
              className="flex-1 py-2.5 px-2 text-sm bg-transparent outline-none"
            />
            {buscando && <Loader2 size={16} className="animate-spin text-gray-400" />}
          </div>
          {dropdownAbierto && resultados.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {resultados.map((pac) => {
                const sel = yaSeleccionado(pac.id_paciente);
                return (
                  <button
                    key={pac.id_paciente}
                    type="button"
                    disabled={sel}
                    onClick={() => agregar(pac)}
                    className={`w-full text-left px-3 py-2 text-sm flex justify-between items-center gap-2 ${
                      sel ? 'opacity-40 cursor-default' : 'hover:bg-blue-50'
                    }`}
                  >
                    <span className="truncate">{nombreCompleto(pac)}</span>
                    <span className="font-mono text-[11px] text-gray-400 shrink-0">{pac.numero_documento}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Lista de seleccionados */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Pacientes seleccionados <span className="text-blue-600">({seleccionados.length})</span>
          </p>
          {seleccionados.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center border border-dashed border-gray-200 rounded-lg">
              Busca y agrega pacientes para incluirlos en el reporte.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {seleccionados.map((pac) => (
                <span
                  key={pac.id_paciente}
                  className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm px-2.5 py-1 rounded-full border border-blue-200"
                >
                  {nombreCompleto(pac)}
                  <span className="font-mono text-[10px] text-blue-400">{pac.numero_documento}</span>
                  <button
                    type="button"
                    onClick={() => quitar(pac.id_paciente)}
                    className="hover:text-blue-900"
                    aria-label={`Quitar ${nombreCompleto(pac)}`}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerar}
            disabled={generando || seleccionados.length === 0}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {generando ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Generar reporte (.docx)
          </button>
          {seleccionados.length > 0 && (
            <button onClick={() => setSeleccionados([])} className="text-sm text-gray-500 hover:text-red-600">
              Limpiar
            </button>
          )}
        </div>

        {mensaje && (
          <div
            className={`rounded-lg p-3 text-sm flex items-center gap-2 ${
              mensaje.tipo === 'exito' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}
          >
            {mensaje.tipo === 'exito' ? <FileText size={16} /> : <AlertTriangle size={16} />}
            {mensaje.texto}
          </div>
        )}
      </div>
    </div>
  );
}
