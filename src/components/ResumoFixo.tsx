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

export default function ResumoFixo({
  custoExecucao, lucro, impostos, comissao,
  onLucroChange, onImpostosChange, onComissaoChange,
}: Props) {
  const resultado = calcularPrecoFinal(custoExecucao, lucro, impostos, comissao);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/95 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto px-4 py-3">
        {/* Controls row */}
        <div className="flex items-center gap-3 mb-3">
          <PercentInput icon={<Percent className="w-3 h-3" />} label="Lucro" value={lucro} onChange={onLucroChange} />
          <PercentInput icon={<Receipt className="w-3 h-3" />} label="Impostos" value={impostos} onChange={onImpostosChange} />
          <PercentInput icon={<Users className="w-3 h-3" />} label="Comissão" value={comissao} onChange={onComissaoChange} />
        </div>

        {/* Results row */}
        <div className="grid grid-cols-4 gap-2">
          <ResultBox
            label="Custo"
            value={formatBRL(custoExecucao)}
            className="bg-surface text-foreground"
          />
          <ResultBox
            label="Lucro"
            value={formatBRL(resultado.lucro)}
            className="bg-primary/10 text-primary"
          />
          <ResultBox
            label="Margem"
            value={`${resultado.margem.toFixed(1)}%`}
            className="bg-highlight/10 text-highlight"
          />
          <ResultBox
            label="Preço Final"
            value={formatBRL(resultado.precoVenda)}
            className="gradient-primary text-primary-foreground glow-primary"
            highlight
          />
        </div>
      </div>
    </div>
  );
}

function PercentInput({
  icon, label, value, onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex-1 flex items-center gap-1.5 bg-surface rounded-lg px-2.5 py-1.5">
      {icon}
      <span className="text-[10px] text-muted-foreground uppercase hidden sm:inline">{label}</span>
      <input
        type="number" min={0} step={5} value={value}
        onChange={e => onChange(Math.max(0, +e.target.value))}
        className="w-12 bg-transparent text-foreground text-sm font-bold text-right focus:outline-none"
      />
      <span className="text-muted-foreground text-xs">%</span>
    </div>
  );
}

function ResultBox({
  label, value, className, highlight,
}: {
  label: string;
  value: string;
  className: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg px-2 py-2 text-center ${className}`}>
      <p className={`text-[9px] uppercase tracking-wide mb-0.5 ${highlight ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
        {label}
      </p>
      <p className="text-xs sm:text-sm font-extrabold truncate">{value}</p>
    </div>
  );
}
