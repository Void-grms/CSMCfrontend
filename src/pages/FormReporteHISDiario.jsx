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

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
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
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-inner">
               <table className="text-xs border-collapse w-full relative">
                  <thead>
                    <tr className="bg-blue-900 text-white">
                      <th className="px-3 py-2 text-left min-w-[200px] border-b border-blue-800 sticky left-0 z-10 bg-blue-900 shadow-[1px_0_0_#1e3a8a]">Profesional</th>
                      {datosHIS.gruposMeses.map((g, i) => (
                        <th
                          key={i}
                          colSpan={g.cantDias}
                          className="px-2 py-2 text-center border-l border-b border-blue-800"
                        >
                          {g.nombreMes}
                        </th>
                      ))}
                      <th className="px-2 py-2 text-center border-l border-b border-blue-800 bg-blue-900/90">TOTAL</th>
                    </tr>
                    <tr className="bg-blue-800 text-white leading-tight">
                      <th className="px-3 py-1 text-left border-r border-blue-700 font-medium sticky left-0 z-10 bg-blue-800 shadow-[1px_0_0_#1e3a8a]">Día</th>
                      {datosHIS.fechas31.map((f, i) => {
                        const [, , dd] = f.split('-');
                        return (
                          <th key={i} className="px-1 py-1.5 text-center w-8 border-r border-blue-700/50">
                            {parseInt(dd, 10)}
                          </th>
                        );
                      })}
                      <th className="px-2 py-1 text-center border-l border-blue-700"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-blue-50/50 bg-white">
                      <td className="px-3 py-2 font-medium text-gray-800 border-r border-gray-200 sticky left-0 bg-white shadow-[1px_0_0_#e5e7eb] whitespace-nowrap">
                        {datosHIS.nombre_profesional}
                      </td>
                      {datosHIS.valoresDiarios.map((v, i) => (
                        <td
                          key={i}
                          className={`px-1 py-2 text-center border-r border-gray-100 tabular-nums ${v > 0 ? 'font-semibold text-blue-700 bg-blue-50/30' : 'text-slate-300'}`}
                        >
                          {v > 0 ? v : '—'}
                        </td>
                      ))}
                      <td className="px-2 py-2 text-center font-bold tabular-nums text-blue-600 border-l border-gray-200 bg-blue-50/50">
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
