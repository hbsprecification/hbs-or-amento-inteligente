import { useState } from "react";
import { CheckSquare, Clock, MapPin, DollarSign, Pencil, Check, RotateCcw, Zap } from "lucide-react";
import { EtapaServico, GRUPOS, calcularCustoEtapa, formatBRL } from "@/lib/orcamento";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface Props {
  etapas: EtapaServico[];
  custoHora: number;
  onUpdate: (etapas: EtapaServico[]) => void;
}

interface Preset {
  label: string;
  ids: Record<string, { visitas: number; horas: number; custoFixo: number }>;
}

const PRESETS: Preset[] = [
  {
    label: "Regularização Simples",
    ids: {
      "reuniao": { visitas: 1, horas: 2, custoFixo: 0 },
      "visita-levantamento": { visitas: 1, horas: 4, custoFixo: 0 },
      "pasta-prefeitura": { visitas: 0, horas: 2, custoFixo: 150 },
      "art": { visitas: 0, horas: 1, custoFixo: 250 },
      "assinatura": { visitas: 0, horas: 1, custoFixo: 0 },
    },
  },
  {
    label: "Projeto Completo",
    ids: {
      "reuniao": { visitas: 2, horas: 4, custoFixo: 0 },
      "elaboracao-proposta": { visitas: 0, horas: 3, custoFixo: 0 },
      "visita-levantamento": { visitas: 2, horas: 8, custoFixo: 0 },
      "esboco": { visitas: 0, horas: 6, custoFixo: 0 },
      "levantamento-normas": { visitas: 0, horas: 4, custoFixo: 0 },
      "planta-baixa": { visitas: 0, horas: 16, custoFixo: 0 },
      "elevacoes": { visitas: 0, horas: 8, custoFixo: 0 },
      "planta-situacao": { visitas: 0, horas: 4, custoFixo: 0 },
      "calculos": { visitas: 0, horas: 6, custoFixo: 0 },
      "pranchas": { visitas: 0, horas: 4, custoFixo: 0 },
      "assinatura": { visitas: 0, horas: 1, custoFixo: 0 },
      "pasta-prefeitura": { visitas: 0, horas: 2, custoFixo: 150 },
      "art": { visitas: 0, horas: 1, custoFixo: 250 },
    },
  },
  {
    label: "Consultoria Técnica",
    ids: {
      "reuniao": { visitas: 1, horas: 2, custoFixo: 0 },
      "visita-levantamento": { visitas: 2, horas: 4, custoFixo: 0 },
      "levantamento-normas": { visitas: 0, horas: 4, custoFixo: 0 },
      "art": { visitas: 0, horas: 1, custoFixo: 250 },
    },
  },
];

export default function ChecklistEtapas({ etapas, custoHora, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const update = (id: string, patch: Partial<EtapaServico>) => {
    onUpdate(etapas.map(e => e.id === id ? { ...e, ...patch } : e));
  };

  const applyPreset = (preset: Preset) => {
    onUpdate(etapas.map(e => {
      const p = preset.ids[e.id];
      if (p) return { ...e, ativa: true, visitas: p.visitas, horas: p.horas, custoFixo: p.custoFixo };
      return { ...e, ativa: false, visitas: 0, horas: 0, custoFixo: 0 };
    }));
  };

  const clearAll = () => {
    onUpdate(etapas.map(e => ({ ...e, ativa: false, visitas: 0, horas: 0, custoFixo: 0 })));
  };

  return (
    <div className="glass-card p-4 sm:p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <CheckSquare className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-base font-semibold text-foreground">Etapas do Projeto</h2>
        </div>
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-md hover:bg-destructive/10"
        >
          <RotateCcw className="w-3 h-3" />
          Limpar
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map(preset => (
          <button
            key={preset.label}
            onClick={() => applyPreset(preset)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
          >
            <Zap className="w-3 h-3" />
            {preset.label}
          </button>
        ))}
      </div>

      {/* Groups */}
      {GRUPOS.map(grupo => {
        const etapasGrupo = etapas.filter(e => e.grupo === grupo);
        if (etapasGrupo.length === 0) return null;
        return (
          <div key={grupo} className="space-y-1">
            <h3 className="text-[10px] font-semibold text-primary uppercase tracking-wider px-1 pt-1.5">{grupo}</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
              {etapasGrupo.map(etapa => {
                const custo = calcularCustoEtapa(etapa, custoHora);
                const isEditing = editingId === etapa.id;

                return (
                  <div
                    key={etapa.id}
                    className={`rounded-lg border transition-all ${
                      etapa.ativa
                        ? 'bg-card border-primary/20'
                        : 'bg-card/40 border-border/20 opacity-50'
                    }`}
                  >
                    {/* Compact row */}
                    <div className="flex items-center gap-2 px-3 py-2">
                      <Checkbox
                        checked={etapa.ativa}
                        onCheckedChange={c => update(etapa.id, { ativa: !!c })}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <p className="flex-1 text-xs font-medium text-foreground truncate">{etapa.nome}</p>

                      {etapa.ativa && custo > 0 && !isEditing && (
                        <button
                          onClick={() => setEditingId(etapa.id)}
                          className="text-xs font-bold text-primary hover:underline cursor-pointer"
                        >
                          {formatBRL(custo)}
                        </button>
                      )}

                      {etapa.ativa && (
                        <button
                          onClick={() => setEditingId(isEditing ? null : etapa.id)}
                          className={`p-1 rounded-md transition-colors ${
                            isEditing
                              ? 'bg-primary/20 text-primary'
                              : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                          }`}
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Expanded edit */}
                    {etapa.ativa && isEditing && (
                      <div className="px-3 pb-3 pt-1 border-t border-border/20">
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <div>
                            <label className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5 flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5" /> Visitas
                            </label>
                            <input
                              type="number" min={0}
                              value={etapa.visitas}
                              onChange={e => update(etapa.id, { visitas: Math.max(0, +e.target.value) })}
                              className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <p className="text-[8px] text-muted-foreground mt-0.5">×8h cada</p>
                          </div>
                          <div>
                            <label className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5 flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" /> Horas
                            </label>
                            <input
                              type="number" min={0}
                              value={etapa.horas}
                              onChange={e => update(etapa.id, { horas: Math.max(0, +e.target.value) })}
                              className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5 flex items-center gap-0.5">
                              <DollarSign className="w-2.5 h-2.5" /> Fixo
                            </label>
                            <input
                              type="number" min={0} step={10}
                              value={etapa.custoFixo}
                              onChange={e => update(etapa.id, { custoFixo: Math.max(0, +e.target.value) })}
                              className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-muted-foreground">
                            Subtotal: <span className="font-bold text-primary">{formatBRL(custo)}</span>
                          </span>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold hover:bg-primary/90 transition-colors"
                          >
                            <Check className="w-2.5 h-2.5" />
                            Salvar
                          </button>
                        </div>
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
