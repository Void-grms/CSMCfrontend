import { useState, useEffect, useMemo, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { obtenerPaquete } from '../services/api';
import Badge from '../components/ui/Badge';
import {
  ArrowLeft, AlertTriangle, CheckCircle2, Clock, ChevronDown, ChevronRight,
  User, Activity
} from 'lucide-react';

export default function PaqueteDetalle() {
  const { id } = useParams();
  // Si la página fue abierta como nueva pestaña (sin historial previo), cerramos la pestaña.
  // Si tiene historial (navegación interna), retrocedemos.
  const handleVolver = () => {
    if (window.history.length <= 1) {
      window.close();
    } else {
      window.history.back();
    }
  };

  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [citasAbiertas, setCitasAbiertas] = useState({});

  useEffect(() => {
    obtenerPaquete(id)
      .then(setDatos)
      .catch((err) => setError(err.message ?? 'Error al cargar el paquete'))
      .finally(() => setCargando(false));
  }, [id]);

  // Safe destructuring (datos can be null while loading/error)
  const pp = datos?.paquete_paciente ?? {};
  const paciente = datos?.paciente ?? {};
  const componentes = datos?.componentes ?? [];
  const porcentaje_avance = datos?.porcentaje_avance ?? 0;
  const timeline = datos?.timeline ?? [];

  const cumplidos = componentes.filter((c) => c.cumplido).length;

  // ── Agrupar timeline por id_cita (como en ReporteProfesionales) ──
  const citasAgrupadas = useMemo(() => {
    const grupos = {};
    for (const r of timeline) {
      if (!grupos[r.id_cita]) {
        grupos[r.id_cita] = {
          id_cita: r.id_cita,
          fecha_atencion: r.fecha_atencion,
          nombre_profesional: r.nombre_profesional,
          id_turno: r.id_turno,
          items: [],
        };
      }
      grupos[r.id_cita].items.push({
        id_correlativo: r.id_correlativo,
        codigo_item: r.codigo_item,
        tipo_diagnostico: r.tipo_diagnostico,
        valor_lab: r.valor_lab,
      });
    }
    return Object.values(grupos);
  }, [timeline]);

  const toggleCita = (id_cita) => setCitasAbiertas(p => ({ ...p, [id_cita]: !p[id_cita] }));

  // Color de barra de progreso
  const barColor =
    porcentaje_avance >= 100 ? 'bg-green-500' :
    porcentaje_avance >= 60 ? 'bg-blue-500' :
    porcentaje_avance >= 30 ? 'bg-yellow-500' : 'bg-red-400';

  /* ── Cargando ── */
  if (cargando) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="mx-auto mt-20 max-w-md rounded-lg bg-red-50 p-6 text-center text-red-700">
        <AlertTriangle className="mx-auto mb-2" size={28} />
        <p className="font-medium">No se pudo cargar el paquete</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Botón volver */}
      <button
        onClick={handleVolver}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
        title="Cerrar esta pestaña / volver"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      {/* ═══ LAYOUT: Datos del paciente + Tabla de componentes — lado a lado ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Card datos generales (2 cols) ── */}
        <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 self-start">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold text-gray-800 leading-tight">
              {pp.nombre_paquete ?? pp.id_paquete}
            </h2>
            <Badge color={pp.estado === 'completado' ? 'green' : pp.estado === 'vencido' ? 'red' : 'blue'}>
              {pp.estado}
            </Badge>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <User size={14} className="text-gray-400 shrink-0" />
              <span className="font-medium text-gray-700">
                {paciente?.nombre_completo ?? pp.id_paciente}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-gray-500">
              <div><span className="text-gray-400">DNI:</span> <span className="font-medium text-gray-700">{paciente?.dni ?? '—'}</span></div>
              {paciente?.historia_clinica && (
                <div><span className="text-gray-400">Hª Clínica:</span> <span className="font-medium text-gray-700">{paciente.historia_clinica}</span></div>
              )}
              <div><span className="text-gray-400">Inicio:</span> <span className="font-medium text-gray-700">{pp.fecha_inicio ? new Date(pp.fecha_inicio).toLocaleDateString('es-PE') : '—'}</span></div>
              <div><span className="text-gray-400">Límite:</span> <span className="font-medium text-gray-700">{pp.fecha_limite ? new Date(pp.fecha_limite).toLocaleDateString('es-PE') : '—'}</span></div>
            </div>

            {pp.dx_principal && (
              <div className="text-xs text-gray-500 pt-1 border-t border-gray-100">
                <span className="text-gray-400">Dx principal: </span>
                <span className="font-medium text-gray-700">{pp.dx_principal}</span>
                {pp.tipo_diagnostico_dx && (
                  <span className="ml-1.5 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-gray-500">
                    {pp.tipo_diagnostico_dx === 'P' ? 'Presuntivo'
                      : pp.tipo_diagnostico_dx === 'D' ? 'Definitivo'
                        : 'Repetido'}
                  </span>
                )}
                {pp.valor_lab_dx != null && pp.valor_lab_dx !== '' && (
                  <span className="ml-1.5 text-gray-400">val: {pp.valor_lab_dx}</span>
                )}
              </div>
            )}
          </div>

          {/* Barra de progreso */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
              <span>Progreso de componentes</span>
              <span className="font-bold text-gray-700 text-sm">{porcentaje_avance}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${barColor} transition-all duration-500`}
                style={{ width: `${porcentaje_avance}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {cumplidos} de {componentes.length} componentes cumplidos
            </p>
          </div>
        </div>

        {/* ── Tabla de componentes (3 cols) ── */}
        <div className="lg:col-span-3">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Componentes del paquete</h3>
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-700 text-white text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Componente</th>
                  <th className="px-4 py-3 text-center w-24">Requerido</th>
                  <th className="px-4 py-3 text-center w-24">Realizado</th>
                  <th className="px-4 py-3 text-center w-24">Pendiente</th>
                  <th className="px-4 py-3 text-center w-28">Estado</th>
                </tr>
              </thead>
              <tbody>
                {componentes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                      Este paquete no tiene componentes registrados
                    </td>
                  </tr>
                ) : (
                  componentes.map((c, i) => {
                    const pendiente = Math.max(0, c.cantidad_minima - (c.cantidad_realizada ?? 0));
                    // Row background based on status
                    const rowBg = c.cumplido
                      ? 'bg-green-50 hover:bg-green-100'
                      : pendiente > 0
                        ? 'bg-amber-50/60 hover:bg-amber-50'
                        : 'bg-white hover:bg-gray-50';
                    const borderL = c.cumplido
                      ? 'border-l-4 border-l-green-500'
                      : 'border-l-4 border-l-amber-400';

                    return (
                      <tr key={c.tipo_componente} className={`${rowBg} ${borderL} transition`}>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          <span className="flex items-center gap-1.5">
                            {c.tipo_componente}
                            {c.usar_prefijo && (
                              <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-600">
                                prefijo
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">
                            {c.cantidad_minima}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ${
                            c.cumplido
                              ? 'bg-green-200 text-green-800'
                              : (c.cantidad_realizada ?? 0) > 0
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-red-100 text-red-600'
                          }`}>
                            {c.cantidad_realizada ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {pendiente > 0 ? (
                            <span className="inline-flex items-center justify-center rounded-full bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-800">
                              {pendiente}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {c.cumplido ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                              <CheckCircle2 size={14} /> Cumplido
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                              <Clock size={14} /> Pendiente
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═══ TIMELINE: Historial de atenciones agrupadas por id_cita ═══ */}
      {citasAgrupadas.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            Historial de atenciones ({timeline.length} registros en {citasAgrupadas.length} citas)
          </h3>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="w-10 px-4 py-3"></th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Profesional</th>
                    <th className="px-4 py-3">Turno</th>
                    <th className="px-4 py-3 text-center">Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {citasAgrupadas.map((c) => {
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
                          <td className="px-4 py-3 font-medium text-slate-700">
                            {c.fecha_atencion ? new Date(c.fecha_atencion).toLocaleDateString('es-PE') : '—'}
                          </td>
                          <td className="px-4 py-3">{c.nombre_profesional ?? '—'}</td>
                          <td className="px-4 py-3">{c.id_turno ?? '—'}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                              {c.items.length}
                            </span>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr className="bg-slate-50/50">
                            <td colSpan="5" className="p-0 border-t-0">
                              <div className="px-14 py-4 bg-blue-50/30 border-l-4 border-blue-500 shadow-inner">
                                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5 mb-3">
                                  <Activity size={14} className="text-slate-400" /> Procedimientos y Diagnósticos
                                </h4>
                                <ul className="space-y-2">
                                  {c.items.map((it) => {
                                    const mapaDx = {
                                      P: ['Presuntivo', 'bg-amber-100 text-amber-700 border-amber-200'],
                                      D: ['Definitivo', 'bg-blue-100 text-blue-700 border-blue-200'],
                                      R: ['Repetido', 'bg-gray-100 text-gray-600 border-gray-200'],
                                    };
                                    const [dxLabel, dxClase] = mapaDx[it.tipo_diagnostico] ?? [it.tipo_diagnostico, 'bg-gray-100 text-gray-600 border-gray-200'];
                                    return (
                                      <li key={it.id_correlativo} className="flex items-center bg-white border border-slate-200 rounded-md p-2 shadow-sm gap-2">
                                        <div className="bg-slate-100 font-mono text-xs font-bold text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                                          {it.codigo_item}
                                        </div>
                                        {it.tipo_diagnostico && (
                                          <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold border ${dxClase}`}>
                                            {dxLabel}
                                          </span>
                                        )}
                                        {it.valor_lab != null && it.valor_lab !== '' && (
                                          <span className="bg-yellow-100 text-yellow-800 px-1 rounded text-xs border border-yellow-200 font-medium">
                                            VAL: {it.valor_lab}
                                          </span>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}