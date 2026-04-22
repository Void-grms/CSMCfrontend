import React from 'react';

const mnames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const ordenActividades = [
  '5005189',
  '5006281',
  '5005190',
  '5006282',
  '5005195',
  '5005197'
];

export default function DashboardProgressTable({ paquetes }) {
  const getBadgeColor = (porcentaje) => {
    if (porcentaje >= 80) return 'bg-[#dcfce7] text-[#166534] ring-[#166534]/30';
    if (porcentaje >= 50) return 'bg-secondary-container/30 text-on-secondary-container ring-secondary/30';
    return 'bg-error/10 text-error ring-error/30';
  };

  if (!paquetes || paquetes.length === 0) {
    return <p className="text-sm text-outline p-4 text-center">No hay datos de paquetes disponibles.</p>;
  }

  // Agrupar paquetes por actividad
  const grupos = {};
  
  paquetes.forEach(p => {
    let codigoActividad = p.act_codigo ? String(p.act_codigo).trim() : null;
    let nombreActividad = p.act_nombre || 'Otra Actividad';

    if (!codigoActividad) {
      const match = ordenActividades.find(c => (p.nombre_paquete || '').includes(c) || (p.nombre || '').includes(c));
      if (match) {
        codigoActividad = match;
      } else {
        codigoActividad = 'Otros'; 
      }
    }

    if (!grupos[codigoActividad]) {
      grupos[codigoActividad] = {
        codigo: codigoActividad,
        nombre: nombreActividad,
        items: []
      };
    }
    grupos[codigoActividad].items.push(p);
  });

  const arrayGrupos = Object.values(grupos).sort((a, b) => {
    let idxA = ordenActividades.indexOf(a.codigo);
    let idxB = ordenActividades.indexOf(b.codigo);
    
    idxA = idxA === -1 ? 999 : idxA;
    idxB = idxB === -1 ? 999 : idxB;
    
    if (idxA === idxB) {
      return a.nombre.localeCompare(b.nombre);
    }
    return idxA - idxB;
  });

  return (
    <div className="space-y-6 pb-4">
      {arrayGrupos.map((grupo, gIndex) => {
        let nActividad = ordenActividades.indexOf(grupo.codigo);
        let actividadLabel = nActividad !== -1 
            ? `Actividad ${nActividad + 1}. ` 
            : '';
        if (grupo.codigo === 'Otros') actividadLabel = 'Adicionales ';

        return (
          <div key={grupo.codigo || gIndex} className="bg-surface-bright rounded-xl border border-outline-variant/20 overflow-hidden shadow-[0_2px_8px_rgba(27,94,83,0.04)]">
            {/* Header del grupo */}
            <div className="bg-surface-container border-b border-outline-variant/20 px-5 py-3 flex items-start sm:items-center gap-3">
              <div className="h-6 flex items-center shrink-0">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              </div>
              <h4 className="text-[13px] font-semibold text-on-surface-variant leading-snug">
                {actividadLabel}{grupo.codigo !== 'Otros' ? grupo.codigo + ' ' : ''}{grupo.nombre}
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-on-surface">
                <thead className="text-[11px] uppercase bg-surface-container-low text-outline border-b border-outline-variant/20">
                  <tr>
                    <th scope="col" className="px-4 py-3 sticky left-0 bg-surface-container-low z-10 w-48 shadow-[1px_0_0_0_rgba(191,201,197,0.3)]">
                      Paquete
                    </th>
                    <th scope="col" className="px-3 py-3 w-20 text-center border-l border-outline-variant/15 bg-primary/5">
                      Meta
                    </th>
                    {mnames.map(m => (
                      <th key={m} scope="col" className="px-3 py-3 text-center border-l border-outline-variant/10">
                        {m}
                      </th>
                    ))}
                    <th scope="col" className="px-3 py-3 text-center border-l border-outline-variant/15 bg-surface-container/50 font-semibold text-on-surface-variant">
                      Acumulado
                    </th>
                    <th scope="col" className="px-3 py-3 text-center border-l border-outline-variant/10">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {grupo.items.map((p, index) => {
                    const meta = p.meta || 100;
                    const numMeses = p.meses || new Array(12).fill(0);
                    const total = p.total_acumulado !== undefined ? p.total_acumulado : (numMeses.reduce((a,b)=>a+b,0) || p.cantidad || 0);
                    const porcentaje = meta > 0 ? Math.round((total / meta) * 100) : 0;

                    return (
                      <tr key={index} className="bg-surface-bright hover:bg-surface-container/40 transition-colors duration-150">
                        <td className="px-4 py-3 font-medium text-on-surface sticky left-0 bg-inherit shadow-[1px_0_0_0_rgba(191,201,197,0.2)] whitespace-normal break-words min-w-[220px] max-w-[280px] text-[11px] leading-tight text-left" title={p.nombre_paquete || p.nombre || 'Paquete'}>
                          <span className="text-outline font-normal mr-1">{p.id_paquete ? p.id_paquete.replace('PF_', '') : ''}</span>
                          {p.nombre_paquete || p.nombre || 'Paquete'}
                        </td>
                        <td className="px-3 py-3 text-center border-l border-outline-variant/10 font-medium text-primary bg-primary/5 text-xs">
                          {meta}
                        </td>
                        
                        {numMeses.map((val, i) => (
                          <td key={i} className="px-3 py-3 text-center border-l border-outline-variant/8 text-on-surface text-[11px]">
                            {val === 0 ? <span className="text-outline-variant">-</span> : val}
                          </td>
                        ))}

                        <td className="px-3 py-3 text-center border-l border-outline-variant/10 font-bold text-on-surface bg-surface-container/30 text-xs">
                          {total}
                        </td>
                        <td className="px-3 py-3 text-center border-l border-outline-variant/10">
                          <span className={"px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide ring-1 ring-inset inline-block min-w-[40px] " + getBadgeColor(porcentaje)}>
                            {porcentaje}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
