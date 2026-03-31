import { useState } from "react";
import { ChevronDown, ChevronRight, Clock, MapPin, CheckSquare, Square } from "lucide-react";
import { EtapaServico, GRUPOS, calcularCustoEtapa, formatBRL } from "@/lib/orcamento";

interface Props {
  etapas: EtapaServico[];
  custoHora: number;
  onUpdate: (etapas: EtapaServico[]) => void;
}

export default function ChecklistEtapas({ etapas, custoHora, onUpdate }: Props) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    GRUPOS.reduce((acc, g) => ({ ...acc, [g]: true }), {})
  );

  const update = (id: string, patch: Partial<EtapaServico>) => {
    onUpdate(etapas.map(e => e.id === id ? { ...e, ...patch } : e));
  };

  const toggleGroup = (grupo: string) => {
    setOpenGroups(prev => ({ ...prev, [grupo]: !prev[grupo] }));
  };

  return (
    <div className="space-y-4">
      {GRUPOS.map(grupo => {
        const etapasGrupo = etapas.filter(e => e.grupo === grupo);
        if (etapasGrupo.length === 0) return null;
        
        const isOpen = openGroups[grupo];

        return (
          <div key={grupo} className="rounded-2xl border border-white/5 bg-surface/30 overflow-hidden">
            <button
              onClick={() => toggleGroup(grupo)}
              className="w-full flex items-center justify-between py-4 px-3 sm:px-4 sm:py-5 bg-surface hover:bg-surface/80 transition-colors cursor-pointer select-none"
            >
              <h3 className="text-[12px] sm:text-[13px] font-bold text-foreground uppercase tracking-widest leading-none">{grupo}</h3>
              {isOpen ? <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />}
            </button>
            
            {isOpen && (
              <div className="p-3 space-y-2">
                {etapasGrupo.map(etapa => {
                  const custo = calcularCustoEtapa(etapa, custoHora);

                  return (
                    <div
                      key={etapa.id}
                      className={`rounded-xl border transition-all duration-300 p-2.5 sm:p-3 flex flex-col gap-2.5 sm:gap-3 ${
                        etapa.ativa 
                          ? 'bg-card border-primary/40 shadow-[0_4px_20px_rgba(192,90,62,0.1)]' 
                          : 'bg-white/[0.02] border-white/5 opacity-50 hover:opacity-100 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => {
                        const ativa = !etapa.ativa;
                        const patch: Partial<EtapaServico> = { ativa };
                        if (ativa && etapa.visitas === 0 && etapa.horas === 0) {
                          const defaults: Record<string, { v?: number, h?: number }> = {
                            'levantamento': { v: 1 },
                            'arq': { h: 16 },
                            'cortes-fachadas': { h: 8 },
                            'situacao': { h: 4 },
                            'calculos': { h: 4 },
                            'pranchas': { h: 2 },
                            'fracao-ideal': { h: 6 },
                            'inst-convencao': { h: 12 },
                            'habite-se': { h: 8 },
                            'certidao-tributos': { h: 4 },
                            'protocolos': { v: 1 },
                            'proto-cartorio': { v: 1 },
                            'acompanhamento': { v: 1 },
                            'averbacao': { v: 1 },
                          };
                          const def = defaults[etapa.id] || { h: 4 };
                          if (def.v) patch.visitas = def.v;
                          if (def.h) patch.horas = def.h;
                        }
                        update(etapa.id, patch);
                      }}>
                        {etapa.ativa ? (
                          <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
                        )}
                        <span className="flex-1 text-[11px] sm:text-[13px] font-bold text-foreground/90 tracking-tight leading-tight">{etapa.nome}</span>
                        {etapa.ativa && custo > 0 && (
                          <span className="text-[10px] sm:text-[12px] font-black text-primary bg-primary/10 px-1.5 py-0.5 sm:px-2 rounded-md border border-primary/20 shrink-0">
                            {formatBRL(custo)}
                          </span>
                        )}
                      </div>

                      {etapa.ativa && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-white/5">
                          {/* Inline Edit Visitas */}
                          <div className="flex flex-1 items-center justify-between gap-2 bg-surface rounded-lg px-2 py-1.5 border border-white/5 focus-within:border-primary/50 transition-colors">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-primary opacity-80" />
                              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Visitas</span>
                            </div>
                            <input 
                              type="number" 
                              min="0" 
                              value={etapa.visitas}
                              onChange={e => update(etapa.id, { visitas: Math.max(0, +e.target.value) })}
                              className="w-12 bg-transparent text-right text-sm sm:text-base font-black text-foreground focus:outline-none"
                            />
                          </div>

                          {/* Inline Edit Horas */}
                          <div className="flex flex-1 items-center justify-between gap-2 bg-surface rounded-lg px-2 py-1.5 border border-white/5 focus-within:border-primary/50 transition-colors">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-primary opacity-80" />
                              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Horas Extras</span>
                            </div>
                            <input 
                              type="number" 
                              min="0" 
                              value={etapa.horas}
                              onChange={e => update(etapa.id, { horas: Math.max(0, +e.target.value) })}
                              className="w-12 bg-transparent text-right text-sm sm:text-base font-black text-foreground focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
