import { useState } from 'react';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import { Search, Eye, AlertTriangle } from 'lucide-react';
import { buscarPacientes, obtenerPaquetesPaciente } from '../services/api';

function colorEstado(estado) {
  if (estado === 'completado') return 'green';
  if (estado === 'vencido') return 'red';
  return 'blue';
}

export default function Pacientes() {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState(null);
  const [paquetes, setPaquetes] = useState(null);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const buscar = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setCargando(true);
    setError(null);
    setResultados(null);
    setPaquetes(null);
    setPacienteSeleccionado(null);
    try {
      const data = await buscarPacientes(q);
      setResultados(Array.isArray(data) ? data : []); // ← guardia extra
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al buscar paciente');
    } finally {
      setCargando(false);
    }
  };

  const verPaquetes = async (paciente) => {
    setPacienteSeleccionado(paciente);
    setPaquetes(null);
    setCargando(true);
    try {
      const data = await obtenerPaquetesPaciente(paciente.id_paciente);
      setPaquetes(Array.isArray(data) ? data : []); // ← guardia extra
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setCargando(false);
    }
  };

  const columnasPacientes = [
    {
      key: 'nombre',
      label: 'Paciente',
      render: (row) => (
        <span className="font-medium text-gray-800">
          {[row.apellido_paterno, row.apellido_materno, row.nombres].filter(Boolean).join(' ')}
        </span>
      ),
    },
    { key: 'numero_documento', label: 'DNI' },
    { key: 'historia_clinica', label: 'Hª Clínica' },
    {
      key: 'fecha_nacimiento',
      label: 'Nacimiento',
      render: (row) =>
        row.fecha_nacimiento
          ? new Date(row.fecha_nacimiento).toLocaleDateString('es-PE')
          : '—',
    },
    {
      key: 'acciones',
      label: '',
      render: (row) => (
        <button
          onClick={() => verPaquetes(row)}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 transition"
        >
          <Eye size={14} /> Ver paquetes
        </button>
      ),
    },
  ];

  const columnasPaquetes = [
    { key: 'id_paquete', label: 'Tipo paquete' },
    { key: 'nombre_paquete', label: 'Nombre' },
    {
      key: 'fecha_inicio',
      label: 'Inicio',
      render: (row) =>
        row.fecha_inicio ? new Date(row.fecha_inicio).toLocaleDateString('es-PE') : '—',
    },
    {
      key: 'fecha_limite',
      label: 'Límite',
      render: (row) =>
        row.fecha_limite ? new Date(row.fecha_limite).toLocaleDateString('es-PE') : '—',
    },
    {
      key: 'porcentaje_avance',
      label: 'Avance',
      render: (row) => {
        const pct = Number(row.porcentaje_avance) || 0;
        return (
          <div className="flex items-center gap-2 min-w-[100px]">
            <div className="h-2 flex-1 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-9 text-right">{pct}%</span>
          </div>
        );
      },
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row) => <Badge color={colorEstado(row.estado)}>{row.estado}</Badge>,
    },
    {
      key: 'ver',
      label: '',
      render: (row) => (
        <button
          onClick={() => window.open(`/paquetes/${row.id}`, '_blank')}
          className="text-blue-500 hover:text-blue-700 transition"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Pacientes</h1>
        <p className="text-sm text-gray-400">Busca por DNI o nombre completo</p>
      </div>

      <form onSubmit={buscar} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="DNI o nombre del paciente…"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          type="submit"
          disabled={cargando}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {cargando ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {resultados !== null && (
        <section className="space-y-2">
          <p className="text-sm text-gray-500">
            {resultados.length === 0
              ? `No se encontraron pacientes para "${query}"`
              : `${resultados.length} paciente${resultados.length !== 1 ? 's' : ''} encontrado${resultados.length !== 1 ? 's' : ''}`}
          </p>
          {/* ✅ FIX: data= en lugar de rows= */}
          <Table
            columns={columnasPacientes}
            data={resultados}
            loading={cargando && !pacienteSeleccionado}
            emptyMessage={`No se encontraron pacientes para "${query}"`}
          />
        </section>
      )}

      {pacienteSeleccionado && (
        <section className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <h2 className="text-base font-semibold text-gray-700">
              Paquetes de{' '}
              <span className="text-blue-600">
                {[
                  pacienteSeleccionado.apellido_paterno,
                  pacienteSeleccionado.apellido_materno,
                  pacienteSeleccionado.nombres,
                ].filter(Boolean).join(' ')}
              </span>
            </h2>
            <span className="text-xs text-gray-400">
              DNI {pacienteSeleccionado.numero_documento} · Hª {pacienteSeleccionado.historia_clinica}
            </span>
          </div>
          {/* ✅ FIX: data= en lugar de rows= */}
          <Table
            columns={columnasPaquetes}
            data={paquetes ?? []}
            loading={cargando && !!pacienteSeleccionado}
            emptyMessage="Este paciente no tiene paquetes registrados"
          />
        </section>
      )}
    </div>
  );
}