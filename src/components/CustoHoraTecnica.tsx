import { useState } from "react";
import { Settings, Calculator } from "lucide-react";
import { CUSTO_HORA_OPERACIONAL, CUSTO_OPERACIONAL_MENSAL, DIAS_UTEIS, HORAS_DIA, formatBRL } from "@/lib/orcamento";

interface Props {
  salarioHora: number;
  onSalarioChange: (v: number) => void;
}

export default function CustoHoraTecnica({ salarioHora, onSalarioChange }: Props) {
  const custoTotal = CUSTO_HORA_OPERACIONAL + salarioHora;

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
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Custo Operacional</p>
          <p className="text-sm text-muted-foreground">{formatBRL(CUSTO_OPERACIONAL_MENSAL)}/mês</p>
          <p className="text-lg font-bold text-foreground">{formatBRL(CUSTO_HORA_OPERACIONAL)}<span className="text-sm font-normal text-muted-foreground">/hora</span></p>
          <p className="text-xs text-muted-foreground mt-1">{DIAS_UTEIS} dias × {HORAS_DIA}h</p>
        </div>

        <div className="p-4 rounded-lg bg-surface">
          <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Salário Engenheiro/Hora</label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">R$</span>
            <input
              type="number"
              min={0}
              step={5}
              value={salarioHora}
              onChange={e => onSalarioChange(Math.max(0, +e.target.value))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground text-lg font-bold focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="p-4 rounded-lg gradient-primary glow-primary">
          <p className="text-xs text-primary-foreground/70 uppercase tracking-wide mb-1">Custo Total/Hora</p>
          <p className="text-2xl font-extrabold text-primary-foreground">{formatBRL(custoTotal)}</p>
          <p className="text-xs text-primary-foreground/70 mt-1">por hora técnica</p>
        </div>
      </div>
    </div>
  );
}
