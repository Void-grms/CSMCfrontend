import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Search, Loader2, AlertTriangle, CheckCircle2, UserCheck, UserX, RefreshCw, Info
} from 'lucide-react';
import {
  obtenerAjustesProfesionales,
  activarProfesional,
  desactivarProfesional,
} from '../../services/api';

const ESTADOS = [
  { value: 'todos',    label: 'Todos' },
  { value: 'activo',   label: 'Activos' },
  { value: 'inactivo', label: 'Inactivos' },
];

function Badge({ activo }) {
  return activo ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-[11px] font-semibold">
      <CheckCircle2 size={11} /> Activo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[11px] font-semibold">
      <UserX size={11} /> Inactivo
    </span>
  );
}

export default function AjustesPersonal() {
  const [profesionales, setProfesionales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [estado, setEstado] = useState('todos');
  const [q, setQ] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [accionEnCurso, setAccionEnCurso] = useState(null); // id_personal en operación

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const data = await obtenerAjustesProfesionales({
        estado,
        q: q.trim() || undefined,
        limite: 2000,
      });
      setProfesionales(data);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err?.response?.data?.error || err.message });
    } finally {
      setCargando(false);
    }
  }, [estado, q]);

  useEffect(() => { cargar(); }, [estado]);

  // Búsqueda con un pequeño debounce para no machacar el endpoint en cada tecla.
  useEffect(() => {
    const id = setTimeout(() => { cargar(); }, 250);
    return () => clearTimeout(id);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const fmtFecha = (f) => f ? new Date(f).toLocaleDateString('es-PE') : '—';

  const cambiarEstado = async (p) => {
    const accion = p.activo ? 'desactivar' : 'activar';
    const verbo  = p.activo ? 'dar de baja' : 'reactivar';
    if (!window.confirm(
      `¿${verbo[0].toUpperCase() + verbo.slice(1)} a ${p.nombre_completo}?\n\n` +
      `Esta corrección manual será sobreescrita la próxima vez que se importe el maestro_profesional.`
    )) return;

    setAccionEnCurso(p.id_personal);
    setMensaje(null);
    try {
      const fn = p.activo ? desactivarProfesional : activarProfesional;
      await fn(p.id_personal);
      setMensaje({
        tipo: 'ok',
        texto: `${p.nombre_completo} fue ${p.activo ? 'dado de baja' : 'reactivado'} correctamente.`,
      });
      await cargar();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err?.response?.data?.error || err.message });
    } finally {
      setAccionEnCurso(null);
    }
  };

  const conteos = useMemo(() => {
    const activos   = profesionales.filter(p => p.activo).length;
    const inactivos = profesionales.length - activos;
    return { activos, inactivos, total: profesionales.length };
  }, [profesionales]);

  return (
    <div className="space-y-4">
      {/* Aviso explicando la regla del maestro */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start gap-2 text-xs sm:text-sm text-amber-800">
        <Info size={16} className="shrink-0 mt-0.5" />
        <div>
          <strong>Las correcciones manuales son temporales.</strong> Al volver a importar el archivo
          <code className="mx-1 px-1 bg-amber-100 rounded">maestro_profesional</code>, los valores del CSV
          sobreescriben cualquier reactivación o baja manual hecha aquí.
        </div>
      </div>

      {/* Mensaje flotante */}
      {mensaje && (
        <div className={`rounded-lg border p-3 text-sm flex items-start gap-2 ${
          mensaje.tipo === 'error'
            ? 'border-red-200 bg-red-50 text-red-800'
            : 'border-green-200 bg-green-50 text-green-800'
        }`}>
          {mensaje.tipo === 'error' ? <AlertTriangle size={16} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={16} className="mt-0.5 shrink-0" />}
          <span className="flex-1">{mensaje.texto}</span>
          <button onClick={() => setMensaje(null)} className="text-current opacity-50 hover:opacity-100">×</button>
        </div>
      )}

      {/* Filtros */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Buscar</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="DNI, apellidos o nombres..."
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Estado</label>
            <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden">
              {ESTADOS.map(e => (
                <button
                  key={e.value}
                  onClick={() => setEstado(e.value)}
                  className={`px-3 py-2 text-xs sm:text-sm font-medium transition ${
                    estado === e.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={cargar}
            disabled={cargando}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            title="Recargar"
          >
            <RefreshCw size={14} className={cargando ? 'animate-spin' : ''} />
            Recargar
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
          <span><strong className="text-slate-800">{conteos.total}</strong> en lista</span>
          <span className="text-green-700"><strong>{conteos.activos}</strong> activos</span>
          <span className="text-red-700"><strong>{conteos.inactivos}</strong> inactivos</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">DNI</th>
                <th className="px-4 py-3">Nombre completo</th>
                <th className="px-4 py-3">Profesión</th>
                <th className="px-4 py-3 text-center">Fecha alta</th>
                <th className="px-4 py-3 text-center">Fecha baja</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <tr><td colSpan="7" className="px-4 py-10 text-center text-slate-400">
                  <Loader2 className="mx-auto animate-spin" size={20} />
                </td></tr>
              ) : profesionales.length === 0 ? (
                <tr><td colSpan="7" className="px-4 py-10 text-center text-slate-400">
                  Sin resultados con los filtros aplicados.
                </td></tr>
              ) : profesionales.map(p => (
                <tr key={p.id_personal} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{p.numero_documento || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{p.nombre_completo}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{p.id_personal}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{p.id_profesion || '—'}</td>
                  <td className="px-4 py-3 text-xs text-center text-slate-600">{fmtFecha(p.fecha_alta)}</td>
                  <td className="px-4 py-3 text-xs text-center text-slate-600">{fmtFecha(p.fecha_baja)}</td>
                  <td className="px-4 py-3 text-center"><Badge activo={p.activo} /></td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => cambiarEstado(p)}
                      disabled={accionEnCurso === p.id_personal}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition ${
                        p.activo
                          ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                          : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                      } disabled:opacity-50`}
                    >
                      {accionEnCurso === p.id_personal
                        ? <Loader2 size={12} className="animate-spin" />
                        : (p.activo ? <UserX size={12} /> : <UserCheck size={12} />)}
                      {p.activo ? 'Dar de baja' : 'Reactivar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
