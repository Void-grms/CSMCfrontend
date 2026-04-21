import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  FolderUp,
  Clock,
  LogOut,
  UserCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoRenacer from '../../assets/LogoRenacer.png';

// Elementos del menú lateral
const enlaces = [
  { to: '/dashboard', label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/paquetes',  label: 'Paquetes',       icon: Package },
  { to: '/pacientes', label: 'Pacientes',      icon: Users },
  { to: '/importar',  label: 'Importar datos', icon: FolderUp },
  { to: '/reportes/profesionales', label: 'Reporte del Profesional', icon: Users },
  { to: '/documentos', label: 'Documentos', icon: FileText, soloAdmin: true },
  { to: '/historial', label: 'Historial',      icon: Clock },
];

/** Sidebar fija a la izquierda con navegación principal */
export default function Sidebar({ isOpen }) {
  const { user, logout } = useAuth();

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-800 text-white transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo / título del sistema */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-700 px-5 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center">
          <img src={logoRenacer} alt="Logo Renacer" className="h-full w-full object-contain" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-wide">CSMC RENACER</p>
          <p className="text-[11px] text-slate-400">Sistema de monitoreo</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="mt-4 flex-1 space-y-1 px-3 overflow-y-auto overflow-x-hidden">
        {enlaces
          .filter(({ soloAdmin }) => !soloAdmin || user?.rol === 'admin')
          .map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Perfil y Logout */}
      <div className="border-t border-slate-700 p-4 shrink-0">
        {user && (
          <div className="flex items-center gap-3 mb-4 text-xs font-medium bg-slate-700/50 p-2.5 rounded-lg border border-slate-600/50">
            <UserCircle className="w-8 h-8 text-slate-300" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{user.nombre_completo || user.username}</p>
              <p className="text-slate-400 capitalize truncate">{user.rol}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-700 hover:bg-red-600/90 text-slate-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors border border-slate-600 hover:border-red-500 shadow-sm"
        >
          <LogOut size={16} /> Cerrar Sesión
        </button>
        <p className="text-[10px] text-center text-slate-500 mt-4 tracking-wide font-mono">PP 0131 — MINSA</p>
      </div>
    </aside>
  );
}
