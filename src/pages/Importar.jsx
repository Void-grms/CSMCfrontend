import { useState, useEffect } from 'react';
import {
  importarNominaltrama,
  importarMaestros,
  limpiarBaseDeDatos,
  obtenerPeriodosDatos,
  limpiarPorPeriodo,
} from '../services/api';
import {
  Upload, FileText, CheckCircle, AlertTriangle, Loader2,
  Calendar, Trash2, RefreshCw,
} from 'lucide-react';

const MESES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** Clave única de un periodo para usar en sets/keys. */
const clavePeriodo = (p) => `${p.anio}-${p.mes}`;

/** Sección reutilizable para importar un tipo de archivo CSV */
function SeccionImportar({ titulo, descripcion, onImportar }) {
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  const manejarArchivo = (e) => {
    setArchivo(e.target.files[0] ?? null);
    setResultado(null);
    setError(null);
  };

  const enviar = async () => {
    if (!archivo) return;
    setCargando(true);
    setResultado(null);
    setError(null);

    try {
      const data = await onImportar(archivo);
      setResultado(data);
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Error al importar');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <h3 className="text-base font-semibold text-gray-800">{titulo}</h3>
      <p className="mb-4 text-sm text-gray-500">{descripcion}</p>

      {/* Selector de archivo */}
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-gray-200 p-4 transition-colors hover:border-blue-400 hover:bg-blue-50/30">
        <Upload size={20} className="text-gray-400" />
        <span className="text-sm text-gray-600">
          {archivo ? archivo.name : 'Seleccionar archivo CSV'}
        </span>
        <input
          type="file"
          accept=".csv"
          onChange={manejarArchivo}
          className="hidden"
        />
      </label>

      {/* Nombre del archivo seleccionado */}
      {archivo && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <FileText size={14} className="text-blue-500" />
          <span>{archivo.name}</span>
          <span className="text-gray-400">({(archivo.size / 1024).toFixed(1)} KB)</span>
        </div>
      )}

      {/* Botón importar */}
      <button
        type="button"
        onClick={enviar}
        disabled={!archivo || cargando}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {cargando ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Procesando…
          </>
        ) : (
          <>
            <Upload size={16} />
            Importar
          </>
        )}
      </button>

      {/* Resultado exitoso */}
      {resultado && (
        <div className="mt-4 rounded-lg bg-green-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-green-700">
            <CheckCircle size={18} />
            <span className="font-semibold text-sm">Importación exitosa</span>
          </div>
          <ul className="space-y-1 text-sm text-green-800">
            {resultado.insertadas != null && <li>Insertados: {resultado.insertadas}</li>}
            {resultado.actualizadas != null && <li>Actualizados: {resultado.actualizadas}</li>}
            {resultado.errores != null && <li>Errores: {resultado.errores}</li>}
            {resultado.total != null && <li>Total procesados: {resultado.total}</li>}
          </ul>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span className="font-semibold">Error al importar</span>
          </div>
          <p className="mt-1">{error}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Borrado selectivo por periodo (mes). Lista los meses con datos en la BD y
 * permite marcar varios para borrarlos sin tener que limpiar toda la base ni
 * volver a subir todos los CSV. Tras borrar, el backend reconstruye los paquetes.
 */
function BorrarPorPeriodo() {
  const [periodos, setPeriodos] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [errorLista, setErrorLista] = useState(null);
  const [seleccion, setSeleccion] = useState(new Set()); // claves "anio-mes"
  const [clave, setClave] = useState('');
  const [borrando, setBorrando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo, texto }

  const cargarPeriodos = () => {
    setCargandoLista(true);
    setErrorLista(null);
    obtenerPeriodosDatos()
      .then((data) => setPeriodos(Array.isArray(data) ? data : []))
      .catch((err) => setErrorLista(err.response?.data?.error ?? err.message ?? 'Error al cargar periodos'))
      .finally(() => setCargandoLista(false));
  };

  useEffect(() => { cargarPeriodos(); }, []);

  const toggle = (p) => {
    const k = clavePeriodo(p);
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
    setMensaje(null);
  };

  const todosSeleccionados = periodos.length > 0 && seleccion.size === periodos.length;
  const toggleTodos = () => {
    setSeleccion(todosSeleccionados ? new Set() : new Set(periodos.map(clavePeriodo)));
    setMensaje(null);
  };

  const handleBorrar = async () => {
    if (!clave || seleccion.size === 0) return;
    const elegidos = periodos.filter((p) => seleccion.has(clavePeriodo(p)));
    const etiquetas = elegidos.map((p) => `${MESES[p.mes]} ${p.anio}`).join(', ');
    if (!window.confirm(
      `¿Borrar las atenciones de ${elegidos.length} periodo(s)?\n\n${etiquetas}\n\n` +
      'Los paquetes se recalcularán automáticamente. Esta acción no se puede deshacer.'
    )) return;

    setBorrando(true);
    setMensaje(null);
    try {
      const resp = await limpiarPorPeriodo(
        clave,
        elegidos.map((p) => ({ anio: p.anio, mes: p.mes }))
      );
      let texto = resp.mensaje || 'Periodos borrados correctamente.';
      if (resp.paquetes_error) texto += ` (Aviso: el recálculo de paquetes falló: ${resp.paquetes_error})`;
      setMensaje({ tipo: resp.paquetes_error ? 'error' : 'exito', texto });
      setClave('');
      setSeleccion(new Set());
      cargarPeriodos();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error ?? err.message ?? 'Error al borrar' });
    } finally {
      setBorrando(false);
    }
  };

  const totalAtenciones = periodos
    .filter((p) => seleccion.has(clavePeriodo(p)))
    .reduce((acc, p) => acc + (p.atenciones || 0), 0);

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-bold text-amber-800">
          <Calendar size={20} />
          Borrar por periodo (mes)
        </h3>
        <button
          type="button"
          onClick={cargarPeriodos}
          disabled={cargandoLista}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
          title="Actualizar lista"
        >
          <RefreshCw size={14} className={cargandoLista ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>
      <p className="mb-4 mt-1 text-sm text-amber-700">
        Borra solo los meses seleccionados sin tener que limpiar toda la base de datos.
        Útil para corregir un periodo y volver a subir únicamente ese CSV.
      </p>

      {cargandoLista ? (
        <div className="flex items-center gap-2 py-6 text-sm text-amber-700">
          <Loader2 size={16} className="animate-spin" /> Cargando periodos…
        </div>
      ) : errorLista ? (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorLista}</div>
      ) : periodos.length === 0 ? (
        <p className="py-4 text-center text-sm text-amber-600">
          No hay datos cargados en la base de datos.
        </p>
      ) : (
        <>
          {/* Cabecera: seleccionar todos */}
          <label className="mb-2 flex cursor-pointer items-center gap-2 text-sm font-medium text-amber-800">
            <input
              type="checkbox"
              checked={todosSeleccionados}
              onChange={toggleTodos}
              className="h-4 w-4 rounded border-amber-300 accent-amber-600"
            />
            Seleccionar todos ({periodos.length})
          </label>

          {/* Lista de meses con checkbox */}
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-amber-200 bg-white p-2">
            {periodos.map((p) => {
              const k = clavePeriodo(p);
              const marcado = seleccion.has(k);
              return (
                <label
                  key={k}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    marcado ? 'bg-amber-100' : 'hover:bg-amber-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={marcado}
                    onChange={() => toggle(p)}
                    className="h-4 w-4 rounded border-amber-300 accent-amber-600"
                  />
                  <span className="w-32 font-medium text-gray-800">
                    {MESES[p.mes]} {p.anio}
                  </span>
                  <span className="text-gray-500">
                    {p.atenciones.toLocaleString('es-PE')} atenciones
                  </span>
                  <span className="text-gray-400">· {p.pacientes} pacientes</span>
                </label>
              );
            })}
          </div>

          {/* Acciones */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <input
              type="password"
              placeholder="Clave de borrado…"
              className="rounded-lg border border-amber-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
            />
            <button
              onClick={handleBorrar}
              disabled={!clave || seleccion.size === 0 || borrando}
              className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {borrando ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Borrar seleccionados ({seleccion.size})
            </button>
            {seleccion.size > 0 && (
              <span className="text-sm text-amber-700">
                {totalAtenciones.toLocaleString('es-PE')} atenciones a borrar
              </span>
            )}
          </div>
        </>
      )}

      {mensaje && (
        <div className={`mt-3 text-sm font-medium ${mensaje.tipo === 'exito' ? 'text-green-700' : 'text-red-700'}`}>
          {mensaje.texto}
        </div>
      )}
    </div>
  );
}

export default function Importar() {
  const [clave, setClave] = useState('');
  const [limpiando, setLimpiando] = useState(false);
  const [msgLimpieza, setMsgLimpieza] = useState(null);

  const handleLimpiar = async () => {
    if (!clave) return;
    if (!window.confirm('¿Estás seguro de que deseas BORRAR TODA LA BASE DE DATOS? Esta acción no se puede deshacer.')) return;
    
    setLimpiando(true);
    setMsgLimpieza(null);
    try {
      const resp = await limpiarBaseDeDatos(clave);
      setMsgLimpieza({ tipo: 'exito', texto: resp.mensaje || 'Base de datos borrada correctamente' });
      setClave('');
    } catch (err) {
      setMsgLimpieza({ tipo: 'error', texto: err.response?.data?.error || err.message || 'Error al limpiar' });
    } finally {
      setLimpiando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Importar datos</h2>
        <p className="text-sm text-gray-500">Carga archivos CSV para actualizar la base de datos del sistema</p>
      </div>

      {/* Sección NominalTrama */}
      <SeccionImportar
        titulo="Importar NominalTrama"
        descripcion="Archivo CSV con datos de atenciones del periodo (nominaltrama)."
        onImportar={importarNominaltrama}
      />

      {/* Sección Maestros */}
      <SeccionImportar
        titulo="Importar Maestros"
        descripcion="Archivo CSV con datos maestros (personal, registrador, paciente)."
        onImportar={importarMaestros}
      />

      {/* Borrado selectivo por periodo (mes) */}
      <BorrarPorPeriodo />

      {/* Zona de Peligro */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-base font-bold text-red-800">
          <AlertTriangle size={20} />
          Zona de Peligro: Limpiar Base de Datos (todo)
        </h3>
        <p className="mb-4 text-sm text-red-700">
          Si los datos recargados presentan errores de codificación o duplicados anómalos, puedes borrar toda la base de datos para cargarla desde cero.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="password"
            placeholder="Introduce la clave de borrado..."
            className="rounded-lg border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
          />
          <button
            onClick={handleLimpiar}
            disabled={!clave || limpiando}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {limpiando ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
            Borrar Todo
          </button>
        </div>
        {msgLimpieza && (
          <div className={`mt-3 text-sm font-medium ${msgLimpieza.tipo === 'exito' ? 'text-green-700' : 'text-red-700'}`}>
            {msgLimpieza.texto}
          </div>
        )}
      </div>
    </div>
  );
}
