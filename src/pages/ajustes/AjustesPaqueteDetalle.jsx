import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { obtenerAjustesPaquete, obtenerVersionesPaquete, obtenerVersionPaquete } from '../../services/api';

export default function AjustesPaqueteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paquete, setPaquete] = useState(null);
  const [versiones, setVersiones] = useState([]);
  const [versionVisible, setVersionVisible] = useState(null); // null = actual
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [data, vs] = await Promise.all([
          obtenerAjustesPaquete(id),
          obtenerVersionesPaquete(id),
        ]);
        setPaquete(data);
        setVersiones(vs);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar el paquete');
      } finally {
        setCargando(false);
      }
    })();
  }, [id]);

  const verVersion = async (v) => {
    if (v === paquete.version) {
      setVersionVisible(null);
      return;
    }
    try {
      const data = await obtenerVersionPaquete(id, v);
      setVersionVisible(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    }
  };

  if (cargando) return <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (error) return <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm"><AlertTriangle className="inline mr-2" size={16} />{error}</div>;
  if (!paquete) return null;

  const mostrando = versionVisible || paquete;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between gap-2">
        <button onClick={() => navigate('/ajustes/paquetes')} className="flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft size={16} /> Volver
        </button>
        {paquete.activo && (
          <Link to={`/ajustes/paquetes/${id}/editar`} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90">
            <Edit2 size={15} /> Editar
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Detalle principal */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <div className="rounded-xl glass-card border border-outline-variant/15 p-3 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-3">
              <div className="min-w-0">
                <p className="text-xs text-outline font-mono break-all">{mostrando.id_paquete} • Código {mostrando.codigo_paquete || '—'}</p>
                <h2 className="text-lg sm:text-xl font-bold text-on-surface leading-snug">{mostrando.nombre}</h2>
              </div>
              <div className="sm:text-right shrink-0">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                  mostrando.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>{mostrando.activo ? 'Activo' : 'Eliminado'}</span>
                <p className="text-xs text-outline mt-1">Versión {mostrando.version}{versionVisible ? ' (histórica)' : ' (actual)'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <Stat label="Plazo" valor={`${mostrando.plazo_dias} días`} />
              <Stat label="Actividad" valor={mostrando.id_actividad || '—'} />
              <Stat label="Edad mínima" valor={mostrando.edad_minima ?? '—'} />
              <Stat label="Edad máxima" valor={mostrando.edad_maxima ?? '—'} />
            </div>
          </div>

          {/* Condiciones de apertura (derivadas de reglas EXIGE_TIPO_DX y CODIGOS_MISMA_CITA) */}
          {(() => {
            const reglas = mostrando.reglas_especiales || [];
            const exige = reglas.find(r => r.tipo_regla === 'EXIGE_TIPO_DX' && r.activa !== false);
            const tiposDx = exige?.parametros?.tipos_validos?.length
              ? exige.parametros.tipos_validos
              : ['P', 'D'];
            const codigosCita = [...new Set(
              reglas
                .filter(r => r.tipo_regla === 'CODIGOS_MISMA_CITA' && r.activa !== false)
                .flatMap(r => r.parametros?.codigos_adicionales || [])
            )];

            return (
              <Seccion titulo="Condiciones de apertura">
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] text-outline uppercase tracking-wide font-semibold mb-1">Tipos de Dx aceptados</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tiposDx.includes('P') && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">Presuntivo (P)</span>
                      )}
                      {tiposDx.includes('D') && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">Definitivo (D)</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-outline uppercase tracking-wide font-semibold mb-1">Códigos requeridos en la misma cita</p>
                    {codigosCita.length === 0 ? (
                      <p className="text-sm text-outline italic">Ninguno — el Dx disparador es suficiente.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {codigosCita.map(c => (
                          <span key={c} className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-mono">{c}</span>
                        ))}
                        <span className="text-[11px] text-outline italic self-center">
                          {codigosCita.length > 1 ? '(basta con uno)' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Seccion>
            );
          })()}

          {/* CIE-10 disparadores */}
          <Seccion titulo={`Diagnósticos CIE-10 disparadores (${mostrando.grupo_dx.length})`}>
            {mostrando.grupo_dx.length === 0 ? (
              <p className="text-sm text-outline italic">Sin códigos. No se abre automáticamente (cierre manual).</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {mostrando.grupo_dx.map(d => (
                  <span key={d} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono">{d}</span>
                ))}
              </div>
            )}
          </Seccion>

          {/* Componentes */}
          <Seccion titulo={`Componentes (${mostrando.componentes.length})`}>
            {mostrando.componentes.length === 0 ? (
              <p className="text-sm text-outline italic">Sin componentes — el paquete nunca se completa automáticamente.</p>
            ) : (
              <div className="space-y-2">
                {mostrando.componentes.map(c => (
                  <div key={c.tipo_componente} className="rounded-lg border border-outline-variant/20 bg-surface-bright/60 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold text-on-surface">{c.tipo_componente}</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        mínimo {c.cantidad_minima}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {c.codigos.map(cod => (
                        <span key={cod} className="px-1.5 py-0.5 rounded bg-secondary/10 text-secondary text-[11px] font-mono">{cod}</span>
                      ))}
                    </div>
                    {c.usar_prefijo && (
                      <p className="text-[11px] text-outline mt-1.5 italic">usar_prefijo activo (compara primeros 5 chars)</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Seccion>

          {/* Reglas avanzadas — excluye EXIGE_TIPO_DX y CODIGOS_MISMA_CITA (mostradas arriba) */}
          {(() => {
            const avanzadas = (mostrando.reglas_especiales || []).filter(
              r => r.tipo_regla !== 'EXIGE_TIPO_DX' && r.tipo_regla !== 'CODIGOS_MISMA_CITA'
            );
            if (avanzadas.length === 0) return null;
            return (
              <Seccion titulo={`Reglas avanzadas (${avanzadas.length})`}>
                <div className="space-y-2">
                  {avanzadas.map(r => (
                    <div key={r.id} className="rounded-lg border border-outline-variant/20 bg-amber-50/40 p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-amber-800">{r.tipo_regla}</span>
                        {!r.activa && <span className="text-xs text-red-600">(inactiva)</span>}
                      </div>
                      <pre className="mt-1 text-xs text-outline font-mono whitespace-pre-wrap">{JSON.stringify(r.parametros, null, 2)}</pre>
                    </div>
                  ))}
                </div>
              </Seccion>
            );
          })()}
        </div>

        {/* Timeline de versiones */}
        <div className="lg:col-span-1 min-w-0">
          <div className="rounded-xl glass-card border border-outline-variant/15 p-3 sm:p-5 lg:sticky lg:top-20">
            <h3 className="flex items-center gap-2 font-semibold text-on-surface mb-3">
              <Clock size={16} /> Historial de versiones
            </h3>
            <div className="space-y-1.5">
              {versiones.map(v => (
                <button
                  key={v.version}
                  onClick={() => verVersion(v.version)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-colors ${
                    (versionVisible ? versionVisible.version : paquete.version) === v.version
                      ? 'border-primary bg-primary/5'
                      : 'border-outline-variant/20 hover:bg-surface-container/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono font-semibold">v{v.version}</span>
                    {v.es_actual && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">ACTUAL</span>}
                  </div>
                  <p className="text-[11px] text-outline mt-0.5">
                    {new Date(v.fecha_creacion).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                  {v.creado_por_username && (
                    <p className="text-[11px] text-outline">por {v.creado_por_username}</p>
                  )}
                  {v.nota_cambio && <p className="text-[11px] text-on-surface mt-1 italic">{v.nota_cambio}</p>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, valor }) {
  return (
    <div>
      <p className="text-[11px] text-outline uppercase tracking-wide font-semibold">{label}</p>
      <p className="text-sm text-on-surface">{valor}</p>
    </div>
  );
}

function Seccion({ titulo, children }) {
  return (
    <div className="rounded-xl glass-card border border-outline-variant/15 p-3 sm:p-5 space-y-3">
      <h3 className="font-semibold text-on-surface">{titulo}</h3>
      {children}
    </div>
  );
}
