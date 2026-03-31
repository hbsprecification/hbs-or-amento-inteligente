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
  children?: React.ReactNode;
}

export default function ResumoFixo({
  custoTecnico, custoProtocolos, totalHoras, lucro, impostos, comissao,
  onLucroChange, onImpostosChange, onComissaoChange, children
}: Props) {
  const resultado = calcularPrecoFinal(custoTecnico, custoProtocolos, lucro, impostos, comissao);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-background/80 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <PctInput icon={<Percent className="w-3 h-3 text-primary" />} label="Lucro" value={lucro} onChange={onLucroChange} />
              <PctInput icon={<Receipt className="w-3 h-3 text-primary" />} label="Impostos" value={impostos} onChange={onImpostosChange} />
              <PctInput icon={<Users className="w-3 h-3 text-primary" />} label="Repasse" value={comissao} onChange={onComissaoChange} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 sm:mt-0">
              <Box label="Total de Horas" value={`${totalHoras}h`} cls="bg-primary/10 text-primary border border-primary/20" />
              <Box label="Custo Técnico" value={formatBRL(custoTecnico)} cls="bg-surface text-foreground border border-white/5" />
              <Box label="Minha Assinatura" value={formatBRL(custoProtocolos)} cls="bg-warning/10 text-warning border border-warning/20" />
              <Box label="Repasse Projetista" value={formatBRL(resultado.comissao)} cls="bg-highlight/10 text-highlight border border-highlight/20" />
            </div>
          </div>
          
          <div className="md:w-64 shrink-0 flex flex-col justify-end mt-2 sm:mt-0">
            <div className="flex justify-between items-end px-1">
              <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Preço Final</span>
              <span className="text-lg sm:text-2xl font-black text-foreground drop-shadow-md tracking-tighter">{formatBRL(resultado.precoVenda)}</span>
            </div>
            
            <div className="flex justify-between items-center px-2 py-1.5 bg-highlight/10 border border-highlight/20 rounded-md mt-1 mb-2">
              <span className="text-[8px] sm:text-[9px] text-highlight uppercase font-black tracking-widest">Lucro Líquido HBS</span>
              <span className="text-xs sm:text-sm font-black text-highlight tracking-tighter">{formatBRL(resultado.precoVenda - resultado.comissao - resultado.imposto)}</span>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function PctInput({ icon, label, value, onChange }: { icon: React.ReactNode; label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex-1 flex items-center gap-2 bg-surface/50 border border-white/5 rounded-xl px-3 py-2 focus-within:border-primary/50 transition-colors">
      {icon}
      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest hidden sm:inline">{label}</span>
      <input type="number" min={0} step={5} value={value}
        onChange={e => onChange(Math.max(0, +e.target.value))}
        className="w-10 bg-transparent text-foreground text-xs font-black text-right focus:outline-none ml-auto" />
      <span className="text-muted-foreground text-[10px] font-bold">%</span>
    </div>
  );
}

function Box({ label, value, cls }: { label: string; value: string; cls: string }) {
  return (
    <div className={`rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 flex flex-col justify-center ${cls}`}>
      <p className={`text-[7.5px] sm:text-[8px] uppercase font-bold tracking-wider sm:tracking-widest text-muted-foreground mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis`}>{label}</p>
      <p className="text-[11.5px] sm:text-sm font-black tracking-tighter whitespace-nowrap overflow-hidden text-ellipsis">{value}</p>
    </div>
  );
}
