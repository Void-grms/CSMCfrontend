import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  FolderUp,
  Clock,
  LogOut,
  UserCircle,
  FileText,
  BarChart2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoRenacer from '../../assets/LogoRenacer.png';

// Elementos del menú lateral
const enlaces = [
  { to: '/dashboard', label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/paquetes',  label: 'Paquetes',       icon: Package },
  { to: '/pacientes', label: 'Pacientes',      icon: Users },
  { to: '/importar',  label: 'Importar datos', icon: FolderUp },
  { to: '/reportes/profesionales', label: 'Reporte del Profesional', icon: BarChart2 },
  { to: '/documentos', label: 'Documentos', icon: FileText, soloAdmin: true },
  { to: '/historial', label: 'Historial',      icon: Clock },
];

/** Sidebar fija a la izquierda — estilo oscuro profesional */
export default function Sidebar({ isOpen }) {
  const { user, logout } = useAuth();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col
        bg-primary text-on-primary
        shadow-[4px_0_24px_rgba(0,70,60,0.2)]
        transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {/* Logo / título del sistema */}
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center bg-white/10 rounded-lg p-1.5">
          <img src={logoRenacer} alt="Logo Renacer" className="h-full w-full object-contain brightness-0 invert" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight text-white font-inter">CSMC RENACER</p>
          <p className="text-[11px] text-white/60 font-medium">Sistema de monitoreo</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="mt-3 flex-1 space-y-0.5 px-3 overflow-y-auto overflow-x-hidden">
        <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/50 select-none">
          Menú principal
        </p>
        {enlaces
          .filter(({ soloAdmin }) => !soloAdmin || user?.rol === 'admin')
          .map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium min-h-[44px] transition-all duration-200 ${
                isActive
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={isActive ? 'text-white' : 'text-white/70'}
                />
                <span>{label}</span>
                {/* Indicador activo */}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Perfil y Logout */}
      <div className="border-t border-white/10 p-4 shrink-0 space-y-3 bg-black/10">
        {user && (
          <div className="flex items-center gap-3 text-xs font-medium bg-white/5 border border-white/10 p-2.5 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <UserCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-semibold truncate">
                {user.nombre_completo || user.username}
              </p>
              <p className="text-white/60 text-[11px] capitalize truncate">{user.rol}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-white/5 hover:bg-error text-white/80 hover:text-white px-3 py-2.5 text-sm font-medium transition-all duration-200 border border-white/10 hover:border-error min-h-[44px]"
        >
          <LogOut size={15} strokeWidth={2} /> Cerrar Sesión
        </button>
        <p className="text-[10px] text-center text-white/30 tracking-wide font-mono pt-1">
          PP 0131 — MINSA
        </p>
      </div>
    </aside>
  );
}
