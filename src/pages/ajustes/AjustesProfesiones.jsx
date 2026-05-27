import { useEffect, useState, useMemo } from 'react';
import { Save, Loader2, AlertTriangle, CheckCircle2, Plus, X } from 'lucide-react';
import {
  obtenerAjustesProfesiones,
  obtenerAjustesComponentes,
  obtenerProfesionesComponentes,
  guardarProfesionesComponentes,
} from '../../services/api';

export default function AjustesProfesiones() {
  const [profesiones, setProfesiones] = useState([]);
  const [componentes, setComponentes] = useState([]);
  const [matriz, setMatriz] = useState([]); // [{tipo_componente, id_profesion, observaciones}]
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [nuevaProfesion, setNuevaProfesion] = useState('');
  const [nuevoComponente, setNuevoComponente] = useState('');

  const cargar = async () => {
    setCargando(true);
    try {
      const [profs, comps, mat] = await Promise.all([
        obtenerAjustesProfesiones(),
        obtenerAjustesComponentes(),
        obtenerProfesionesComponentes(),
      ]);
      // Profesiones existentes en la matriz que no aparecen en profesional
      const profsExtra = mat.map(m => m.id_profesion).filter(p => !profs.includes(p));
      setProfesiones([...new Set([...profs, ...profsExtra])].sort());
      // Idem componentes
      const compsExtra = mat.map(m => m.tipo_componente).filter(c => !comps.includes(c));
      setComponentes([...new Set([...comps, ...compsExtra])].sort());
      setMatriz(mat);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error al cargar' });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  // Map para lookups rápidos
  const matrizMap = useMemo(() => {
    const m = new Map();
    for (const e of matriz) m.set(`${e.tipo_componente}|${e.id_profesion}`, e);
    return m;
  }, [matriz]);

  const toggle = (tipo_componente, id_profesion) => {
    const key = `${tipo_componente}|${id_profesion}`;
    if (matrizMap.has(key)) {
      setMatriz(prev => prev.filter(m => !(m.tipo_componente === tipo_componente && m.id_profesion === id_profesion)));
    } else {
      setMatriz(prev => [...prev, { tipo_componente, id_profesion, observaciones: null }]);
    }
  };

  const agregarProfesion = () => {
    const v = nuevaProfesion.trim();
    if (!v || profesiones.includes(v)) return;
    setProfesiones(prev => [...prev, v].sort());
    setNuevaProfesion('');
  };
  const agregarComponente = () => {
    const v = nuevoComponente.trim();
    if (!v || componentes.includes(v)) return;
    setComponentes(prev => [...prev, v].sort());
    setNuevoComponente('');
  };

  const guardar = async () => {
    setGuardando(true);
    setMensaje(null);
    try {
      await guardarProfesionesComponentes(matriz);
      setMensaje({ tipo: 'ok', texto: 'Matriz guardada correctamente' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error al guardar' });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-on-surface">Profesiones habilitadas por componente</h2>
          <p className="text-sm text-outline">Marca qué profesiones pueden realizar cada tipo de componente.</p>
        </div>
        <button
          onClick={guardar}
          disabled={guardando}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 disabled:opacity-50 self-stretch sm:self-auto"
        >
          {guardando ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Guardar cambios
        </button>
      </header>

      {mensaje && (
        <div className={`flex items-start gap-2 p-3 rounded-lg border text-sm ${
          mensaje.tipo === 'ok' ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {mensaje.tipo === 'ok' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span className="flex-1">{mensaje.texto}</span>
        </div>
      )}

      {/* Inputs para agregar nuevos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex gap-2">
          <input
            value={nuevaProfesion}
            onChange={(e) => setNuevaProfesion(e.target.value)}
            placeholder="Agregar profesión (id_profesion)"
            className="flex-1 px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarProfesion())}
          />
          <button onClick={agregarProfesion} className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm">
            <Plus size={14} className="inline" />
          </button>
        </div>
        <div className="flex gap-2">
          <input
            value={nuevoComponente}
            onChange={(e) => setNuevoComponente(e.target.value)}
            placeholder="Agregar componente (tipo_componente)"
            className="flex-1 px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarComponente())}
          />
          <button onClick={agregarComponente} className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm">
            <Plus size={14} className="inline" />
          </button>
        </div>
      </div>

      {/* Matriz */}
      {componentes.length === 0 || profesiones.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl bg-surface-container/40 text-sm text-outline border border-outline-variant/15">
          Agrega al menos una profesión y un componente para empezar.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl glass-card border border-outline-variant/15">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low text-xs font-semibold uppercase tracking-wide text-outline">
                <th className="px-3 py-2 sticky left-0 bg-surface-container-low z-10">Componente</th>
                {profesiones.map(p => (
                  <th key={p} className="px-3 py-2 text-center font-mono">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {componentes.map(comp => (
                <tr key={comp} className="hover:bg-primary/4">
                  <td className="px-3 py-2 sticky left-0 bg-surface-bright/95 backdrop-blur-sm font-mono text-xs font-semibold z-10">{comp}</td>
                  {profesiones.map(prof => {
                    const activo = matrizMap.has(`${comp}|${prof}`);
                    return (
                      <td key={prof} className="px-3 py-2 text-center">
                        <button
                          onClick={() => toggle(comp, prof)}
                          className={`w-6 h-6 rounded transition-colors ${
                            activo ? 'bg-primary text-on-primary' : 'bg-surface-container border border-outline-variant/30 hover:border-primary/50'
                          }`}
                          title={activo ? 'Desactivar' : 'Activar'}
                        >
                          {activo ? '✓' : ''}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
