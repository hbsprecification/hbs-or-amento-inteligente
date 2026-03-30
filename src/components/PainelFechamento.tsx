import { TrendingUp, DollarSign, Percent, Receipt } from "lucide-react";
import { formatBRL, calcularPrecoFinal } from "@/lib/orcamento";

interface Props {
  custoExecucao: number;
  markup: number;
  impostos: number;
  onMarkupChange: (v: number) => void;
  onImpostosChange: (v: number) => void;
}

export default function PainelFechamento({ custoExecucao, markup, impostos, onMarkupChange, onImpostosChange }: Props) {
  const { precoVenda, lucroLiquido, margem } = calcularPrecoFinal(custoExecucao, markup, impostos);

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Fechamento & Preço Final</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-surface">
          <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
            <Percent className="w-3.5 h-3.5" /> Markup (Lucro)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              step={5}
              value={markup}
              onChange={e => onMarkupChange(Math.max(0, +e.target.value))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground text-lg font-bold focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-muted-foreground font-medium">%</span>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-surface">
          <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
            <Receipt className="w-3.5 h-3.5" /> Impostos/Taxas
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              step={1}
              value={impostos}
              onChange={e => onImpostosChange(Math.max(0, +e.target.value))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground text-lg font-bold focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-muted-foreground font-medium">%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ResultCard label="Custo Total" value={formatBRL(custoExecucao)} variant="default" />
        <ResultCard label="Preço Recomendado" value={formatBRL(precoVenda)} variant="highlight" />
        <ResultCard label="Lucro Líquido Est." value={formatBRL(lucroLiquido)} variant="success" />
        <ResultCard label="Margem de Lucro" value={`${margem.toFixed(1)}%`} variant="success" />
      </div>
    </div>
  );
}

function ResultCard({ label, value, variant }: { label: string; value: string; variant: 'default' | 'highlight' | 'success' }) {
  const colors = {
    default: 'bg-surface text-foreground',
    highlight: 'gradient-primary glow-primary text-primary-foreground',
    success: 'bg-primary/10 text-primary',
  };
  return (
    <div className={`p-4 rounded-lg text-center ${colors[variant]}`}>
      <p className={`text-xs uppercase tracking-wide mb-1 ${variant === 'highlight' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
        {label}
      </p>
      <p className="text-lg font-extrabold">{value}</p>
    </div>
  );
}
