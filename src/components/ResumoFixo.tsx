import { Percent, Receipt, Users } from "lucide-react";
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
      <div className="max-w-5xl mx-auto px-4 py-2">
        {/* Controls row */}
        <div className="flex items-center gap-2 mb-2">
          <PercentInput icon={<Percent className="w-3 h-3" />} label="Lucro" value={lucro} onChange={onLucroChange} />
          <PercentInput icon={<Receipt className="w-3 h-3" />} label="Impostos" value={impostos} onChange={onImpostosChange} />
          <PercentInput icon={<Users className="w-3 h-3" />} label="Comissão" value={comissao} onChange={onComissaoChange} />
        </div>

        {/* Results row */}
        <div className="grid grid-cols-5 gap-1.5">
          <ResultBox label="Custo" value={formatBRL(custoExecucao)} className="bg-surface text-foreground" />
          <ResultBox label="Lucro" value={formatBRL(resultado.lucro)} className="bg-primary/10 text-primary" />
          <ResultBox label="Comissão" value={formatBRL(resultado.comissao)} className="bg-warning/10 text-warning" />
          <ResultBox label="Líquido" value={formatBRL(resultado.valorLiquidoAposComissao)} className="bg-highlight/10 text-highlight" />
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
    <div className="flex-1 flex items-center gap-1 bg-surface rounded-md px-2 py-1">
      {icon}
      <span className="text-[9px] text-muted-foreground uppercase hidden sm:inline">{label}</span>
      <input
        type="number" min={0} step={5} value={value}
        onChange={e => onChange(Math.max(0, +e.target.value))}
        className="w-10 bg-transparent text-foreground text-xs font-bold text-right focus:outline-none"
      />
      <span className="text-muted-foreground text-[10px]">%</span>
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
    <div className={`rounded-md px-1.5 py-1.5 text-center ${className}`}>
      <p className={`text-[8px] uppercase tracking-wide mb-0.5 ${highlight ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
        {label}
      </p>
      <p className="text-[11px] sm:text-xs font-extrabold truncate">{value}</p>
    </div>
  );
}
