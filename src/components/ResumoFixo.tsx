import { Percent, Receipt, Users } from "lucide-react";
import { formatBRL, calcularPrecoFinal } from "@/lib/orcamento";

interface Props {
  custoTecnico: number;
  custoProtocolos: number;
  totalHoras: number;
  lucro: number;
  impostos: number;
  comissao: number;
  onLucroChange: (v: number) => void;
  onImpostosChange: (v: number) => void;
  onComissaoChange: (v: number) => void;
}

export default function ResumoFixo({
  custoTecnico, custoProtocolos, totalHoras, lucro, impostos, comissao,
  onLucroChange, onImpostosChange, onComissaoChange,
}: Props) {
  const resultado = calcularPrecoFinal(custoTecnico, custoProtocolos, lucro, impostos, comissao);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/95 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-3 py-2">
        <div className="flex items-center gap-2 mb-1.5">
          <PctInput icon={<Percent className="w-2.5 h-2.5" />} label="Lucro" value={lucro} onChange={onLucroChange} />
          <PctInput icon={<Receipt className="w-2.5 h-2.5" />} label="Impostos" value={impostos} onChange={onImpostosChange} />
          <PctInput icon={<Users className="w-2.5 h-2.5" />} label="Comissão" value={comissao} onChange={onComissaoChange} />
        </div>

        <div className="grid grid-cols-5 gap-1">
          <Box label="Total de Horas" value={`${totalHoras}h`} cls="bg-primary/10 text-primary border border-primary/20" />
          <Box label="Técnico" value={formatBRL(custoTecnico)} cls="bg-surface text-foreground" />
          <Box label="Taxas" value={formatBRL(custoProtocolos)} cls="bg-warning/10 text-warning" />
          <Box label="Comissão" value={formatBRL(resultado.comissao)} cls="bg-highlight/10 text-highlight" />
          <Box label="Preço Final" value={formatBRL(resultado.precoVenda)} cls="gradient-primary text-primary-foreground glow-primary" hl />
        </div>
      </div>
    </div>
  );
}

function PctInput({ icon, label, value, onChange }: { icon: React.ReactNode; label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex-1 flex items-center gap-1 bg-surface rounded px-2 py-1">
      {icon}
      <span className="text-[8px] text-muted-foreground uppercase hidden sm:inline">{label}</span>
      <input type="number" min={0} step={5} value={value}
        onChange={e => onChange(Math.max(0, +e.target.value))}
        className="w-9 bg-transparent text-foreground text-[11px] font-bold text-right focus:outline-none" />
      <span className="text-muted-foreground text-[9px]">%</span>
    </div>
  );
}

function Box({ label, value, cls, hl }: { label: string; value: string; cls: string; hl?: boolean }) {
  return (
    <div className={`rounded px-1 py-1.5 text-center ${cls}`}>
      <p className={`text-[7px] uppercase tracking-wide ${hl ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{label}</p>
      <p className="text-[10px] sm:text-xs font-extrabold truncate">{value}</p>
    </div>
  );
}
