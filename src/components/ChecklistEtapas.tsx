import { CheckSquare, Clock, MapPin, DollarSign } from "lucide-react";
import { EtapaServico, GRUPOS, calcularCustoEtapa, formatBRL } from "@/lib/orcamento";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  etapas: EtapaServico[];
  custoHora: number;
  onUpdate: (etapas: EtapaServico[]) => void;
}

export default function ChecklistEtapas({ etapas, custoHora, onUpdate }: Props) {
  const update = (id: string, patch: Partial<EtapaServico>) => {
    onUpdate(etapas.map(e => e.id === id ? { ...e, ...patch } : e));
  };

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <CheckSquare className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Precificação do Projeto</h2>
      </div>

      {GRUPOS.map(grupo => {
        const etapasGrupo = etapas.filter(e => e.grupo === grupo);
        if (etapasGrupo.length === 0) return null;
        return (
          <div key={grupo} className="space-y-2">
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider px-1">{grupo}</h3>
            {etapasGrupo.map(etapa => {
              const custo = calcularCustoEtapa(etapa, custoHora);
              return (
                <div
                  key={etapa.id}
                  className={`p-4 rounded-lg border transition-all ${
                    etapa.ativa ? 'bg-surface border-primary/30' : 'bg-surface/50 border-border/30 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={etapa.ativa}
                      onCheckedChange={c => update(etapa.id, { ativa: !!c })}
                      className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{etapa.nome}</p>
                      {etapa.ativa && (
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                            <label className="text-xs text-muted-foreground">Visitas:</label>
                            <input
                              type="number" min={0}
                              value={etapa.visitas}
                              onChange={e => update(etapa.id, { visitas: Math.max(0, +e.target.value) })}
                              className="w-14 bg-background border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            <label className="text-xs text-muted-foreground">Horas:</label>
                            <input
                              type="number" min={0}
                              value={etapa.horas}
                              onChange={e => update(etapa.id, { horas: Math.max(0, +e.target.value) })}
                              className="w-14 bg-background border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                            <label className="text-xs text-muted-foreground">Custo fixo:</label>
                            <input
                              type="number" min={0} step={10}
                              value={etapa.custoFixo}
                              onChange={e => update(etapa.id, { custoFixo: Math.max(0, +e.target.value) })}
                              className="w-20 bg-background border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                          </div>
                          <div className="ml-auto text-right">
                            <span className="font-semibold text-primary text-sm">{formatBRL(custo)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
