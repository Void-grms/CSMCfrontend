import { useEffect, useState } from 'react';
import { Plus, KeyRound, Edit2, UserX, UserCheck, Loader2, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import {
  obtenerAjustesUsuarios,
  crearAjustesUsuario,
  editarAjustesUsuario,
  cambiarPasswordUsuario,
  desactivarAjustesUsuario,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AjustesUsuarios() {
  const { user: yo } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);  // usuario
  const [modalPassword, setModalPassword] = useState(null); // usuario

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await obtenerAjustesUsuarios();
      setUsuarios(data);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error al cargar usuarios' });
    } finally {
      setCargando(false);
    }
  };
  useEffect(() => { cargar(); }, []);

  const desactivar = async (u) => {
    if (!confirm(`¿Desactivar el usuario ${u.username}?`)) return;
    try {
      await desactivarAjustesUsuario(u.id);
      setMensaje({ tipo: 'ok', texto: `Usuario ${u.username} desactivado` });
      await cargar();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error' });
    }
  };

  const reactivar = async (u) => {
    try {
      await editarAjustesUsuario(u.id, { activo: true });
      setMensaje({ tipo: 'ok', texto: `Usuario ${u.username} reactivado` });
      await cargar();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error' });
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-on-surface">Usuarios del sistema</h2>
        <button
          onClick={() => setModalNuevo(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          <Plus size={15} /> Nuevo usuario
        </button>
      </header>

      {mensaje && (
        <div className={`flex items-start gap-2 p-3 rounded-lg border text-sm ${
          mensaje.tipo === 'ok' ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {mensaje.tipo === 'ok' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span className="flex-1">{mensaje.texto}</span>
          <button onClick={() => setMensaje(null)}><X size={14} /></button>
        </div>
      )}

      {cargando ? (
        <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <>
        {/* Cards en móvil */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {usuarios.map(u => (
            <div key={u.id} className="rounded-xl glass-card border border-outline-variant/15 p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-semibold">{u.username}</span>
                    {u.id === yo?.id && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">tú</span>}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      u.rol === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>{u.rol}</span>
                  </div>
                  <p className="text-xs text-on-surface mt-0.5">{u.nombre_completo || '—'}</p>
                </div>
                <span className={`text-xs whitespace-nowrap ${u.activo ? 'text-green-600' : 'text-red-500'}`}>
                  ● {u.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <p className="text-[11px] text-outline">Creado {new Date(u.creado_en).toLocaleDateString('es-PE')}</p>
              <div className="flex gap-2 pt-2 border-t border-outline-variant/15">
                <button onClick={() => setModalEditar(u)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-primary/10 text-primary text-xs">
                  <Edit2 size={13} /> Editar
                </button>
                <button onClick={() => setModalPassword(u)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-primary/10 text-primary text-xs">
                  <KeyRound size={13} /> Clave
                </button>
                {u.activo ? (
                  <button onClick={() => desactivar(u)} disabled={u.id === yo?.id}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs disabled:opacity-30">
                    <UserX size={13} /> Desactivar
                  </button>
                ) : (
                  <button onClick={() => reactivar(u)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs">
                    <UserCheck size={13} /> Reactivar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tabla (md+) */}
        <div className="hidden md:block overflow-x-auto rounded-xl glass-card border border-outline-variant/15">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low text-xs font-semibold uppercase tracking-wide text-outline">
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Nombre completo</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Activo</th>
                <th className="px-4 py-3">Creado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {usuarios.map(u => (
                <tr key={u.id} className="hover:bg-primary/4">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">
                    {u.username}
                    {u.id === yo?.id && <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">tú</span>}
                  </td>
                  <td className="px-4 py-3">{u.nombre_completo || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      u.rol === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>{u.rol}</span>
                  </td>
                  <td className="px-4 py-3">
                    {u.activo
                      ? <span className="text-green-600 text-xs">● Activo</span>
                      : <span className="text-red-500 text-xs">● Inactivo</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-outline">
                    {new Date(u.creado_en).toLocaleDateString('es-PE')}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => setModalEditar(u)} title="Editar"
                            className="p-1.5 rounded hover:bg-primary/10 text-primary"><Edit2 size={14} /></button>
                    <button onClick={() => setModalPassword(u)} title="Cambiar contraseña"
                            className="p-1.5 rounded hover:bg-primary/10 text-primary"><KeyRound size={14} /></button>
                    {u.activo
                      ? <button onClick={() => desactivar(u)} disabled={u.id === yo?.id}
                                title="Desactivar"
                                className="p-1.5 rounded hover:bg-red-50 text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"><UserX size={14} /></button>
                      : <button onClick={() => reactivar(u)} title="Reactivar"
                                className="p-1.5 rounded hover:bg-green-50 text-green-600"><UserCheck size={14} /></button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {modalNuevo && (
        <ModalNuevo
          onClose={() => setModalNuevo(false)}
          onCreado={() => { setModalNuevo(false); cargar(); setMensaje({ tipo: 'ok', texto: 'Usuario creado correctamente' }); }}
        />
      )}
      {modalEditar && (
        <ModalEditar
          usuario={modalEditar}
          esYo={modalEditar.id === yo?.id}
          onClose={() => setModalEditar(null)}
          onActualizado={() => { setModalEditar(null); cargar(); setMensaje({ tipo: 'ok', texto: 'Usuario actualizado' }); }}
        />
      )}
      {modalPassword && (
        <ModalPassword
          usuario={modalPassword}
          onClose={() => setModalPassword(null)}
          onActualizado={() => { setModalPassword(null); setMensaje({ tipo: 'ok', texto: 'Contraseña actualizada' }); }}
        />
      )}
    </div>
  );
}

function Modal({ titulo, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-surface-bright rounded-t-xl sm:rounded-xl shadow-xl max-w-md w-full max-h-[95vh] overflow-y-auto p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-on-surface">{titulo}</h3>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalNuevo({ onClose, onCreado }) {
  const [form, setForm] = useState({ username: '', password: '', nombre_completo: '', rol: 'usuario' });
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const enviar = async () => {
    setGuardando(true); setError(null);
    try {
      await crearAjustesUsuario(form);
      onCreado();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear');
    } finally { setGuardando(false); }
  };

  return (
    <Modal titulo="Nuevo usuario" onClose={onClose}>
      {error && <div className="text-sm text-red-700 bg-red-50 p-2 rounded">{error}</div>}
      <Field label="Username">
        <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
               className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm" />
      </Field>
      <Field label="Contraseña (mín. 6 caracteres)">
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
               className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm" />
      </Field>
      <Field label="Nombre completo">
        <input value={form.nombre_completo} onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
               className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm" />
      </Field>
      <Field label="Rol">
        <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm">
          <option value="usuario">usuario</option>
          <option value="admin">admin</option>
        </select>
      </Field>
      <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/20">
        <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-sm">Cancelar</button>
        <button onClick={enviar} disabled={guardando}
                className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-sm font-medium disabled:opacity-50">
          {guardando ? 'Creando...' : 'Crear'}
        </button>
      </div>
    </Modal>
  );
}

function ModalEditar({ usuario, esYo, onClose, onActualizado }) {
  const [form, setForm] = useState({
    nombre_completo: usuario.nombre_completo || '',
    rol: usuario.rol,
    activo: usuario.activo,
  });
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const enviar = async () => {
    setGuardando(true); setError(null);
    try {
      await editarAjustesUsuario(usuario.id, form);
      onActualizado();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    } finally { setGuardando(false); }
  };

  return (
    <Modal titulo={`Editar ${usuario.username}`} onClose={onClose}>
      {error && <div className="text-sm text-red-700 bg-red-50 p-2 rounded">{error}</div>}
      <Field label="Nombre completo">
        <input value={form.nombre_completo} onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
               className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm" />
      </Field>
      <Field label="Rol">
        <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })} disabled={esYo}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm disabled:bg-gray-100">
          <option value="usuario">usuario</option>
          <option value="admin">admin</option>
        </select>
        {esYo && <p className="text-xs text-amber-700 mt-1">No puedes cambiar tu propio rol.</p>}
      </Field>
      <Field label="Activo">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.activo} disabled={esYo}
                 onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
          Cuenta activa
        </label>
        {esYo && <p className="text-xs text-amber-700 mt-1">No puedes desactivar tu propia cuenta.</p>}
      </Field>
      <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/20">
        <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-sm">Cancelar</button>
        <button onClick={enviar} disabled={guardando}
                className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-sm font-medium disabled:opacity-50">
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </Modal>
  );
}

function ModalPassword({ usuario, onClose, onActualizado }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const enviar = async () => {
    if (password.length < 6) { setError('Mínimo 6 caracteres'); return; }
    setGuardando(true); setError(null);
    try {
      await cambiarPasswordUsuario(usuario.id, password);
      onActualizado();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    } finally { setGuardando(false); }
  };

  return (
    <Modal titulo={`Cambiar contraseña de ${usuario.username}`} onClose={onClose}>
      {error && <div className="text-sm text-red-700 bg-red-50 p-2 rounded">{error}</div>}
      <Field label="Nueva contraseña">
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
               className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm" />
      </Field>
      <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/20">
        <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-sm">Cancelar</button>
        <button onClick={enviar} disabled={guardando}
                className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-sm font-medium disabled:opacity-50">
          {guardando ? 'Guardando...' : 'Actualizar'}
        </button>
      </div>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-outline mb-1 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
