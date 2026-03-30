import { useState } from "react";
import { CheckSquare, Clock, MapPin, DollarSign, Pencil, Check, RotateCcw, Zap } from "lucide-react";
import { EtapaServico, GRUPOS, calcularCustoEtapa, formatBRL } from "@/lib/orcamento";
import { Checkbox } from "@/components/ui/checkbox";

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
    label: "Regularização Total",
    ids: {
      "reuniao": { visitas: 1, horas: 2, custoFixo: 0 },
      "levantamento-normas": { visitas: 0, horas: 4, custoFixo: 0 },
      "planta-situacao": { visitas: 0, horas: 4, custoFixo: 0 },
      "memorial-descritivo": { visitas: 0, horas: 6, custoFixo: 0 },
      "pasta-prefeitura": { visitas: 0, horas: 2, custoFixo: 150 },
      "art": { visitas: 0, horas: 1, custoFixo: 250 },
      "assinatura": { visitas: 0, horas: 1, custoFixo: 0 },
      "protocolo-cartorio": { visitas: 1, horas: 2, custoFixo: 120 },
    },
  },
  {
    label: "Alvará de Construção",
    ids: {
      "esboco": { visitas: 0, horas: 6, custoFixo: 0 },
      "planta-baixa": { visitas: 0, horas: 16, custoFixo: 0 },
      "elevacoes": { visitas: 0, horas: 8, custoFixo: 0 },
      "memorial-normas": { visitas: 0, horas: 6, custoFixo: 0 },
      "protocolo-prefeitura": { visitas: 1, horas: 2, custoFixo: 0 },
      "art": { visitas: 0, horas: 1, custoFixo: 250 },
    },
  },
  {
    label: "Pacote Condomínio",
    ids: {
      "memorial-fracao": { visitas: 0, horas: 10, custoFixo: 0 },
      "convencao-condominio": { visitas: 0, horas: 12, custoFixo: 0 },
      "quadro-areas": { visitas: 0, horas: 8, custoFixo: 0 },
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
    <div className="glass-card p-3 sm:p-4 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <CheckSquare className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Etapas do Projeto</h2>
        </div>
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-md hover:bg-destructive/10"
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
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
          >
            <Zap className="w-2.5 h-2.5" />
            {preset.label}
          </button>
        ))}
      </div>

      {/* Groups */}
      {GRUPOS.map(grupo => {
        const etapasGrupo = etapas.filter(e => e.grupo === grupo);
        if (etapasGrupo.length === 0) return null;
        return (
          <div key={grupo}>
            <h3 className="text-[9px] font-semibold text-primary uppercase tracking-wider px-1 pt-1 pb-0.5">{grupo}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {etapasGrupo.map(etapa => {
                const custo = calcularCustoEtapa(etapa, custoHora);
                const isEditing = editingId === etapa.id;

                return (
                  <div
                    key={etapa.id}
                    className={`rounded-md border transition-all ${
                      etapa.ativa
                        ? 'bg-card border-primary/20'
                        : 'bg-card/40 border-border/20 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 px-2 py-1.5">
                      <Checkbox
                        checked={etapa.ativa}
                        onCheckedChange={c => update(etapa.id, { ativa: !!c })}
                        className="h-3.5 w-3.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <p className="flex-1 text-[11px] font-medium text-foreground truncate">{etapa.nome}</p>

                      {etapa.ativa && custo > 0 && !isEditing && (
                        <button
                          onClick={() => setEditingId(etapa.id)}
                          className="text-[11px] font-bold text-primary hover:underline cursor-pointer shrink-0"
                        >
                          {formatBRL(custo)}
                        </button>
                      )}

                      {etapa.ativa && (
                        <button
                          onClick={() => setEditingId(isEditing ? null : etapa.id)}
                          className={`p-0.5 rounded transition-colors shrink-0 ${
                            isEditing
                              ? 'bg-primary/20 text-primary'
                              : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                          }`}
                        >
                          <Pencil className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>

                    {etapa.ativa && isEditing && (
                      <div className="px-2 pb-2 pt-0.5 border-t border-border/20">
                        <div className="grid grid-cols-3 gap-1.5 mt-1">
                          <div>
                            <label className="text-[8px] text-muted-foreground uppercase flex items-center gap-0.5">
                              <MapPin className="w-2 h-2" /> Visitas
                            </label>
                            <input
                              type="number" min={0}
                              value={etapa.visitas}
                              onChange={e => update(etapa.id, { visitas: Math.max(0, +e.target.value) })}
                              className="w-full bg-background border border-border rounded px-1.5 py-0.5 text-[11px] text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                            <p className="text-[7px] text-muted-foreground">×8h</p>
                          </div>
                          <div>
                            <label className="text-[8px] text-muted-foreground uppercase flex items-center gap-0.5">
                              <Clock className="w-2 h-2" /> Horas
                            </label>
                            <input
                              type="number" min={0}
                              value={etapa.horas}
                              onChange={e => update(etapa.id, { horas: Math.max(0, +e.target.value) })}
                              className="w-full bg-background border border-border rounded px-1.5 py-0.5 text-[11px] text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] text-muted-foreground uppercase flex items-center gap-0.5">
                              <DollarSign className="w-2 h-2" /> Fixo
                            </label>
                            <input
                              type="number" min={0} step={10}
                              value={etapa.custoFixo}
                              onChange={e => update(etapa.id, { custoFixo: Math.max(0, +e.target.value) })}
                              className="w-full bg-background border border-border rounded px-1.5 py-0.5 text-[11px] text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[9px] text-muted-foreground">
                            Sub: <span className="font-bold text-primary">{formatBRL(custo)}</span>
                          </span>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex items-center gap-0.5 px-2 py-0.5 rounded bg-primary text-primary-foreground text-[9px] font-semibold hover:bg-primary/90 transition-colors"
                          >
                            <Check className="w-2 h-2" />
                            OK
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
