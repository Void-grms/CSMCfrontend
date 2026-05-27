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
        <span className="font-semibold text-on-surface">
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
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/8 border border-primary/20 hover:border-primary/40 transition-all duration-200"
        >
          <Eye size={13} /> Ver paquetes
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
            <div className="h-2 flex-1 rounded-full bg-surface-container">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-outline w-9 text-right font-medium">{pct}%</span>
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
          className="p-1.5 rounded-lg text-primary hover:bg-primary/8 transition-all duration-200"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pb-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="glass-card p-4 sm:p-5 rounded-xl border border-outline-variant/20 shadow-[0_10px_30px_rgba(27,94,83,0.05)]">
        <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight font-inter">Pacientes</h1>
        <p className="text-xs sm:text-sm text-outline mt-1">Busca por DNI o nombre completo</p>

        {/* Buscador */}
        <form onSubmit={buscar} className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="DNI o nombre del paciente…"
              className="w-full rounded-xl border border-outline-variant/30 bg-surface py-2.5 pl-9 pr-3 text-sm text-on-surface placeholder-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
          </div>
          <button
            type="submit"
            disabled={cargando}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary/90 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {cargando ? 'Buscando…' : 'Buscar'}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-error/8 border border-error/20 px-4 py-3 text-sm text-error">
          <AlertTriangle size={15} className="shrink-0" /> {error}
        </div>
      )}

      {/* Resultados de búsqueda */}
      {resultados !== null && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-outline font-medium min-w-0 flex-1">
              {resultados.length === 0
                ? `No se encontraron pacientes para "${query}"`
                : `${resultados.length} paciente${resultados.length !== 1 ? 's' : ''} encontrado${resultados.length !== 1 ? 's' : ''}`}
            </p>
            {resultados.length > 0 && (
              <span className="text-xs font-medium bg-primary/8 text-primary px-3 py-1 rounded-full ring-1 ring-primary/20 shrink-0">
                Resultados
              </span>
            )}
          </div>

          {/* Cards (móvil) */}
          <div className="grid grid-cols-1 gap-2.5 md:hidden">
            {resultados.map((r) => (
              <div key={r.id_paciente} className="rounded-xl glass-card border border-outline-variant/15 p-3 space-y-2">
                <div className="min-w-0">
                  <p className="font-semibold text-on-surface text-sm leading-snug break-words">
                    {[r.apellido_paterno, r.apellido_materno, r.nombres].filter(Boolean).join(' ')}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-outline-variant/15">
                  <div>
                    <p className="text-outline uppercase tracking-wide">DNI</p>
                    <p className="text-on-surface font-mono">{r.numero_documento || '—'}</p>
                  </div>
                  <div>
                    <p className="text-outline uppercase tracking-wide">Hª Clín.</p>
                    <p className="text-on-surface font-mono">{r.historia_clinica || '—'}</p>
                  </div>
                  <div>
                    <p className="text-outline uppercase tracking-wide">Nac.</p>
                    <p className="text-on-surface">
                      {r.fecha_nacimiento ? new Date(r.fecha_nacimiento).toLocaleDateString('es-PE') : '—'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => verPaquetes(r)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-primary bg-primary/8 hover:bg-primary/15"
                >
                  <Eye size={13} /> Ver paquetes
                </button>
              </div>
            ))}
          </div>

          {/* Tabla (md+) */}
          <div className="hidden md:block">
            <Table
              columns={columnasPacientes}
              data={resultados}
              loading={cargando && !pacienteSeleccionado}
              emptyMessage={`No se encontraron pacientes para "${query}"`}
            />
          </div>
        </section>
      )}

      {/* Paquetes del paciente seleccionado */}
      {pacienteSeleccionado && (
        <section className="space-y-3">
          <div className="glass-card px-4 py-3 sm:px-5 sm:py-4 rounded-xl border border-outline-variant/20 shadow-[0_4px_16px_rgba(27,94,83,0.04)] flex items-center justify-between flex-wrap gap-2">
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-on-surface font-inter break-words">
                Paquetes de{' '}
                <span className="text-primary">
                  {[
                    pacienteSeleccionado.apellido_paterno,
                    pacienteSeleccionado.apellido_materno,
                    pacienteSeleccionado.nombres,
                  ].filter(Boolean).join(' ')}
                </span>
              </h2>
              <p className="text-xs text-outline mt-0.5">
                DNI {pacienteSeleccionado.numero_documento} · Hª {pacienteSeleccionado.historia_clinica}
              </p>
            </div>
          </div>

          {/* Cards (móvil) */}
          <div className="grid grid-cols-1 gap-2.5 md:hidden">
            {(paquetes ?? []).length === 0 && !cargando && (
              <p className="text-xs text-outline text-center py-4">Este paciente no tiene paquetes registrados.</p>
            )}
            {(paquetes ?? []).map((p) => {
              const pct = Number(p.porcentaje_avance) || 0;
              return (
                <div key={p.id} className="rounded-xl glass-card border border-outline-variant/15 p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] text-outline">{p.id_paquete}</p>
                      <p className="text-sm font-semibold text-on-surface leading-snug break-words">{p.nombre_paquete}</p>
                    </div>
                    <Badge color={colorEstado(p.estado)}>{p.estado}</Badge>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="h-2 flex-1 rounded-full bg-surface-container">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-outline w-9 text-right font-medium">{pct}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-outline-variant/15">
                    <div>
                      <p className="text-outline uppercase tracking-wide">Inicio</p>
                      <p className="text-on-surface">
                        {p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString('es-PE') : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-outline uppercase tracking-wide">Límite</p>
                      <p className="text-on-surface">
                        {p.fecha_limite ? new Date(p.fecha_limite).toLocaleDateString('es-PE') : '—'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(`/paquetes/${p.id}`, '_blank')}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-primary bg-primary/8 hover:bg-primary/15"
                  >
                    <Eye size={13} /> Ver detalle
                  </button>
                </div>
              );
            })}
          </div>

          {/* Tabla (md+) */}
          <div className="hidden md:block">
            <Table
              columns={columnasPaquetes}
              data={paquetes ?? []}
              loading={cargando && !!pacienteSeleccionado}
              emptyMessage="Este paciente no tiene paquetes registrados"
            />
          </div>
        </section>
      )}
    </div>
  );
}