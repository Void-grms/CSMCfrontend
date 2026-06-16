import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit2, Trash2, RotateCcw, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  obtenerAjustesPaquetes,
  eliminarAjustesPaquete,
  restaurarAjustesPaquete
} from '../../services/api';

function Badge({ color = 'gray', children }) {
  const cls = {
    green:  'bg-green-100 text-green-700 border-green-200',
    red:    'bg-red-100   text-red-700   border-red-200',
    blue:   'bg-blue-100  text-blue-700  border-blue-200',
    gray:   'bg-gray-100  text-gray-700  border-gray-200',
    amber:  'bg-amber-100 text-amber-700 border-amber-200',
  }[color];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>{children}</span>;
}

export default function AjustesPaquetes() {
  const navigate = useNavigate();
  const [paquetes, setPaquetes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('activos'); // activos | eliminados | todos
  const [mensaje, setMensaje] = useState(null);
  const [confirmacion, setConfirmacion] = useState(null); // { paquete, accion }

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await obtenerAjustesPaquetes(true);
      setPaquetes(data);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error al cargar paquetes' });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const filtrados = paquetes.filter(p => {
    if (filtroEstado === 'activos' && !p.activo) return false;
    if (filtroEstado === 'eliminados' && p.activo) return false;
    if (filtroTexto) {
      const t = filtroTexto.toLowerCase();
      return (
        p.nombre?.toLowerCase().includes(t) ||
        p.id_paquete?.toLowerCase().includes(t) ||
        p.codigo_paquete?.toLowerCase().includes(t)
      );
    }
    return true;
  });

  const ejecutarConfirmacion = async () => {
    if (!confirmacion) return;
    const { paquete, accion } = confirmacion;
    try {
      if (accion === 'eliminar') {
        await eliminarAjustesPaquete(paquete.id_paquete);
        setMensaje({ tipo: 'ok', texto: `Paquete ${paquete.nombre} marcado como eliminado.` });
      } else if (accion === 'restaurar') {
        await restaurarAjustesPaquete(paquete.id_paquete);
        setMensaje({ tipo: 'ok', texto: `Paquete ${paquete.nombre} restaurado.` });
      }
      setConfirmacion(null);
      await cargar();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error al ejecutar la acción' });
      setConfirmacion(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3">
        <div className="flex-1 min-w-0 sm:min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
          <input
            type="text"
            placeholder="Buscar..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm"
          >
            <option value="activos">Solo activos</option>
            <option value="eliminados">Solo eliminados</option>
            <option value="todos">Todos</option>
          </select>
          <Link
            to="/ajustes/paquetes/nuevo"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90 shadow-sm whitespace-nowrap"
          >
            <Plus size={16} /> <span className="hidden xs:inline sm:inline">Nuevo</span>
          </Link>
        </div>
      </div>

      {/* Mensajes */}
      {mensaje && (
        <div className={`flex items-start gap-2 p-3 rounded-lg border text-sm ${
          mensaje.tipo === 'ok'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {mensaje.tipo === 'ok' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span className="flex-1">{mensaje.texto}</span>
          <button onClick={() => setMensaje(null)} className="text-xs underline">cerrar</button>
        </div>
      )}

      {/* Lista */}
      {cargando ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl bg-surface-container/40 text-sm text-outline border border-outline-variant/15">
          No hay paquetes que coincidan con el filtro
        </div>
      ) : (
        <>
        {/* Vista de tarjetas (solo móvil/tablet) */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {filtrados.map(p => (
            <div key={p.id_paquete} className="rounded-xl glass-card border border-outline-variant/15 p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-outline">{p.codigo_paquete || '—'}</span>
                    {p.activo
                      ? <Badge color="green">Activo</Badge>
                      : <Badge color="red">Eliminado</Badge>}
                    <span className="font-mono text-[10px] text-outline">v{p.version_actual}</span>
                  </div>
                  <h3 className="font-semibold text-on-surface text-sm mt-1 leading-snug">{p.nombre}</h3>
                  <p className="text-[11px] text-outline font-mono break-all">{p.id_paquete}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-outline-variant/15">
                <div>
                  <p className="text-[10px] uppercase text-outline tracking-wide">Plazo</p>
                  <p className="font-semibold text-on-surface">{p.plazo_dias} días</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-outline tracking-wide">Edades</p>
                  <p className="font-semibold text-on-surface">
                    {p.edad_minima != null && p.edad_maxima != null && `${p.edad_minima}–${p.edad_maxima}`}
                    {p.edad_minima != null && p.edad_maxima == null && `≥${p.edad_minima}`}
                    {p.edad_minima == null && p.edad_maxima != null && `≤${p.edad_maxima}`}
                    {p.edad_minima == null && p.edad_maxima == null && '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-outline tracking-wide">Componentes</p>
                  <p className="font-semibold text-on-surface">{p.componentes_count}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-outline tracking-wide">CIE-10</p>
                  <p className="font-semibold text-on-surface">{p.dx_count}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] uppercase text-outline tracking-wide">Paquetes abiertos</p>
                  {p.abiertos_count > 0
                    ? <Badge color="blue">{p.abiertos_count}</Badge>
                    : <span className="text-outline text-xs">Ninguno</span>}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/15">
                <button
                  onClick={() => navigate(`/ajustes/paquetes/${p.id_paquete}`)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium"
                ><Eye size={14} /> Ver</button>
                {p.activo && (
                  <button
                    onClick={() => navigate(`/ajustes/paquetes/${p.id_paquete}/editar`)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium"
                  ><Edit2 size={14} /> Editar</button>
                )}
                {p.activo ? (
                  <button
                    onClick={() => setConfirmacion({ paquete: p, accion: 'eliminar' })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium"
                  ><Trash2 size={14} /></button>
                ) : (
                  <button
                    onClick={() => setConfirmacion({ paquete: p, accion: 'restaurar' })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs font-medium"
                  ><RotateCcw size={14} /></button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tabla (md+) — ancho fijo por columna, texto envuelve a la siguiente línea */}
        <div className="hidden md:block rounded-xl glass-card border border-outline-variant/15">
          <table className="w-full table-fixed text-left text-sm">
            <colgroup>
              <col style={{ width: '5%'  }} />{/* Código */}
              <col style={{ width: '33%' }} />{/* Nombre */}
              <col style={{ width: '6%'  }} />{/* Plazo */}
              <col style={{ width: '7%'  }} />{/* Edades */}
              <col style={{ width: '9%'  }} />{/* Componentes */}
              <col style={{ width: '7%'  }} />{/* CIE-10 */}
              <col style={{ width: '8%'  }} />{/* Abiertos */}
              <col style={{ width: '4%'  }} />{/* v */}
              <col style={{ width: '9%'  }} />{/* Estado */}
              <col style={{ width: '12%' }} />{/* Acciones */}
            </colgroup>
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low text-xs font-semibold uppercase tracking-wide text-outline">
                <th className="px-3 py-3">Código</th>
                <th className="px-3 py-3">Nombre</th>
                <th className="px-3 py-3 text-center">Plazo</th>
                <th className="px-3 py-3 text-center">Edades</th>
                <th className="px-3 py-3 text-center break-words">Compon.</th>
                <th className="px-3 py-3 text-center">CIE-10</th>
                <th className="px-3 py-3 text-center">Abiertos</th>
                <th className="px-3 py-3 text-center">v</th>
                <th className="px-3 py-3 text-center">Estado</th>
                <th className="px-3 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filtrados.map(p => (
                <tr key={p.id_paquete} className="hover:bg-primary/4 transition-colors align-top">
                  <td className="px-3 py-3 font-mono text-xs break-words">{p.codigo_paquete || '—'}</td>
                  <td className="px-3 py-3">
                    <div className="font-semibold text-on-surface break-words">{p.nombre}</div>
                    <div className="text-[11px] text-outline font-mono break-all">{p.id_paquete}</div>
                  </td>
                  <td className="px-3 py-3 text-center">{p.plazo_dias}d</td>
                  <td className="px-3 py-3 text-center text-xs">
                    {p.edad_minima != null && p.edad_maxima != null && `${p.edad_minima}–${p.edad_maxima}`}
                    {p.edad_minima != null && p.edad_maxima == null && `≥${p.edad_minima}`}
                    {p.edad_minima == null && p.edad_maxima != null && `≤${p.edad_maxima}`}
                    {p.edad_minima == null && p.edad_maxima == null && '—'}
                  </td>
                  <td className="px-3 py-3 text-center">{p.componentes_count}</td>
                  <td className="px-3 py-3 text-center">{p.dx_count}</td>
                  <td className="px-3 py-3 text-center">
                    {p.abiertos_count > 0
                      ? <Badge color="blue">{p.abiertos_count}</Badge>
                      : <span className="text-outline">0</span>}
                  </td>
                  <td className="px-3 py-3 text-center font-mono text-xs text-outline">v{p.version_actual}</td>
                  <td className="px-3 py-3 text-center">
                    {p.activo
                      ? <Badge color="green">Activo</Badge>
                      : <Badge color="red">Eliminado</Badge>}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <div className="inline-flex flex-wrap justify-end gap-0.5">
                      <button
                        onClick={() => navigate(`/ajustes/paquetes/${p.id_paquete}`)}
                        title="Ver detalle"
                        className="p-1.5 rounded hover:bg-primary/10 text-primary"
                      ><Eye size={15} /></button>
                      {p.activo && (
                        <button
                          onClick={() => navigate(`/ajustes/paquetes/${p.id_paquete}/editar`)}
                          title="Editar"
                          className="p-1.5 rounded hover:bg-primary/10 text-primary"
                        ><Edit2 size={15} /></button>
                      )}
                      {p.activo ? (
                        <button
                          onClick={() => setConfirmacion({ paquete: p, accion: 'eliminar' })}
                          title="Eliminar"
                          className="p-1.5 rounded hover:bg-red-50 text-red-600"
                        ><Trash2 size={15} /></button>
                      ) : (
                        <button
                          onClick={() => setConfirmacion({ paquete: p, accion: 'restaurar' })}
                          title="Restaurar"
                          className="p-1.5 rounded hover:bg-green-50 text-green-600"
                        ><RotateCcw size={15} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {/* Diálogo de confirmación */}
      {confirmacion && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-surface-bright rounded-t-xl sm:rounded-xl shadow-xl max-w-md w-full p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${confirmacion.accion === 'eliminar' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {confirmacion.accion === 'eliminar' ? <Trash2 size={20} /> : <RotateCcw size={20} />}
              </div>
              <div>
                <h3 className="font-semibold text-on-surface">
                  {confirmacion.accion === 'eliminar' ? 'Eliminar paquete' : 'Restaurar paquete'}
                </h3>
                <p className="text-sm text-outline mt-1">
                  {confirmacion.accion === 'eliminar'
                    ? `¿Marcar "${confirmacion.paquete.nombre}" como eliminado? Los paquetes ya abiertos seguirán evaluándose con su versión actual.`
                    : `¿Restaurar "${confirmacion.paquete.nombre}"? Volverá a abrir paquetes nuevos cuando aparezcan los CIE-10 disparadores.`}
                </p>
                {confirmacion.accion === 'eliminar' && confirmacion.paquete.abiertos_count > 0 && (
                  <p className="text-xs text-amber-700 mt-2 bg-amber-50 px-2 py-1 rounded">
                    ⚠️ Hay {confirmacion.paquete.abiertos_count} paquete(s) abierto(s) que seguirán activos.
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-outline-variant/20">
              <button
                onClick={() => setConfirmacion(null)}
                className="px-4 py-2 rounded-lg border border-outline-variant/30 text-sm hover:bg-surface-container"
              >Cancelar</button>
              <button
                onClick={ejecutarConfirmacion}
                className={`px-4 py-2 rounded-lg text-sm text-white font-medium ${
                  confirmacion.accion === 'eliminar' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
