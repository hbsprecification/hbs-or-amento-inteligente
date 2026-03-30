import { useState } from "react";
import { CheckSquare, Clock, MapPin, DollarSign, Pencil, Check } from "lucide-react";
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
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <CheckSquare className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Etapas do Projeto</h2>
      </div>

      {GRUPOS.map(grupo => {
        const etapasGrupo = etapas.filter(e => e.grupo === grupo);
        if (etapasGrupo.length === 0) return null;
        return (
          <div key={grupo} className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-primary uppercase tracking-wider px-1 pt-2">{grupo}</h3>
            {etapasGrupo.map(etapa => {
              const custo = calcularCustoEtapa(etapa, custoHora);
              const isEditing = editingId === etapa.id;

              return (
                <div
                  key={etapa.id}
                  className={`rounded-xl border transition-all ${
                    etapa.ativa
                      ? 'bg-card border-primary/20'
                      : 'bg-card/40 border-border/20 opacity-50'
                  }`}
                >
                  {/* Row principal - sempre visível */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Checkbox
                      checked={etapa.ativa}
                      onCheckedChange={c => update(etapa.id, { ativa: !!c })}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <p className="flex-1 text-sm font-medium text-foreground truncate">{etapa.nome}</p>

                    {etapa.ativa && custo > 0 && !isEditing && (
                      <span className="text-sm font-bold text-primary">{formatBRL(custo)}</span>
                    )}

                    {etapa.ativa && (
                      <button
                        onClick={() => setEditingId(isEditing ? null : etapa.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isEditing
                            ? 'bg-primary/20 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                        }`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Campos expandidos */}
                  {etapa.ativa && isEditing && (
                    <div className="px-4 pb-4 pt-1 border-t border-border/20">
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div>
                          <label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Visitas
                          </label>
                          <input
                            type="number" min={0}
                            value={etapa.visitas}
                            onChange={e => update(etapa.id, { visitas: Math.max(0, +e.target.value) })}
                            className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          <p className="text-[9px] text-muted-foreground mt-0.5">×8h cada</p>
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Horas
                          </label>
                          <input
                            type="number" min={0}
                            value={etapa.horas}
                            onChange={e => update(etapa.id, { horas: Math.max(0, +e.target.value) })}
                            className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> Fixo
                          </label>
                          <input
                            type="number" min={0} step={10}
                            value={etapa.custoFixo}
                            onChange={e => update(etapa.id, { custoFixo: Math.max(0, +e.target.value) })}
                            className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">
                          Subtotal: <span className="font-bold text-primary">{formatBRL(custo)}</span>
                        </span>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          Salvar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
