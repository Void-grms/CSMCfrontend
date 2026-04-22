import { useState } from 'react';
import { Search, Download, Loader2, AlertTriangle, ChevronLeft, FileSpreadsheet } from 'lucide-react';
import { obtenerReporteHISDiario, exportarReporteHISDiario } from '../services/api';

export default function FormReporteHISDiario({ profesionales, volver, tipoSeleccionado }) {
  const [filtro, setFiltro] = useState({ id_personal: '', fecha_inicio: '' });
  const [datosHIS, setDatosHIS] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [consultaRealizada, setConsultaRealizada] = useState(false);

  const calcularFechaFin = (fi) => {
    if (!fi) return '';
    const [yyyy, mm, dd] = fi.split('-');
    const d = new Date(Date.UTC(yyyy, mm - 1, dd));
    d.setUTCDate(d.getUTCDate() + 30);
    return d.toISOString().split('T')[0];
  };

  const handleVerReporte = async () => {
    if (!filtro.id_personal || !filtro.fecha_inicio) {
      setError('Seleccione el profesional y la fecha de inicio.');
      return;
    }
    setLoading(true);
    setError(null);
    setConsultaRealizada(true);
    try {
      const res = await obtenerReporteHISDiario(filtro.id_personal, filtro.fecha_inicio);
      setDatosHIS(res.datos);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al obtener el reporte.');
      setDatosHIS(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = async () => {
    try {
      await exportarReporteHISDiario(filtro.id_personal, filtro.fecha_inicio);
    } catch (err) {
      setError('Error al exportar el archivo Excel.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={volver}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft size={16} />
          Volver
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{tipoSeleccionado.nombre}</h1>
          <p className="text-sm text-gray-500">{tipoSeleccionado.descripcion}</p>
        </div>
      </div>

      <div className="rounded-xl glass-card border border-outline-variant/20 shadow-[0_4px_16px_rgba(27,94,83,0.04)] p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Profesional:</label>
            <select
              className="w-full rounded-lg border border-gray-300 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={filtro.id_personal}
              onChange={(e) => setFiltro({ ...filtro, id_personal: e.target.value })}
            >
              <option value="">— Seleccionar profesional —</option>
              {profesionales.map((p) => (
                <option key={p.id_personal} value={p.id_personal}>
                  {p.nombre_completo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio:</label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-300 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={filtro.fecha_inicio}
              onChange={(e) => setFiltro({ ...filtro, fecha_inicio: e.target.value })}
            />
            {filtro.fecha_inicio && (
              <p className="mt-1 text-xs text-gray-500">Fin: {calcularFechaFin(filtro.fecha_inicio)}</p>
            )}
          </div>
        </div>
        
        <button
          onClick={handleVerReporte}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Consultar
        </button>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 flex items-center gap-2">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {consultaRealizada && datosHIS && !loading && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl glass-card border border-outline-variant/15 shadow-[0_4px_16px_rgba(27,94,83,0.04)]">
               <table className="text-xs border-collapse w-full relative text-left">
                  <thead>
                    <tr className="bg-surface-container text-on-surface-variant font-semibold uppercase tracking-wide">
                      <th className="px-3 py-2 text-left min-w-[200px] border-b border-outline-variant/20 sticky left-0 z-10 bg-surface-container shadow-[1px_0_0_rgba(191,201,197,0.3)]">Profesional</th>
                      {datosHIS.gruposMeses.map((g, i) => (
                        <th
                          key={i}
                          colSpan={g.cantDias}
                          className="px-2 py-2 text-center border-l border-b border-outline-variant/20"
                        >
                          {g.nombreMes}
                        </th>
                      ))}
                      <th className="px-2 py-2 text-center border-l border-b border-outline-variant/20 bg-surface-container/90">TOTAL</th>
                    </tr>
                    <tr className="bg-surface-container-low text-outline uppercase tracking-wide">
                      <th className="px-3 py-1.5 text-left border-r border-outline-variant/15 font-medium sticky left-0 z-10 bg-surface-container-low shadow-[1px_0_0_rgba(191,201,197,0.3)]">Día</th>
                      {datosHIS.fechas31.map((f, i) => {
                        const [, , dd] = f.split('-');
                        return (
                          <th key={i} className="px-1 py-1.5 text-center w-8 border-r border-outline-variant/10">
                            {parseInt(dd, 10)}
                          </th>
                        );
                      })}
                      <th className="px-2 py-1.5 text-center border-l border-outline-variant/15"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    <tr className="transition-colors hover:bg-primary/4 bg-transparent">
                      <td className="px-3 py-2.5 font-medium text-on-surface border-r border-outline-variant/10 sticky left-0 bg-inherit shadow-[1px_0_0_rgba(191,201,197,0.2)] whitespace-nowrap">
                        {datosHIS.nombre_profesional}
                      </td>
                      {datosHIS.valoresDiarios.map((v, i) => (
                        <td
                          key={i}
                          className={`px-1 py-2 text-center border-r border-outline-variant/10 tabular-nums ${v > 0 ? 'font-semibold text-primary bg-primary/5' : 'text-outline-variant'}`}
                        >
                          {v > 0 ? v : '—'}
                        </td>
                      ))}
                      <td className="px-2 py-2 text-center font-bold tabular-nums text-primary border-l border-outline-variant/10 bg-surface-container/30">
                        {datosHIS.total}
                      </td>
                    </tr>
                  </tbody>
               </table>
            </div>

            {datosHIS.total === 0 && (
              <p className="text-center text-sm text-gray-500 italic">No se registraron atenciones en el período seleccionado.</p>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleExportar}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <Download size={16} className="text-gray-500" />
                Descargar Excel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
