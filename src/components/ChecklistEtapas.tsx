import { useState } from "react";
import { Clock, MapPin, Pencil, Check } from "lucide-react";
import { EtapaServico, GRUPOS, calcularCustoEtapa, formatBRL } from "@/lib/orcamento";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  etapas: EtapaServico[];
  custoHora: number;
  onUpdate: (etapas: EtapaServico[]) => void;
}

export default function ChecklistEtapas({ etapas, custoHora, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const update = (id: string, patch: Partial<EtapaServico>) => {
    onUpdate(etapas.map(e => e.id === id ? { ...e, ...patch } : e));
  };

  return (
    <div className="space-y-1.5">
      {GRUPOS.map(grupo => {
        const etapasGrupo = etapas.filter(e => e.grupo === grupo);
        if (etapasGrupo.length === 0) return null;
        return (
          <div key={grupo}>
            <h3 className="text-[9px] font-semibold text-primary uppercase tracking-wider px-1 py-1">{grupo}</h3>
            <div className="space-y-0.5">
              {etapasGrupo.map(etapa => {
                const custo = calcularCustoEtapa(etapa, custoHora);
                const isEditing = editingId === etapa.id;

                return (
                  <div
                    key={etapa.id}
                    className={`rounded-md border transition-all ${
                      etapa.ativa ? 'bg-card border-primary/20' : 'bg-card/30 border-border/10 opacity-40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 px-2 py-1.5">
                      <Checkbox
                        checked={etapa.ativa}
                        onCheckedChange={c => {
                          const patch: Partial<EtapaServico> = { ativa: !!c };
                          if (!!c && etapa.visitas === 0 && etapa.horas === 0) {
                            patch.visitas = 1;
                          }
                          update(etapa.id, patch);
                        }}
                        className="h-3.5 w-3.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <span className="flex-1 text-[11px] font-medium text-foreground truncate">{etapa.nome}</span>

                      {etapa.ativa && (
                        <>
                          {custo > 0 && !isEditing && (
                            <button onClick={() => setEditingId(etapa.id)}
                              className="text-[10px] font-bold text-primary hover:underline shrink-0">
                              {formatBRL(custo)}
                            </button>
                          )}
                          <button onClick={() => setEditingId(isEditing ? null : etapa.id)}
                            className={`p-0.5 rounded shrink-0 ${isEditing ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                            <Pencil className="w-2.5 h-2.5" />
                          </button>
                        </>
                      )}
                    </div>

                    {etapa.ativa && isEditing && (
                      <div className="px-2 pb-2 pt-0.5 border-t border-border/20 flex items-end gap-2">
                        <div className="flex-1">
                          <label className="text-[8px] text-muted-foreground uppercase flex items-center gap-0.5">
                            <Clock className="w-2 h-2" /> H. Extras
                          </label>
                          <input type="number" min={0} value={etapa.horas}
                            onChange={e => update(etapa.id, { horas: Math.max(0, +e.target.value) })}
                            className="w-full bg-background border border-border rounded px-1.5 py-0.5 text-[11px] text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[8px] text-muted-foreground uppercase flex items-center gap-0.5">
                            <MapPin className="w-2 h-2" /> Visitas
                          </label>
                          <input type="number" min={0} value={etapa.visitas}
                            onChange={e => update(etapa.id, { visitas: Math.max(0, +e.target.value) })}
                            className="w-full bg-background border border-border rounded px-1.5 py-0.5 text-[11px] text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                          <p className="text-[7px] text-muted-foreground whitespace-nowrap">× 8h de dedicação técnica</p>
                        </div>
                        <button onClick={() => setEditingId(null)}
                          className="flex items-center gap-0.5 px-2 py-1 rounded bg-primary text-primary-foreground text-[9px] font-semibold hover:bg-primary/90 mb-0.5">
                          <Check className="w-2 h-2" /> OK
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
