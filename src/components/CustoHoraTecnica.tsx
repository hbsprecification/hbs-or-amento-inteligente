import { Settings, Calculator } from "lucide-react";
import { formatBRL, calcularCustoHora } from "@/lib/orcamento";

interface Props {
  custoOperacional: number;
  horasProdutivas: number;
  onCustoChange: (v: number) => void;
  onHorasChange: (v: number) => void;
}

export default function CustoHoraTecnica({ custoOperacional, horasProdutivas, onCustoChange, onHorasChange }: Props) {
  const custoHora = calcularCustoHora(custoOperacional, horasProdutivas);

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Calculator className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Custo Hora Técnica</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-surface">
          <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Custo Operacional Mensal</label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">R$</span>
            <input
              type="number"
              min={0}
              step={50}
              value={custoOperacional}
              onChange={e => onCustoChange(Math.max(0, +e.target.value))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground text-lg font-bold focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Fixos + Variáveis + Investimentos</p>
        </div>

        <div className="p-4 rounded-lg bg-surface">
          <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Horas Produtivas/Mês</label>
          <input
            type="number"
            min={1}
            step={1}
            value={horasProdutivas}
            onChange={e => onHorasChange(Math.max(1, +e.target.value))}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground text-lg font-bold focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground mt-1">Total de horas produtivas efetivas</p>
        </div>

        <div className="p-4 rounded-lg gradient-primary glow-primary">
          <p className="text-xs text-primary-foreground/70 uppercase tracking-wide mb-1">Custo por Hora</p>
          <p className="text-2xl font-extrabold text-primary-foreground">{formatBRL(custoHora)}</p>
          <p className="text-xs text-primary-foreground/70 mt-1">{formatBRL(custoOperacional)} ÷ {horasProdutivas}h</p>
        </div>
      </div>
    </div>
  );
}
