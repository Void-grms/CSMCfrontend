import { useState, useRef, useEffect } from 'react';
import { FileText, Search, Download, Loader2, AlertTriangle, CheckCircle2, X, ChevronLeft, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { buscarPacienteDocumentos, generarDocumento, actualizarDomicilioPaciente, obtenerReporteHIS, exportarReporteHIS } from '../services/api';
import FormReporteHISDiario from './FormReporteHISDiario';

// ── Tipos de documentos disponibles (extensible para Fase 2) ─────────────────
const TIPOS_DOCUMENTO = [
  {
    id: 'constancia-simple',
    nombre: 'Constancia Simple',
    descripcion: 'Constancia de atención con datos del paciente, diagnóstico y número de atenciones.',
    icon: FileText,
    requierePaciente: true,
  },
  {
    id: 'reporte-his',
    nombre: 'Reporte de Producción HIS - 40A',
    descripcion: 'Genera el reporte de indicadores ATDe, ATCe, ATDs, ATCs por profesional exportable a Excel.',
    icon: FileSpreadsheet,
    requierePaciente: false,
  },
  {
    id: 'reporte-his-diario',
    nombre: 'Reporte de Producción HIS - Diario',
    descripcion: 'Genera el reporte diario de atenciones (ATCs) en un rango de 31 días por profesional, exportable a Excel.',
    icon: FileSpreadsheet,
    requierePaciente: false,
  },
  // Fase futura:
  // { id: 'oficio', nombre: 'Oficio', ... , requierePaciente: false },
  // { id: 'memorandum', nombre: 'Memorándum', ... , requierePaciente: false },
];

/** Hook de debounce para búsqueda */
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/** Página principal del módulo de Documentos */
export default function Documentos() {
  const { user } = useAuth();

  // Verificar rol admin
  if (!user || user.rol !== 'admin') {
    return (
      <div className="mx-auto mt-20 max-w-md rounded-lg bg-red-50 p-6 text-center text-red-700">
        <AlertTriangle className="mx-auto mb-2" size={28} />
        <p className="font-medium">Acceso restringido</p>
        <p className="mt-1 text-sm">Este módulo es exclusivo para administradores.</p>
      </div>
    );
  }

  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [generando, setGenerando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo: 'exito'|'error', texto: '' }
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  
  // Estados para modal de domicilio
  const [mostrarModalDomicilio, setMostrarModalDomicilio] = useState(false);
  const [nuevoDomicilio, setNuevoDomicilio] = useState('');
  const [guardandoDomicilio, setGuardandoDomicilio] = useState(false);

  // Estados para Reporte HIS
  const [profesionales, setProfesionales] = useState([]);
  const [filtroHIS, setFiltroHIS] = useState({ id_personal: '', fecha_inicio: '', fecha_fin: '' });
  const [datosHIS, setDatosHIS] = useState(null);
  const [loadingHIS, setLoadingHIS] = useState(false);
  const [errorHIS, setErrorHIS] = useState(null);
  const [consultaRealizada, setConsultaRealizada] = useState(false);

  const dropdownRef = useRef(null);

  const debouncedQuery = useDebounce(query, 400);

  // Cargar profesionales al inicio
  useEffect(() => {
    api.get('/profesionales')
      .then((res) => setProfesionales(res.data || []))
      .catch((err) => console.error('Error cargando profesionales', err));
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAbierto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Buscar pacientes con debounce
  useEffect(() => {
    const q = debouncedQuery.trim();
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
      .catch(() => {
        setResultados([]);
      })
      .finally(() => setBuscando(false));
  }, [debouncedQuery]);

  // ── Seleccionar paciente ────────────────────────────────────────────────────
  const seleccionarPaciente = (pac) => {
    setQuery('');
    setDropdownAbierto(false);
    setMensaje(null);

    // Verificar si tiene domicilio
    const tieneDomicilio = (pac.domicilio_declarado && pac.domicilio_declarado.trim()) || 
                          (pac.domicilio_reniec && pac.domicilio_reniec.trim());

    if (!tieneDomicilio) {
      setPacienteSeleccionado(pac);
      setNuevoDomicilio('');
      setMostrarModalDomicilio(true);
    } else {
      setPacienteSeleccionado(pac);
    }
  };

  // ── Guardar Domicilio Nuevo ────────────────────────────────────────────────
  const handleGuardarDomicilio = async () => {
    if (!nuevoDomicilio.trim()) return;

    setGuardandoDomicilio(true);
    try {
      await actualizarDomicilioPaciente(pacienteSeleccionado.id_paciente, nuevoDomicilio);
      
      // Actualizar el objeto paciente en el estado local
      setPacienteSeleccionado(prev => ({
        ...prev,
        domicilio_declarado: nuevoDomicilio
      }));
      
      setMostrarModalDomicilio(false);
      setMensaje({ tipo: 'exito', texto: 'Domicilio guardado y actualizado.' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'No se pudo guardar el domicilio.' });
    } finally {
      setGuardandoDomicilio(false);
    }
  };

  // ── Generar documento ───────────────────────────────────────────────────────
  const handleGenerar = async () => {
    if (!tipoSeleccionado || !pacienteSeleccionado) return;

    setGenerando(true);
    setMensaje(null);

    try {
      await generarDocumento(tipoSeleccionado.id, pacienteSeleccionado.id_paciente);
      setMensaje({ tipo: 'exito', texto: 'Documento generado y descargado exitosamente.' });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Error al generar el documento';
      setMensaje({ tipo: 'error', texto: errorMsg });
    } finally {
      setGenerando(false);
    }
  };

  // ── Resetear selección ──────────────────────────────────────────────────────
  const volver = () => {
    setTipoSeleccionado(null);
    setPacienteSeleccionado(null);
    setQuery('');
    setResultados([]);
    setMensaje(null);
    setDatosHIS(null);
    setConsultaRealizada(false);
    setErrorHIS(null);
  };

  // ── Handlers para Reporte HIS ────────────────────────────────────────────────
  const handleVerReporteHIS = async () => {
    if (!filtroHIS.id_personal || !filtroHIS.fecha_inicio || !filtroHIS.fecha_fin) {
      setErrorHIS('Seleccione el profesional y las fechas.');
      return;
    }
    setLoadingHIS(true);
    setErrorHIS(null);
    setConsultaRealizada(true);
    try {
      const res = await obtenerReporteHIS(filtroHIS.id_personal, filtroHIS.fecha_inicio, filtroHIS.fecha_fin);
      setDatosHIS(res.datos);
    } catch (err) {
      setErrorHIS('Error al obtener el reporte.');
    } finally {
      setLoadingHIS(false);
    }
  };

  const handleExportarHIS = async () => {
    try {
      await exportarReporteHIS(filtroHIS.id_personal, filtroHIS.fecha_inicio, filtroHIS.fecha_fin);
    } catch (err) {
      setErrorHIS('Error al exportar el archivo Excel.');
    }
  };

  const nombreCompleto = (pac) =>
    [pac.apellido_paterno, pac.apellido_materno, pac.nombres].filter(Boolean).join(' ');

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: Listado de tipos de documentos
  // ─────────────────────────────────────────────────────────────────────────────
  if (!tipoSeleccionado) {
    return (
      <div className="space-y-6">
        {/* Encabezado */}
        <div>
          <h1 className="text-xl font-bold text-gray-800">Documentos</h1>
          <p className="text-sm text-gray-500">Genera documentos oficiales del CSMC RENACER</p>
        </div>

        {/* Grid de tipos */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TIPOS_DOCUMENTO.map((tipo) => {
            const Icon = tipo.icon;
            return (
              <button
                key={tipo.id}
                onClick={() => setTipoSeleccionado(tipo)}
                className="group flex flex-col items-start gap-3 rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                    {tipo.nombre}
                  </h3>
                  <p className="mt-1 text-xs text-gray-400 leading-relaxed">{tipo.descripcion}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: Formulario de generación
  // ─────────────────────────────────────────────────────────────────────────────
  if (tipoSeleccionado.id === 'reporte-his-diario') {
    return (
      <FormReporteHISDiario 
        profesionales={profesionales} 
        volver={volver} 
        tipoSeleccionado={tipoSeleccionado} 
      />
    );
  }

  if (tipoSeleccionado.id === 'reporte-his') {
    return (
      <div className="space-y-6">
        {/* Encabezado con botón volver */}
        <div className="flex items-center gap-3">
          <button
            onClick={volver}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft size={16} />
            Volver
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{tipoSeleccionado.nombre}</h1>
            <p className="text-sm text-gray-500">{tipoSeleccionado.descripcion}</p>
          </div>
        </div>

        {/* Card principal tipo Reporte HIS */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Profesional:</label>
              <select
                className="w-full rounded-lg border border-gray-300 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={filtroHIS.id_personal}
                onChange={(e) => setFiltroHIS({ ...filtroHIS, id_personal: e.target.value })}
              >
                <option value="">— Seleccionar profesional —</option>
                {profesionales.map((p) => (
                  <option key={p.id_personal} value={p.id_personal}>
                    {p.nombre_completo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desde:</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={filtroHIS.fecha_inicio}
                onChange={(e) => setFiltroHIS({ ...filtroHIS, fecha_inicio: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hasta:</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={filtroHIS.fecha_fin}
                onChange={(e) => setFiltroHIS({ ...filtroHIS, fecha_fin: e.target.value })}
              />
            </div>
          </div>
          
          <button
            onClick={handleVerReporteHIS}
            disabled={loadingHIS}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loadingHIS ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Ver reporte
          </button>

          {errorHIS && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 flex items-center gap-2">
              <AlertTriangle size={16} />
              {errorHIS}
            </div>
          )}

          {consultaRealizada && datosHIS && !loadingHIS && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4 font-semibold">N°</th>
                      <th className="py-3 px-4 font-semibold">Profesional</th>
                      <th className="py-3 px-4 font-semibold text-center">ATDe</th>
                      <th className="py-3 px-4 font-semibold text-center">ATCe</th>
                      <th className="py-3 px-4 font-semibold text-center">ATDs</th>
                      <th className="py-3 px-4 font-semibold text-center">ATCs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/50">
                      <td className="py-3 px-4">1</td>
                      <td className="py-3 px-4 font-medium text-gray-800">{datosHIS.nombre_profesional}</td>
                      <td className="py-3 px-4 text-center">{datosHIS.ATDe}</td>
                      <td className="py-3 px-4 text-center">{datosHIS.ATCe}</td>
                      <td className="py-3 px-4 text-center">{datosHIS.ATDs}</td>
                      <td className="py-3 px-4 text-center">{datosHIS.ATCs}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleExportarHIS}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <Download size={16} className="text-gray-500" />
                  Descargar Excel
                </button>
              </div>
            </div>
          )}

          {consultaRealizada && datosHIS === null && !loadingHIS && !errorHIS && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 py-8 text-center">
              <FileSpreadsheet size={32} className="mx-auto mb-2 text-gray-400" />
              <p className="font-medium text-gray-700">Sin atenciones en el período seleccionado</p>
              <p className="mt-1 text-sm text-gray-500">Pruebe ajustando el rango de fechas para este profesional.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: Formulario de generación Constancia (por defecto)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Encabezado con botón volver */}
      <div className="flex items-center gap-3">
        <button
          onClick={volver}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft size={16} />
          Volver
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{tipoSeleccionado.nombre}</h1>
          <p className="text-sm text-gray-500">{tipoSeleccionado.descripcion}</p>
        </div>
      </div>

      {/* Card principal */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        {/* Paso 1: Buscar paciente */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            1. Buscar paciente
          </label>

          {!pacienteSeleccionado ? (
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="DNI o nombre del paciente…"
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  autoFocus
                />
                {buscando && (
                  <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                )}
              </div>

              {/* Dropdown de resultados */}
              {dropdownAbierto && resultados.length > 0 && (
                <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  {resultados.map((pac) => (
                    <li key={pac.id_paciente}>
                      <button
                        type="button"
                        onClick={() => seleccionarPaciente(pac)}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors flex items-center justify-between"
                      >
                        <span className="font-medium text-gray-800">{nombreCompleto(pac)}</span>
                        <span className="text-xs text-gray-400 ml-2">DNI {pac.numero_documento}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {dropdownAbierto && resultados.length === 0 && !buscando && debouncedQuery.trim().length >= 2 && (
                <div className="absolute z-30 mt-1 w-full rounded-lg border border-gray-200 bg-white p-3 text-center text-sm text-gray-400 shadow-lg">
                  No se encontraron pacientes
                </div>
              )}
            </div>
          ) : (
            /* Paciente seleccionado */
            <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
              <div>
                <p className="font-medium text-gray-800">{nombreCompleto(pacienteSeleccionado)}</p>
                <p className="text-xs text-gray-500">DNI: {pacienteSeleccionado.numero_documento}</p>
              </div>
              <button
                onClick={() => {
                  setPacienteSeleccionado(null);
                  setMensaje(null);
                }}
                className="rounded p-1 text-gray-400 hover:bg-blue-100 hover:text-gray-600 transition-colors"
                title="Cambiar paciente"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Paso 2: Generar */}
        {pacienteSeleccionado && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              2. Generar documento
            </label>
            <button
              onClick={handleGenerar}
              disabled={generando}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {generando ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generando…
                </>
              ) : (
                <>
                  <Download size={16} />
                  Generar y Descargar
                </>
              )}
            </button>
          </div>
        )}

        {/* Mensajes de feedback */}
        {mensaje && (
          <div
            className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
              mensaje.tipo === 'exito'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {mensaje.tipo === 'exito' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {mensaje.texto}
          </div>
        )}
      </div>

      {/* Modal para Domicilio Faltante */}
      {mostrarModalDomicilio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                <AlertTriangle size={20} />
              </div>
              <h2 className="text-lg font-bold">Domicilio faltante</h2>
            </div>
            
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              El paciente <span className="font-semibold text-gray-800">{nombreCompleto(pacienteSeleccionado)}</span> no tiene un domicilio registrado. 
              Por favor, ingrésalo para continuar con la generación de la constancia.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Nuevo Domicilio
                </label>
                <textarea
                  value={nuevoDomicilio}
                  onChange={(e) => setNuevoDomicilio(e.target.value)}
                  placeholder="Ej. Jr. Libertad 123, Otuzco..."
                  className="w-full h-24 rounded-xl border border-gray-200 p-3 text-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 focus:outline-none transition-all resize-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setMostrarModalDomicilio(false);
                    setPacienteSeleccionado(null);
                  }}
                  className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarDomicilio}
                  disabled={guardandoDomicilio || !nuevoDomicilio.trim()}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  {guardandoDomicilio ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  Guardar y Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
