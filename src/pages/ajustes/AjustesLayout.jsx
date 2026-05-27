import { NavLink, Outlet } from 'react-router-dom';
import { Package, Users as UsersIcon, Briefcase, ClipboardList, Settings as SettingsIcon, UserCog } from 'lucide-react';

const tabs = [
  { to: '/ajustes/paquetes', label: 'Paquetes', icon: Package },
  { to: '/ajustes/profesiones', label: 'Profesiones', icon: Briefcase },
  { to: '/ajustes/personal', label: 'Personal', icon: UserCog },
  { to: '/ajustes/usuarios', label: 'Usuarios', icon: UsersIcon },
  { to: '/ajustes/auditoria', label: 'Auditoría', icon: ClipboardList },
];

export default function AjustesLayout() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
          <SettingsIcon size={22} strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-on-surface">Ajustes</h1>
          <p className="text-xs sm:text-sm text-outline">Configuración del catálogo, profesiones, usuarios y auditoría</p>
        </div>
      </header>

      <nav className="flex gap-1 sm:gap-2 border-b border-outline-variant/30 overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/ajustes/paquetes'}
            className={({ isActive }) =>
              `flex items-center gap-1.5 sm:gap-2 rounded-t-lg px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 border-b-2 -mb-px whitespace-nowrap shrink-0 ${
                isActive
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-outline hover:text-on-surface hover:bg-surface-container/50'
              }`
            }
          >
            <Icon size={15} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="pb-8">
        <Outlet />
      </div>
    </div>
  );
}
