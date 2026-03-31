import { useState } from "react";
import { Clock, MapPin, Settings2, Check, LayoutGrid, FileText, Building2, Briefcase } from "lucide-react";
import { EtapaServico, calcularCustoEtapa, formatBRL } from "@/lib/orcamento";

interface Props {
  etapas: EtapaServico[];
  custoHora: number;
  onUpdate: (etapas: EtapaServico[]) => void;
}

const ICONS: Record<string, any> = {
  'projeto-paramétrico': LayoutGrid,
  'condominio-nbr': Building2,
  'regularizacao-doc': FileText,
  'gestao-tramite': Briefcase,
};

export default function ChecklistEtapas({ etapas, custoHora, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const update = (id: string, patch: Partial<EtapaServico>) => {
    onUpdate(etapas.map(e => e.id === id ? { ...e, ...patch } : e));
  };

  const toggleModule = (etapa: EtapaServico) => {
    const isActivating = !etapa.ativa;
    const patch: Partial<EtapaServico> = { ativa: isActivating };
    
    if (isActivating && etapa.visitas === 0 && etapa.horas === 0) {
      if (etapa.id === 'projeto-paramétrico') patch.horas = 16;
      else if (etapa.id === 'condominio-nbr') patch.horas = 12;
      else if (etapa.id === 'regularizacao-doc') patch.horas = 8;
      else if (etapa.id === 'gestao-tramite') patch.visitas = 1;
    }
    
    update(etapa.id, patch);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {etapas.map(etapa => {
        const Icon = ICONS[etapa.id] || LayoutGrid;
        const custo = calcularCustoEtapa(etapa, custoHora);
        const isEditing = editingId === etapa.id;

        return (
          <div key={etapa.id} className="relative group">
            <div
              onClick={() => toggleModule(etapa)}
              className={`cursor-pointer rounded-2xl border-2 transition-all duration-500 overflow-hidden ${
                etapa.ativa 
                  ? 'bg-card border-primary ring-4 ring-primary/10 shadow-[0_0_30px_rgba(var(--primary),0.1)]' 
                  : 'bg-white/[0.03] border-white/5 opacity-60 hover:opacity-100 hover:border-white/20'
              }`}
            >
              <div className="p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl transition-all duration-500 ${
                    etapa.ativa ? 'bg-primary text-primary-foreground scale-110 shadow-lg' : 'bg-white/5 text-muted-foreground'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {etapa.ativa && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingId(isEditing ? null : etapa.id); }}
                      className={`p-2 rounded-lg transition-all ${isEditing ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'}`}
                    >
                      <Settings2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground tracking-tight uppercase leading-tight">{etapa.nome}</h3>
                  <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{etapa.descricao}</p>
                </div>

                <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                  <div className="flex gap-3">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Tempo</span>
                      <span className="text-xs font-black text-foreground">{etapa.visitas * 8 + etapa.horas}h</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest block">Investimento</span>
                    <span className={`text-sm font-black transition-all ${etapa.ativa ? 'text-primary' : 'text-muted-foreground'}`}>
                      {formatBRL(custo)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Overlay/Panel */}
            {etapa.ativa && isEditing && (
              <div className="absolute inset-0 z-10 bg-card/95 backdrop-blur-xl rounded-2xl border-2 border-primary flex flex-col p-5 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Ajustes Técnicos</h4>
                  <button onClick={() => setEditingId(null)} className="p-1.5 bg-primary/10 text-primary rounded-lg">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1 flex gap-4">
                  <div className="flex-1">
                    <label className="text-[9px] text-muted-foreground uppercase font-bold flex items-center gap-1 mb-1.5 ml-1">
                      <Clock className="w-3 h-3" /> Horas Extras
                    </label>
                    <input type="number" min={0} value={etapa.horas}
                      onClick={e => e.stopPropagation()}
                      onChange={e => update(etapa.id, { horas: Math.max(0, +e.target.value) })}
                      className="w-full bg-surface border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] text-muted-foreground uppercase font-bold flex items-center gap-1 mb-1.5 ml-1">
                      <MapPin className="w-3 h-3" /> Visitas
                    </label>
                    <input type="number" min={0} value={etapa.visitas}
                      onClick={e => e.stopPropagation()}
                      onChange={e => update(etapa.id, { visitas: Math.max(0, +e.target.value) })}
                      className="w-full bg-surface border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>
                <p className="text-[9px] text-muted-foreground text-center mt-4 italic">Cada visita contabiliza 8 horas de dedicação técnica.</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
