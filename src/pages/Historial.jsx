import { useState, useEffect } from 'react';
import { obtenerHistorialCargas } from '../services/api';
import Table from '../components/ui/Table';
import { AlertTriangle } from 'lucide-react';

/** Formatea una fecha ISO a dd/mm/yyyy hh:mm */
function formatearFecha(fechaISO) {
  if (!fechaISO) return '—';
  const d = new Date(fechaISO);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${anio} ${hora}:${min}`;
}

/** Página de historial de cargas / importaciones realizadas */
export default function Historial() {
  const [cargas, setCargas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerHistorialCargas()
      .then((data) => {
        // Ordenar por fecha descendente (más reciente primero)
        const ordenado = [...data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        setCargas(ordenado);
      })
      .catch((err) => setError(err.message ?? 'Error al cargar historial'))
      .finally(() => setCargando(false));
  }, []);

  /* ── Error ── */
  if (error) {
    return (
      <div className="mx-auto mt-20 max-w-md rounded-lg bg-red-50 p-6 text-center text-red-700">
        <AlertTriangle className="mx-auto mb-2" size={28} />
        <p className="font-medium">No se pudo cargar el historial</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  /* ── Columnas ── */
  const columnas = [
    { key: 'archivo', label: 'Archivo' },
    { key: 'tipo', label: 'Tipo' },
    {
      key: 'fecha',
      label: 'Fecha',
      render: (row) => formatearFecha(row.fecha),
    },
    { key: 'registros_procesados', label: 'Registros procesados' },
    { key: 'usuario', label: 'Usuario' },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Historial de cargas</h2>
        <p className="text-sm text-gray-500">Registro de todas las importaciones de datos realizadas</p>
      </div>

      {/* Tabla */}
      <Table
        columns={columnas}
        data={cargas}
        loading={cargando}
        emptyMessage="Aún no se han realizado importaciones"
      />
    </div>
  );
}
