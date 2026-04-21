import { Bell } from 'lucide-react';

/** Cabecera superior con nombre del CSMC y accesos rápidos */
export default function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      {/* Título institucional */}
      <div>
        <h1 className="text-base font-semibold text-gray-800">
          Centro de Salud Mental Comunitario{' '}
          <span className="text-blue-600">RENACER</span>
        </h1>
        <p className="text-xs text-gray-400">
          Monitoreo de paquetes terapéuticos — PP 0131
        </p>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-4">
        <button
          className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          title="Notificaciones"
        >
          <Bell size={18} />
          {/* Punto indicador de notificación */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Avatar placeholder del usuario */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
          U
        </div>
      </div>
    </header>
  );
}
