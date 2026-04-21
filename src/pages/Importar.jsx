import { useState } from 'react';
import { importarNominaltrama, importarMaestros, limpiarBaseDeDatos } from '../services/api';
import { Upload, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

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

      {/* Zona de Peligro */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-base font-bold text-red-800">
          <AlertTriangle size={20} />
          Zona de Peligro: Limpiar Base de Datos
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
