import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, X, Loader2, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';
import {
  obtenerAjustesPaquete,
  crearAjustesPaquete,
  editarAjustesPaquete,
} from '../../services/api';

// Sólo CODIGOS_MISMO_MES queda en la sección "avanzadas"; las otras dos
// (EXIGE_TIPO_DX y CODIGOS_MISMA_CITA) se exponen como campos principales
// en "Condiciones de apertura".
const TIPOS_REGLA = [
  { value: 'CODIGOS_MISMO_MES', label: 'Requiere códigos en mismo mes' },
];

function paqueteVacio() {
  return {
    id_paquete: '',
    nombre: '',
    codigo_paquete: '',
    plazo_meses: 8,
    id_actividad: '',
    edad_minima: '',
    edad_maxima: '',
    grupo_dx: [],
    // Condiciones de apertura (campos principales, sintetizados como reglas al guardar)
    tipos_dx_acepta: ['P', 'D'],     // por defecto Presuntivo + Definitivo
    codigos_misma_cita: [],          // ej. ['99366']
    componentes: [],
    reglas_especiales: [],           // sólo reglas avanzadas (CODIGOS_MISMO_MES)
    nota_cambio: '',
  };
}

// Reglas que NO se manejan en la sección "Condiciones de apertura".
// Cualquier otro tipo se sintetiza desde los campos principales.
const TIPOS_REGLA_AVANZADAS = new Set(['CODIGOS_MISMO_MES']);

/**
 * Editor reutilizable para crear/editar un paquete.
 * @param {('crear'|'editar')} modo
 */
export default function AjustesPaqueteEditor({ modo }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(paqueteVacio());
  const [cargando, setCargando] = useState(modo === 'editar');
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState([]);

  useEffect(() => {
    if (modo === 'editar' && id) {
      (async () => {
        try {
          const data = await obtenerAjustesPaquete(id);
          const reglas = data.reglas_especiales || [];

          // Extraer EXIGE_TIPO_DX (puede haber varias activas; tomamos la primera)
          const exigeTipoDx = reglas.find(r => r.tipo_regla === 'EXIGE_TIPO_DX' && r.activa !== false);
          const tiposDx = exigeTipoDx?.parametros?.tipos_validos?.length
            ? exigeTipoDx.parametros.tipos_validos
            : ['P', 'D'];

          // Extraer CODIGOS_MISMA_CITA (juntamos códigos si hubiera varias reglas)
          const reglasMismaCita = reglas.filter(r => r.tipo_regla === 'CODIGOS_MISMA_CITA' && r.activa !== false);
          const codigosCita = [...new Set(
            reglasMismaCita.flatMap(r => r.parametros?.codigos_adicionales || [])
          )];

          // El resto (CODIGOS_MISMO_MES + reglas desconocidas) queda en "avanzadas"
          const reglasAvanzadas = reglas.filter(
            r => r.tipo_regla !== 'EXIGE_TIPO_DX' && r.tipo_regla !== 'CODIGOS_MISMA_CITA'
          );

          setForm({
            id_paquete:     data.id_paquete,
            nombre:         data.nombre || '',
            codigo_paquete: data.codigo_paquete || '',
            plazo_meses:    data.plazo_meses ?? 8,
            id_actividad:   data.id_actividad || '',
            edad_minima:    data.edad_minima ?? '',
            edad_maxima:    data.edad_maxima ?? '',
            grupo_dx:       data.grupo_dx || [],
            tipos_dx_acepta:    tiposDx,
            codigos_misma_cita: codigosCita,
            componentes:    (data.componentes || []).map((c, i) => ({ ...c, orden: c.orden ?? i + 1 })),
            reglas_especiales: reglasAvanzadas,
            nota_cambio: '',
          });
        } catch (err) {
          setErrores([err.response?.data?.error || 'Error al cargar el paquete']);
        } finally {
          setCargando(false);
        }
      })();
    }
  }, [modo, id]);

  const setCampo = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  // ── Grupo DX ──────────────────────────────────────────────────────────────
  const [nuevoDx, setNuevoDx] = useState('');
  const agregarDx = () => {
    const v = nuevoDx.trim().toUpperCase();
    if (!v || form.grupo_dx.includes(v)) return;
    setForm(prev => ({ ...prev, grupo_dx: [...prev.grupo_dx, v] }));
    setNuevoDx('');
  };
  const quitarDx = (codigo) => setForm(prev => ({ ...prev, grupo_dx: prev.grupo_dx.filter(d => d !== codigo) }));

  // ── Componentes ───────────────────────────────────────────────────────────
  const agregarComponente = () => {
    setForm(prev => ({
      ...prev,
      componentes: [...prev.componentes, {
        tipo_componente: '',
        cantidad_minima: 1,
        usar_prefijo: false,
        codigos: [],
        orden: (prev.componentes?.length || 0) + 1,
      }]
    }));
  };
  const editarComponente = (idx, parche) => {
    setForm(prev => ({
      ...prev,
      componentes: prev.componentes.map((c, i) => i === idx ? { ...c, ...parche } : c)
    }));
  };
  const quitarComponente = (idx) => {
    setForm(prev => ({
      ...prev,
      componentes: prev.componentes.filter((_, i) => i !== idx).map((c, i) => ({ ...c, orden: i + 1 }))
    }));
  };
  const moverComponente = (idx, dir) => {
    const nuevo = [...form.componentes];
    const otherIdx = idx + dir;
    if (otherIdx < 0 || otherIdx >= nuevo.length) return;
    [nuevo[idx], nuevo[otherIdx]] = [nuevo[otherIdx], nuevo[idx]];
    setForm(prev => ({ ...prev, componentes: nuevo.map((c, i) => ({ ...c, orden: i + 1 })) }));
  };

  // ── Condiciones de apertura ───────────────────────────────────────────────
  const toggleTipoDx = (t) => {
    setForm(prev => {
      const has = prev.tipos_dx_acepta.includes(t);
      // Garantizar al menos un tipo seleccionado (no permitir dejar ambos en blanco)
      if (has && prev.tipos_dx_acepta.length === 1) return prev;
      return {
        ...prev,
        tipos_dx_acepta: has
          ? prev.tipos_dx_acepta.filter(x => x !== t)
          : [...prev.tipos_dx_acepta, t].sort(),
      };
    });
  };

  const [nuevoCodCita, setNuevoCodCita] = useState('');
  const agregarCodCita = () => {
    const v = nuevoCodCita.trim();
    if (!v || form.codigos_misma_cita.includes(v)) return;
    setForm(prev => ({ ...prev, codigos_misma_cita: [...prev.codigos_misma_cita, v] }));
    setNuevoCodCita('');
  };
  const quitarCodCita = (c) => setForm(prev => ({
    ...prev,
    codigos_misma_cita: prev.codigos_misma_cita.filter(x => x !== c)
  }));

  // ── Reglas avanzadas (sólo CODIGOS_MISMO_MES) ─────────────────────────────
  const agregarRegla = () => {
    setForm(prev => ({
      ...prev,
      reglas_especiales: [
        ...prev.reglas_especiales,
        { tipo_regla: 'CODIGOS_MISMO_MES', parametros: { codigos: [], tipo_dx_requerido: 'D' }, activa: true }
      ]
    }));
  };
  const editarRegla = (idx, parche) => {
    setForm(prev => ({
      ...prev,
      reglas_especiales: prev.reglas_especiales.map((r, i) => i === idx ? { ...r, ...parche } : r)
    }));
  };
  const quitarRegla = (idx) => {
    setForm(prev => ({ ...prev, reglas_especiales: prev.reglas_especiales.filter((_, i) => i !== idx) }));
  };

  // ── Validación cliente ────────────────────────────────────────────────────
  const validar = () => {
    const errs = [];
    if (!/^[A-Z][A-Z0-9_]{1,49}$/.test(form.id_paquete)) {
      errs.push('id_paquete debe usar mayúsculas/dígitos/guión bajo (2-50 chars).');
    }
    if (!form.nombre.trim()) errs.push('Nombre requerido.');
    if (!Number.isInteger(Number(form.plazo_meses)) || form.plazo_meses < 1) errs.push('Plazo (meses) debe ser entero ≥ 1.');
    if (form.edad_minima !== '' && form.edad_maxima !== '' && Number(form.edad_minima) > Number(form.edad_maxima)) {
      errs.push('edad_minima debe ser ≤ edad_maxima.');
    }
    const vistos = new Set();
    for (const c of form.componentes) {
      if (!c.tipo_componente?.trim()) errs.push('Hay un componente sin tipo.');
      if (vistos.has(c.tipo_componente)) errs.push(`Componente duplicado: ${c.tipo_componente}`);
      vistos.add(c.tipo_componente);
      if (!Number.isInteger(Number(c.cantidad_minima)) || c.cantidad_minima < 1) {
        errs.push(`${c.tipo_componente || '(sin nombre)'}: cantidad_minima debe ser ≥ 1.`);
      }
      if (!c.codigos || c.codigos.length === 0) {
        errs.push(`${c.tipo_componente || '(sin nombre)'}: debe tener al menos un código.`);
      }
    }
    return errs;
  };

  const guardar = async () => {
    const errs = validar();
    if (errs.length) { setErrores(errs); return; }

    setErrores([]);
    setGuardando(true);
    try {
      // Sintetizar reglas finales: avanzadas (CODIGOS_MISMO_MES) +
      // EXIGE_TIPO_DX si el usuario restringió (no es [P,D] completo) +
      // CODIGOS_MISMA_CITA si hay códigos configurados.
      const reglasFinales = [...form.reglas_especiales];

      const esTodoPyD =
        form.tipos_dx_acepta.length === 2 &&
        form.tipos_dx_acepta.includes('P') &&
        form.tipos_dx_acepta.includes('D');
      if (form.tipos_dx_acepta.length > 0 && !esTodoPyD) {
        reglasFinales.push({
          tipo_regla: 'EXIGE_TIPO_DX',
          parametros: { tipos_validos: form.tipos_dx_acepta },
          activa: true,
        });
      }

      if (form.codigos_misma_cita.length > 0) {
        reglasFinales.push({
          tipo_regla: 'CODIGOS_MISMA_CITA',
          parametros: { codigos_adicionales: form.codigos_misma_cita },
          activa: true,
        });
      }

      const payload = {
        id_paquete:     form.id_paquete,
        nombre:         form.nombre,
        codigo_paquete: form.codigo_paquete,
        plazo_meses:    Number(form.plazo_meses),
        id_actividad:   form.id_actividad,
        edad_minima:    form.edad_minima === '' ? null : Number(form.edad_minima),
        edad_maxima:    form.edad_maxima === '' ? null : Number(form.edad_maxima),
        grupo_dx:       form.grupo_dx,
        componentes:    form.componentes.map(c => ({
          ...c,
          cantidad_minima: Number(c.cantidad_minima),
        })),
        reglas_especiales: reglasFinales,
        nota_cambio: form.nota_cambio,
      };
      if (modo === 'crear') {
        await crearAjustesPaquete(payload);
        navigate(`/ajustes/paquetes/${payload.id_paquete}`);
      } else {
        await editarAjustesPaquete(id, payload);
        navigate(`/ajustes/paquetes/${id}`);
      }
    } catch (err) {
      setErrores([err.response?.data?.error || 'Error al guardar']);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-primary hover:underline self-start">
          <ArrowLeft size={16} /> Volver
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-on-surface break-all">
          {modo === 'crear' ? 'Nuevo paquete' : `Editar ${form.id_paquete}`}
        </h2>
      </div>

      {errores.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-1">
          <div className="flex items-center gap-2 text-red-800 text-sm font-semibold">
            <AlertTriangle size={16} /> Hay errores en el formulario
          </div>
          <ul className="text-xs text-red-700 list-disc list-inside">
            {errores.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {/* Identificación */}
      <section className="rounded-xl glass-card border border-outline-variant/15 p-3 sm:p-5 space-y-4">
        <h3 className="font-semibold text-on-surface">Identificación</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <FormCampo label="ID paquete (único)">
            <input
              value={form.id_paquete}
              onChange={(e) => setCampo('id_paquete', e.target.value.toUpperCase())}
              disabled={modo === 'editar'}
              className={`w-full px-3 py-2 rounded-lg border bg-surface-bright text-sm font-mono ${
                modo === 'editar' ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="PF_NUEVO_PAQUETE"
            />
          </FormCampo>
          <FormCampo label="Código (1.1, 2.3...)">
            <input
              value={form.codigo_paquete}
              onChange={(e) => setCampo('codigo_paquete', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm"
              placeholder="3.1"
            />
          </FormCampo>
          <FormCampo label="Actividad (ACT1-6)">
            <input
              value={form.id_actividad}
              onChange={(e) => setCampo('id_actividad', e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm"
              placeholder="ACT3"
            />
          </FormCampo>
          <FormCampo label="Nombre" className="sm:col-span-2 md:col-span-3">
            <input
              value={form.nombre}
              onChange={(e) => setCampo('nombre', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm"
              placeholder="Tratamiento ambulatorio de personas con..."
            />
          </FormCampo>
          <FormCampo label="Plazo (meses)">
            <input
              type="number" min="1" max="60"
              value={form.plazo_meses}
              onChange={(e) => setCampo('plazo_meses', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm"
            />
          </FormCampo>
          <FormCampo label="Edad mínima (NULL = sin límite)">
            <input
              type="number" min="0" max="120"
              value={form.edad_minima}
              onChange={(e) => setCampo('edad_minima', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm"
              placeholder=""
            />
          </FormCampo>
          <FormCampo label="Edad máxima (NULL = sin límite)">
            <input
              type="number" min="0" max="120"
              value={form.edad_maxima}
              onChange={(e) => setCampo('edad_maxima', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm"
              placeholder=""
            />
          </FormCampo>
        </div>
      </section>

      {/* Condiciones de apertura */}
      <section className="rounded-xl glass-card border border-outline-variant/15 p-3 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-on-surface">Condiciones de apertura</h3>
          <span className="text-xs text-outline">Qué debe cumplir una atención para abrir este paquete</span>
        </div>

        {/* Tipos de Dx aceptados */}
        <div>
          <label className="block text-xs font-semibold text-outline mb-2 uppercase tracking-wide">
            Tipos de diagnóstico aceptados
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { code: 'P', label: 'Presuntivo (P)' },
              { code: 'D', label: 'Definitivo (D)' },
            ].map(t => {
              const activo = form.tipos_dx_acepta.includes(t.code);
              const ultimoMarcado = activo && form.tipos_dx_acepta.length === 1;
              return (
                <button
                  key={t.code}
                  type="button"
                  onClick={() => toggleTipoDx(t.code)}
                  disabled={ultimoMarcado}
                  title={ultimoMarcado ? 'Debe quedar al menos un tipo seleccionado' : ''}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                    activo
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-bright text-outline border-outline-variant/30 hover:bg-primary/5'
                  } ${ultimoMarcado ? 'cursor-not-allowed opacity-90' : ''}`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-outline mt-1.5">
            Por defecto el paquete se abre con Presuntivo o Definitivo. Desmarca uno para restringir.
          </p>
        </div>

        {/* Códigos requeridos en la misma cita */}
        <div>
          <label className="block text-xs font-semibold text-outline mb-2 uppercase tracking-wide">
            Códigos requeridos en la misma cita
          </label>
          <div className="flex flex-wrap gap-2 mb-2 min-h-[1rem]">
            {form.codigos_misma_cita.length === 0 ? (
              <span className="text-[11px] text-outline italic">Sin restricción adicional. La cita solo necesita el Dx disparador.</span>
            ) : form.codigos_misma_cita.map(c => (
              <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-mono">
                {c}
                <button type="button" onClick={() => quitarCodCita(c)} className="hover:text-red-600"><X size={12} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={nuevoCodCita}
              onChange={(e) => setNuevoCodCita(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarCodCita())}
              placeholder="Ej: 99366 (PAI)"
              className="flex-1 px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm font-mono"
            />
            <button
              type="button"
              onClick={agregarCodCita}
              className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20"
            >
              <Plus size={14} className="inline -mt-0.5" /> Añadir
            </button>
          </div>
          <p className="text-[11px] text-outline mt-1.5">
            Si configuras varios, basta con que <strong>uno</strong> aparezca en la misma cita del diagnóstico (OR).
          </p>
        </div>
      </section>

      {/* Grupo DX */}
      <section className="rounded-xl glass-card border border-outline-variant/15 p-3 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-on-surface">Diagnósticos CIE-10 disparadores</h3>
          <span className="text-xs text-outline">Abren el paquete cuando aparecen con un tipo aceptado</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.grupo_dx.map(d => (
            <span key={d} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono">
              {d}
              <button onClick={() => quitarDx(d)} className="hover:text-red-600"><X size={12} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={nuevoDx}
            onChange={(e) => setNuevoDx(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarDx())}
            placeholder="Ej: F313"
            className="flex-1 px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm font-mono"
          />
          <button
            onClick={agregarDx}
            className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20"
          >
            <Plus size={14} className="inline -mt-0.5" /> Añadir
          </button>
        </div>
      </section>

      {/* Componentes */}
      <section className="rounded-xl glass-card border border-outline-variant/15 p-3 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-semibold text-on-surface">Componentes ({form.componentes.length})</h3>
          <button
            onClick={agregarComponente}
            className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20"
          >
            <Plus size={14} /> Añadir componente
          </button>
        </div>
        {form.componentes.length === 0 ? (
          <p className="text-sm text-outline italic">Sin componentes. Un paquete sin componentes nunca se completa automáticamente (ej: continuidad de cuidados).</p>
        ) : (
          <div className="space-y-3">
            {form.componentes.map((c, idx) => (
              <ComponenteEditor
                key={idx}
                index={idx}
                componente={c}
                total={form.componentes.length}
                onChange={(parche) => editarComponente(idx, parche)}
                onRemove={() => quitarComponente(idx)}
                onMove={(dir) => moverComponente(idx, dir)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Reglas avanzadas (CODIGOS_MISMO_MES) */}
      <section className="rounded-xl glass-card border border-outline-variant/15 p-3 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold text-on-surface">Reglas avanzadas</h3>
            <p className="text-[11px] text-outline mt-0.5">Casos especiales: exigir varios códigos en el mismo mes (ej. PF_REHAB_PSICOSOCIAL_ALC: F102 + Z502).</p>
          </div>
          <button
            onClick={agregarRegla}
            className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20"
          >
            <Plus size={14} /> Añadir regla
          </button>
        </div>
        {form.reglas_especiales.length === 0 ? (
          <p className="text-sm text-outline italic">Sin reglas avanzadas. La mayoría de paquetes no necesitan esto.</p>
        ) : (
          form.reglas_especiales.map((r, idx) => (
            <ReglaEditor
              key={idx}
              regla={r}
              onChange={(parche) => editarRegla(idx, parche)}
              onRemove={() => quitarRegla(idx)}
            />
          ))
        )}
      </section>

      {/* Nota de cambio */}
      {modo === 'editar' && (
        <section className="rounded-xl glass-card border border-outline-variant/15 p-3 sm:p-5">
          <FormCampo label="Nota del cambio (opcional)">
            <textarea
              value={form.nota_cambio}
              onChange={(e) => setCampo('nota_cambio', e.target.value)}
              rows={2}
              placeholder="Ej: Se ajustó cantidad_minima de consulta_salud_mental a 2 por nueva directiva..."
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm"
            />
          </FormCampo>
        </section>
      )}

      {/* Botones */}
      <div className="flex justify-end gap-2 sticky bottom-0 bg-surface/80 backdrop-blur-sm py-3 -mx-1 px-1">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg border border-outline-variant/30 text-sm hover:bg-surface-container"
        >Cancelar</button>
        <button
          onClick={guardar}
          disabled={guardando}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {guardando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {modo === 'crear' ? 'Crear paquete' : 'Guardar como nueva versión'}
        </button>
      </div>

      {modo === 'editar' && (
        <p className="text-xs text-outline italic">
          ℹ️ Al guardar se crea una nueva versión del catálogo. Los paquetes ya abiertos NO cambian de reglas — siguen evaluándose con la versión con la que se crearon.
        </p>
      )}
    </div>
  );
}

function FormCampo({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-outline mb-1 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function ComponenteEditor({ index, componente, total, onChange, onRemove, onMove }) {
  const [nuevoCodigo, setNuevoCodigo] = useState('');

  const agregar = () => {
    const v = nuevoCodigo.trim();
    if (!v || componente.codigos.includes(v)) return;
    onChange({ codigos: [...componente.codigos, v] });
    setNuevoCodigo('');
  };
  const quitar = (cod) => onChange({ codigos: componente.codigos.filter(c => c !== cod) });

  return (
    <div className="rounded-lg border border-outline-variant/30 bg-surface-bright/60 p-3 sm:p-4 space-y-3">
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-1 pt-2 shrink-0">
          <button onClick={() => onMove(-1)} disabled={index === 0} className="text-outline hover:text-primary disabled:opacity-30"><ChevronUp size={14} /></button>
          <button onClick={() => onMove(1)} disabled={index === total - 1} className="text-outline hover:text-primary disabled:opacity-30"><ChevronDown size={14} /></button>
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 min-w-0">
          <FormCampo label="Tipo de componente" className="sm:col-span-2">
            <input
              value={componente.tipo_componente}
              onChange={(e) => onChange({ tipo_componente: e.target.value })}
              placeholder="consulta_salud_mental"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm font-mono"
            />
          </FormCampo>
          <FormCampo label="Cantidad mínima">
            <input
              type="number" min="1"
              value={componente.cantidad_minima}
              onChange={(e) => onChange({ cantidad_minima: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm"
            />
          </FormCampo>
        </div>
        <button onClick={onRemove} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash2 size={15} /></button>
      </div>

      <label className="flex items-center gap-2 text-xs text-outline">
        <input
          type="checkbox"
          checked={!!componente.usar_prefijo}
          onChange={(e) => onChange({ usar_prefijo: e.target.checked })}
        />
        usar_prefijo (compara solo los primeros 5 chars del codigo_item)
      </label>

      <div>
        <div className="text-xs font-semibold text-outline mb-1 uppercase tracking-wide">Códigos válidos</div>
        <div className="flex flex-wrap gap-2 mb-2">
          {componente.codigos.map(c => (
            <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-mono">
              {c}
              <button onClick={() => quitar(c)} className="hover:text-red-600"><X size={11} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={nuevoCodigo}
            onChange={(e) => setNuevoCodigo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregar())}
            placeholder="Ej: 99207 o 90834"
            className="flex-1 px-3 py-1.5 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm font-mono"
          />
          <button onClick={agregar} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20">
            <Plus size={13} className="inline -mt-0.5" /> Añadir código
          </button>
        </div>
      </div>
    </div>
  );
}

function ReglaEditor({ regla, onChange, onRemove }) {
  const setParam = (k, v) => onChange({ parametros: { ...regla.parametros, [k]: v } });

  // Mostramos el tipo como label fijo (ya solo manejamos CODIGOS_MISMO_MES aquí).
  const labelTipo = TIPOS_REGLA.find(t => t.value === regla.tipo_regla)?.label
    ?? regla.tipo_regla;

  return (
    <div className="rounded-lg border border-outline-variant/30 bg-surface-bright/60 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container/50 text-sm font-medium text-on-surface">
          {labelTipo}
        </div>
        <label className="flex items-center gap-2 text-xs text-outline whitespace-nowrap">
          <input type="checkbox" checked={!!regla.activa} onChange={(e) => onChange({ activa: e.target.checked })} />
          Activa
        </label>
        <button onClick={onRemove} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash2 size={15} /></button>
      </div>

      {regla.tipo_regla === 'CODIGOS_MISMO_MES' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormCampo label="Códigos requeridos (separados por coma)">
            <input
              value={(regla.parametros?.codigos || []).join(', ')}
              onChange={(e) => setParam('codigos', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="F102, Z502"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm font-mono"
            />
          </FormCampo>
          <FormCampo label="Tipo de Dx requerido">
            <select
              value={regla.parametros?.tipo_dx_requerido || 'D'}
              onChange={(e) => setParam('tipo_dx_requerido', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-bright text-sm"
            >
              <option value="D">D — Definitivo</option>
              <option value="P">P — Presuntivo</option>
            </select>
          </FormCampo>
        </div>
      )}

      {/* Tipos de regla desconocidos: mostrar JSON crudo para no perder datos */}
      {regla.tipo_regla !== 'CODIGOS_MISMO_MES' && (
        <div className="text-xs text-outline">
          <p className="mb-1 italic">Regla de tipo no editable aquí. Parámetros actuales:</p>
          <pre className="bg-surface-container/50 p-2 rounded text-[11px] font-mono overflow-x-auto">
            {JSON.stringify(regla.parametros || {}, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
