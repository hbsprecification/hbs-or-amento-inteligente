import { CheckSquare, Clock, MapPin } from "lucide-react";
import { EtapaServico, calcularCustoEtapa, formatBRL, HORAS_DIA } from "@/lib/orcamento";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  etapas: EtapaServico[];
  custoHoraTotal: number;
  onUpdate: (etapas: EtapaServico[]) => void;
}

export default function ChecklistEtapas({ etapas, custoHoraTotal, onUpdate }: Props) {
  const update = (id: string, patch: Partial<EtapaServico>) => {
    onUpdate(etapas.map(e => e.id === id ? { ...e, ...patch } : e));
  };

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <CheckSquare className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Etapas do Projeto</h2>
      </div>

      <div className="space-y-3">
        {etapas.map(etapa => {
          const custo = calcularCustoEtapa(etapa, custoHoraTotal);
          return (
            <div
              key={etapa.id}
              className={`p-4 rounded-lg border transition-all ${
                etapa.ativa
                  ? 'bg-surface border-primary/30'
                  : 'bg-surface/50 border-border/30 opacity-60'
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
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <label className="text-xs text-muted-foreground">Horas:</label>
                        <input
                          type="number"
                          min={0}
                          value={etapa.horasEstimadas}
                          onChange={e => update(etapa.id, { horasEstimadas: Math.max(0, +e.target.value) })}
                          className="w-16 bg-background border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        <label className="text-xs text-muted-foreground">Visitas:</label>
                        <input
                          type="number"
                          min={0}
                          value={etapa.visitasEstimadas}
                          onChange={e => update(etapa.id, { visitasEstimadas: Math.max(0, +e.target.value) })}
                          className="w-16 bg-background border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                      <div className="ml-auto text-right">
                        <span className="text-xs text-muted-foreground">Custo: </span>
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
    </div>
  );
}
