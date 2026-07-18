import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Filter, Loader2, RefreshCw, Search, Users, X } from 'lucide-react';
import { obtenerDetalleAcpDashboard } from '../services/api';
import { formatearFecha } from '../utils/fecha';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function fechaClave(valor) {
  return valor ? String(valor).slice(0, 10) : '';
}

function normalizar(valor) {
  return String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export default function DashboardAcpDetalle() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const anio = searchParams.get('anio') || 'todos';
  const mes = searchParams.get('mes') || '';
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [profesional, setProfesional] = useState('todos');
  const [fecha, setFecha] = useState('todas');
  const [sesion, setSesion] = useState('todas');
  const [eess, setEess] = useState('todos');
  const [citasAbiertas, setCitasAbiertas] = useState(() => new Set());

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

  const profesionales = useMemo(() => {
    const opciones = new Map();
    registros.forEach((r) => {
      if (r.id_personal) opciones.set(r.id_personal, r.coordinador || r.id_personal);
    });
    return [...opciones.entries()].sort((a, b) => a[1].localeCompare(b[1], 'es'));
  }, [registros]);

  const fechas = useMemo(() => (
    [...new Set(registros.map((r) => fechaClave(r.fecha_atencion)).filter(Boolean))].sort().reverse()
  ), [registros]);

  const sesiones = useMemo(() => (
    [...new Set(registros.map((r) => Number(r.numero_sesion)).filter(Number.isFinite))].sort((a, b) => a - b)
  ), [registros]);

  const establecimientos = useMemo(() => (
    [...new Set(registros.map((r) => Number(r.eess_numero)).filter(Number.isFinite))].sort((a, b) => a - b)
  ), [registros]);

  const registrosFiltrados = useMemo(() => {
    const texto = normalizar(busqueda.trim());
    return registros.filter((r) => {
      if (profesional !== 'todos' && r.id_personal !== profesional) return false;
      if (fecha !== 'todas' && fechaClave(r.fecha_atencion) !== fecha) return false;
      if (sesion !== 'todas' && String(r.numero_sesion) !== sesion) return false;
      if (eess !== 'todos' && String(r.eess_numero) !== eess) return false;
      if (!texto) return true;

      const filas = Array.isArray(r.registros_cita) ? r.registros_cita : [];
      const contenido = [
        r.id_cita,
        r.coordinador,
        r.coordinador_documento,
        r.id_personal,
        r.profesion_actividad,
        r.numero_sesion,
        r.eess_numero,
        ...filas.flatMap((fila) => [
          fila.codigo_item,
          fila.valor_lab,
          fila.tipo_diagnostico,
          fila.id_registrador,
          fila.registrador,
        ]),
      ].map(normalizar).join(' ');
      return contenido.includes(texto);
    });
  }, [registros, busqueda, profesional, fecha, sesion, eess]);

  const gruposFecha = useMemo(() => {
    const grupos = new Map();
    registrosFiltrados.forEach((registro) => {
      const clave = fechaClave(registro.fecha_atencion) || 'sin-fecha';
      if (!grupos.has(clave)) grupos.set(clave, []);
      grupos.get(clave).push(registro);
    });
    return [...grupos.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([clave, citas]) => ({
        clave,
        citas: [...citas].sort((a, b) => String(a.id_cita).localeCompare(String(b.id_cita))),
      }));
  }, [registrosFiltrados]);

  const hayFiltros = Boolean(busqueda) || profesional !== 'todos' || fecha !== 'todas' || sesion !== 'todas' || eess !== 'todos';

  const limpiarFiltros = () => {
    setBusqueda('');
    setProfesional('todos');
    setFecha('todas');
    setSesion('todas');
    setEess('todos');
  };

  const toggleCita = (registro) => {
    const clave = `${fechaClave(registro.fecha_atencion)}-${registro.id_cita}`;
    setCitasAbiertas((actuales) => {
      const siguientes = new Set(actuales);
      if (siguientes.has(clave)) siguientes.delete(clave);
      else siguientes.add(clave);
      return siguientes;
    });
  };

  const citaAbierta = (registro) => citasAbiertas.has(`${fechaClave(registro.fecha_atencion)}-${registro.id_cita}`);

  return (
    <div className="space-y-4 p-2 sm:p-4">
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
            <h1 className="text-lg font-bold text-gray-800 sm:text-xl">Acompañamientos Clínicos Psicosociales</h1>
            <p className="mt-1 text-sm text-gray-500">Citas APP100 de coordinadores que suman a la meta en {periodo}.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 ring-1 ring-blue-200">
            <Users size={15} />
            {registrosFiltrados.length}{hayFiltros ? ` de ${registros.length}` : ''} cita{registrosFiltrados.length === 1 ? '' : 's'}
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
        Cada cita cumple C7004 tipo D con LAB 1 = ACP, sesión del 1 al 10 y personal mayor que cero; además contiene C7002 tipo D con el EESS del 1 al 4 en el segundo LAB. Los apoyos sin ese segundo LAB no suman a la meta.
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4" aria-label="Filtros de citas ACP">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700"><Filter size={16} /> Filtros</h2>
          {hayFiltros && (
            <button type="button" onClick={limpiarFiltros} className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800">
              <X size={13} /> Limpiar filtros
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <label className="sm:col-span-2 xl:col-span-1">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Buscar</span>
            <span className="flex items-center rounded-lg border border-gray-300 px-2 focus-within:ring-2 focus-within:ring-blue-200">
              <Search size={15} className="shrink-0 text-gray-400" />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Cita, DNI, código o LAB"
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"
              />
            </span>
          </label>
          <FiltroSelect label="Profesional" value={profesional} onChange={setProfesional}>
            <option value="todos">Todos los profesionales</option>
            {profesionales.map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}
          </FiltroSelect>
          <FiltroSelect label="Fecha" value={fecha} onChange={setFecha}>
            <option value="todas">Todas las fechas</option>
            {fechas.map((f) => <option key={f} value={f}>{formatearFecha(f)}</option>)}
          </FiltroSelect>
          <FiltroSelect label="Sesión" value={sesion} onChange={setSesion}>
            <option value="todas">Todas las sesiones</option>
            {sesiones.map((n) => <option key={n} value={String(n)}>Sesión {n}</option>)}
          </FiltroSelect>
          <FiltroSelect label="EESS coordinado" value={eess} onChange={setEess}>
            <option value="todos">Todos los EESS</option>
            {establecimientos.map((n) => <option key={n} value={String(n)}>EESS {n}</option>)}
          </FiltroSelect>
        </div>
      </section>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {cargando ? (
        <div className="flex justify-center py-12"><Loader2 size={30} className="animate-spin text-blue-500" /></div>
      ) : registrosFiltrados.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white py-12 text-center text-sm text-gray-500">
          {hayFiltros ? 'No hay citas que coincidan con los filtros.' : 'No hay atenciones ACP válidas para el periodo seleccionado.'}
        </div>
      ) : (
        <>
          <div className="space-y-5 md:hidden">
            {gruposFecha.map((grupo) => (
              <section key={grupo.clave} className="space-y-2">
                <CabeceraFecha fecha={grupo.clave} cantidad={grupo.citas.length} />
                {grupo.citas.map((r) => (
                  <article key={`${grupo.clave}-${r.id_cita}`} className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-800">{r.coordinador || r.id_personal || 'Sin coordinador'}</p>
                        <p className="text-xs text-gray-500">Cita {r.id_cita} · {r.coordinador_documento || 'Sin documento'}</p>
                      </div>
                      <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Coordinador</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-sm">
                      <Dato label="Sesión" valor={r.numero_sesion} />
                      <Dato label="Personal que recibió ACP" valor={r.cantidad_personal} />
                      <Dato label="Profesión (C7002)" valor={r.profesion_actividad} />
                      <Dato label="EESS coordinado" valor={r.eess_numero ? `EESS ${r.eess_numero}` : null} />
                    </div>
                    <BotonDetalle abierto={citaAbierta(r)} onClick={() => toggleCita(r)} />
                    {citaAbierta(r) && <DetalleCita cita={r} />}
                  </article>
                ))}
              </section>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-lg border border-gray-200 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-3 py-3">Coordinador</th>
                  <th className="px-3 py-3 text-center">Sesión</th>
                  <th className="px-3 py-3 text-center">Personal ACP</th>
                  <th className="px-3 py-3">Profesión C7002</th>
                  <th className="px-3 py-3 text-center">EESS</th>
                  <th className="px-3 py-3">Cita</th>
                  <th className="px-3 py-3 text-center">Registro</th>
                </tr>
              </thead>
              {gruposFecha.map((grupo) => (
                <tbody key={grupo.clave} className="border-t border-gray-200 bg-white">
                  <tr className="bg-blue-50/70">
                    <td colSpan={7} className="px-3 py-2"><CabeceraFecha fecha={grupo.clave} cantidad={grupo.citas.length} /></td>
                  </tr>
                  {grupo.citas.map((r) => (
                    <Fragment key={`${grupo.clave}-${r.id_cita}`}>
                      <tr className="border-t border-gray-100 hover:bg-blue-50">
                        <td className="px-3 py-3">
                          <p className="font-medium text-gray-800">{r.coordinador || r.id_personal || '—'}</p>
                          <p className="text-xs text-gray-500">{r.coordinador_documento || r.coordinador_profesion || ''}</p>
                        </td>
                        <td className="px-3 py-3 text-center font-semibold text-blue-700">{r.numero_sesion}</td>
                        <td className="px-3 py-3 text-center font-semibold text-gray-800">{r.cantidad_personal}</td>
                        <td className="px-3 py-3 text-gray-700">{r.profesion_actividad || '—'}</td>
                        <td className="px-3 py-3 text-center text-gray-700">EESS {r.eess_numero}</td>
                        <td className="px-3 py-3 font-mono text-xs text-gray-500">{r.id_cita}</td>
                        <td className="px-3 py-3 text-center"><BotonDetalle abierto={citaAbierta(r)} onClick={() => toggleCita(r)} compacto /></td>
                      </tr>
                      {citaAbierta(r) && (
                        <tr className="border-t border-blue-100 bg-blue-50/30">
                          <td colSpan={7} className="p-3"><DetalleCita cita={r} /></td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function FiltroSelect({ label, value, onChange, children }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm focus:ring-2 focus:ring-blue-200">
        {children}
      </select>
    </label>
  );
}

function CabeceraFecha({ fecha, cantidad }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold text-blue-900">{fecha === 'sin-fecha' ? 'Sin fecha' : formatearFecha(fecha)}</h2>
      <span className="text-xs font-medium text-blue-700">{cantidad} cita{cantidad === 1 ? '' : 's'}</span>
    </div>
  );
}

function BotonDetalle({ abierto, onClick, compacto = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${compacto ? 'px-2 py-1' : 'w-full px-3 py-2'} inline-flex items-center justify-center gap-1 rounded-lg bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100`}
      aria-expanded={abierto}
    >
      {abierto ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      {abierto ? 'Ocultar detalle' : 'Ver registro exacto'}
    </button>
  );
}

function DetalleCita({ cita }) {
  const filas = Array.isArray(cita.registros_cita) ? cita.registros_cita : [];
  return (
    <div className="space-y-3 rounded-lg border border-blue-200 bg-white p-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-800">Registro nominal de la cita {cita.id_cita}</h3>
        <p className="text-xs text-gray-500">{formatearFecha(cita.fecha_atencion)} · {filas.length} fila{filas.length === 1 ? '' : 's'} registrada{filas.length === 1 ? '' : 's'}, ordenadas por correlativo.</p>
      </div>
      {filas.length === 0 ? (
        <p className="text-sm text-gray-500">No se encontraron filas nominales para esta cita.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2 lg:hidden">
            {filas.map((fila) => <FilaDetalleMovil key={fila.id_correlativo} fila={fila} />)}
          </div>
          <div className="hidden overflow-x-auto rounded-lg border border-gray-200 lg:block">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-2 py-2 text-center">Corr.</th>
                  <th className="px-2 py-2">Actividad</th>
                  <th className="px-2 py-2">Código / registro</th>
                  <th className="px-2 py-2 text-center">Tipo Dx</th>
                  <th className="px-2 py-2 text-center">LAB</th>
                  <th className="px-2 py-2">Valor LAB</th>
                  <th className="px-2 py-2">Registrado por</th>
                  <th className="px-2 py-2">Fecha de registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filas.map((fila) => (
                  <tr key={fila.id_correlativo} className="align-top">
                    <td className="px-2 py-2 text-center font-mono text-gray-500">{fila.id_correlativo}</td>
                    <td className="px-2 py-2 font-mono text-gray-600">{fila.id_actividad || '—'}</td>
                    <td className="px-2 py-2">
                      <span className={`inline-block rounded px-1.5 py-0.5 font-mono font-semibold ${colorCodigo(fila.codigo_item)}`}>{fila.codigo_item}</span>
                      <p className="mt-1 text-gray-500">{descripcionRegistro(fila)}</p>
                    </td>
                    <td className="px-2 py-2 text-center font-semibold text-gray-700">{fila.tipo_diagnostico || '—'}</td>
                    <td className="px-2 py-2 text-center font-semibold text-blue-700">{fila.id_correlativo_lab ?? '—'}</td>
                    <td className="px-2 py-2 font-medium text-gray-800">{fila.valor_lab ?? '—'}</td>
                    <td className="px-2 py-2 text-gray-700">
                      <p>{fila.registrador || fila.id_registrador || '—'}</p>
                      {fila.registrador && fila.id_registrador && <p className="font-mono text-[10px] text-gray-400">{fila.id_registrador}</p>}
                    </td>
                    <td className="px-2 py-2 text-gray-600">{formatearFechaHora(fila.fecha_registro)}</td>
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

function FilaDetalleMovil({ fila }) {
  return (
    <div className="rounded-lg border border-gray-200 p-3 text-xs">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className={`inline-block rounded px-1.5 py-0.5 font-mono font-semibold ${colorCodigo(fila.codigo_item)}`}>{fila.codigo_item}</span>
          <p className="mt-1 text-gray-500">{descripcionRegistro(fila)}</p>
        </div>
        <span className="font-mono text-gray-400">#{fila.id_correlativo}</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 border-t border-gray-100 pt-2">
        <Dato label="Actividad" valor={fila.id_actividad} />
        <Dato label="Tipo Dx" valor={fila.tipo_diagnostico} />
        <Dato label="LAB" valor={fila.id_correlativo_lab} />
        <Dato label="Valor LAB" valor={fila.valor_lab} />
        <Dato label="Registrado por" valor={fila.registrador || fila.id_registrador} />
        <Dato label="Fecha de registro" valor={formatearFechaHora(fila.fecha_registro)} />
      </div>
    </div>
  );
}

function descripcionRegistro(fila) {
  const codigo = String(fila.codigo_item || '').trim().toUpperCase();
  const lab = Number(fila.id_correlativo_lab);
  if (codigo === 'C7004') {
    if (lab === 1) return 'Asistencia técnica · identificador ACP';
    if (lab === 2) return 'Asistencia técnica · número de sesión';
    if (lab === 3) return 'Asistencia técnica · personal que recibió ACP';
    return 'Asistencia técnica';
  }
  if (codigo === 'C7002') {
    if (lab === 1) return 'Supervisión · profesión del coordinador';
    if (lab === 2) return 'Supervisión · EESS coordinado';
    return 'Supervisión';
  }
  return 'Otro registro de la cita';
}

function colorCodigo(codigo) {
  const valor = String(codigo || '').trim().toUpperCase();
  if (valor === 'C7004') return 'bg-emerald-100 text-emerald-700';
  if (valor === 'C7002') return 'bg-violet-100 text-violet-700';
  return 'bg-gray-100 text-gray-700';
}

function formatearFechaHora(valor) {
  if (!valor) return '—';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return String(valor);
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' }).format(fecha);
}

function Dato({ label, valor }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 font-medium text-gray-700">{valor ?? '—'}</p>
    </div>
  );
}
