import { TrendingUp, Percent, Receipt, Users } from "lucide-react";
import { formatBRL, calcularPrecoFinal } from "@/lib/orcamento";

interface Props {
  custoExecucao: number;
  lucro: number;
  impostos: number;
  comissao: number;
  onLucroChange: (v: number) => void;
  onImpostosChange: (v: number) => void;
  onComissaoChange: (v: number) => void;
}

export default function PainelFechamento({ custoExecucao, lucro, impostos, comissao, onLucroChange, onImpostosChange, onComissaoChange }: Props) {
  const resultado = calcularPrecoFinal(custoExecucao, lucro, impostos, comissao);

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Custos do Projeto</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-surface">
          <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
            <Percent className="w-3.5 h-3.5" /> Lucro
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number" min={0} step={5} value={lucro}
              onChange={e => onLucroChange(Math.max(0, +e.target.value))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground text-lg font-bold focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-muted-foreground font-medium">%</span>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-surface">
          <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
            <Receipt className="w-3.5 h-3.5" /> Impostos
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number" min={0} step={1} value={impostos}
              onChange={e => onImpostosChange(Math.max(0, +e.target.value))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground text-lg font-bold focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-muted-foreground font-medium">%</span>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-surface">
          <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Comissão
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number" min={0} step={1} value={comissao}
              onChange={e => onComissaoChange(Math.max(0, +e.target.value))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground text-lg font-bold focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-muted-foreground font-medium">%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <ResultCard label="Custo Total" value={formatBRL(custoExecucao)} variant="default" />
        <ResultCard label="Lucro" value={formatBRL(resultado.lucro)} variant="success" />
        <ResultCard label="Imposto" value={formatBRL(resultado.imposto)} variant="default" />
        <ResultCard label="Preço de Venda" value={formatBRL(resultado.precoVenda)} variant="highlight" />
        <ResultCard label={`Comissão ${comissao}%`} value={formatBRL(resultado.comissao)} variant="warning" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-lg bg-surface text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Líquido (após comissão)</p>
          <p className="text-xl font-extrabold text-foreground">{formatBRL(resultado.valorLiquidoAposComissao)}</p>
        </div>
        <div className="p-4 rounded-lg gradient-primary glow-primary text-center">
          <p className="text-xs text-primary-foreground/70 uppercase tracking-wide mb-1">Margem de Lucro</p>
          <p className="text-xl font-extrabold text-primary-foreground">{resultado.margem.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ label, value, variant }: { label: string; value: string; variant: 'default' | 'highlight' | 'success' | 'warning' }) {
  const colors = {
    default: 'bg-surface text-foreground',
    highlight: 'gradient-primary glow-primary text-primary-foreground',
    success: 'bg-primary/10 text-primary',
    warning: 'bg-warning/10 text-warning',
  };
  return (
    <div className={`p-3 rounded-lg text-center ${colors[variant]}`}>
      <p className={`text-[10px] uppercase tracking-wide mb-1 ${variant === 'highlight' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
        {label}
      </p>
      <p className="text-sm font-extrabold">{value}</p>
    </div>
  );
}
