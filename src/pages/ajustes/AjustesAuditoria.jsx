import { useEffect, useState } from 'react';
import { Eye, Loader2, X, Filter } from 'lucide-react';
import { obtenerAuditoria, obtenerAuditoriaDetalle } from '../../services/api';

const ENTIDADES = ['paquete', 'regla_especial', 'usuario', 'profesion_componente'];
const ACCIONES_COLOR = {
  crear:     'bg-green-100 text-green-700',
  editar:    'bg-blue-100 text-blue-700',
  eliminar:  'bg-red-100 text-red-700',
  restaurar: 'bg-amber-100 text-amber-700',
};

export default function AjustesAuditoria() {
  const [entradas, setEntradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtros, setFiltros] = useState({ entidad: '', entidad_id: '', desde: '', hasta: '' });
  const [detalle, setDetalle] = useState(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const limpios = Object.fromEntries(Object.entries(filtros).filter(([_, v]) => v));
      const data = await obtenerAuditoria(limpios);
      setEntradas(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };
  useEffect(() => { cargar(); }, []);

  const verDetalle = async (id) => {
    try {
      const data = await obtenerAuditoriaDetalle(id);
      setDetalle(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-on-surface">Auditoría de cambios</h2>

      {/* Filtros */}
      <div className="rounded-xl glass-card border border-outline-variant/15 p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-on-surface">
          <Filter size={15} /> Filtros
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
          <select
            value={filtros.entidad}
            onChange={(e) => setFiltros({ ...filtros, entidad: e.target.value })}
            className="px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm"
          >
            <option value="">Toda entidad</option>
            {ENTIDADES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <input
            value={filtros.entidad_id}
            onChange={(e) => setFiltros({ ...filtros, entidad_id: e.target.value })}
            placeholder="ID entidad (ej: PF_DEPRESION)"
            className="px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm"
          />
          <input
            type="datetime-local"
            value={filtros.desde}
            onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })}
            className="px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm"
          />
          <input
            type="datetime-local"
            value={filtros.hasta}
            onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })}
            className="px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm"
          />
          <button
            onClick={cargar}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary/90"
          >
            Aplicar
          </button>
        </div>
      </div>

      {cargando ? (
        <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
      ) : entradas.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl bg-surface-container/40 text-sm text-outline border border-outline-variant/15">
          No hay entradas que coincidan.
        </div>
      ) : (
        <>
        {/* Cards móvil */}
        <div className="grid grid-cols-1 gap-2.5 md:hidden">
          {entradas.map(e => (
            <button
              key={e.id}
              onClick={() => verDetalle(e.id)}
              className="text-left rounded-xl glass-card border border-outline-variant/15 p-3 space-y-1.5 hover:bg-primary/5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ACCIONES_COLOR[e.accion] || 'bg-gray-100'}`}>
                  {e.accion}
                </span>
                <span className="text-[11px] text-outline">{new Date(e.timestamp).toLocaleString('es-PE')}</span>
              </div>
              <div className="text-xs">
                <span className="text-outline">{e.entidad}</span>
                <span className="font-mono ml-1 break-all">{e.entidad_id}</span>
              </div>
              <p className="text-xs text-on-surface">{e.diff_resumen || '—'}</p>
              <p className="text-[11px] text-outline">por <span className="font-mono">{e.usuario_username || '—'}</span></p>
            </button>
          ))}
        </div>

        {/* Tabla (md+) */}
        <div className="hidden md:block overflow-x-auto rounded-xl glass-card border border-outline-variant/15">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low text-xs font-semibold uppercase tracking-wide text-outline">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Entidad</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Acción</th>
                <th className="px-4 py-3">Resumen</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {entradas.map(e => (
                <tr key={e.id} className="hover:bg-primary/4">
                  <td className="px-4 py-3 text-xs text-outline whitespace-nowrap">
                    {new Date(e.timestamp).toLocaleString('es-PE')}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono">{e.usuario_username || '—'}</td>
                  <td className="px-4 py-3 text-xs">{e.entidad}</td>
                  <td className="px-4 py-3 text-xs font-mono">{e.entidad_id}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ACCIONES_COLOR[e.accion] || 'bg-gray-100'}`}>
                      {e.accion}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-on-surface max-w-xl truncate" title={e.diff_resumen}>
                    {e.diff_resumen || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => verDetalle(e.id)} className="p-1.5 rounded hover:bg-primary/10 text-primary">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {detalle && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-surface-bright rounded-t-xl sm:rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-on-surface">
                Cambio en <span className="font-mono">{detalle.entidad}/{detalle.entidad_id}</span>
              </h3>
              <button onClick={() => setDetalle(null)}><X size={16} /></button>
            </div>
            <div className="text-xs text-outline">
              {new Date(detalle.timestamp).toLocaleString('es-PE')} — por {detalle.usuario_username || 'sistema'} —
              <span className={`ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full ${ACCIONES_COLOR[detalle.accion] || 'bg-gray-100'}`}>{detalle.accion}</span>
            </div>
            {detalle.diff_resumen && (
              <div className="p-2 bg-amber-50 text-xs text-amber-900 rounded">{detalle.diff_resumen}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-outline mb-1">ANTES</p>
                <pre className="text-[11px] bg-red-50/40 border border-red-100 p-2 rounded overflow-auto max-h-96">
                  {detalle.estado_antes ? JSON.stringify(detalle.estado_antes, null, 2) : '(sin datos)'}
                </pre>
              </div>
              <div>
                <p className="text-xs font-semibold text-outline mb-1">DESPUÉS</p>
                <pre className="text-[11px] bg-green-50/40 border border-green-100 p-2 rounded overflow-auto max-h-96">
                  {detalle.estado_despues ? JSON.stringify(detalle.estado_despues, null, 2) : '(sin datos)'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
