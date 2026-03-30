import { useState } from "react";
import { FileText, MapPin, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import {
  EtapaServico, calcularCustoEtapa, calcularTotalProtocolos, calcularPrecoFinal, formatBRL,
  type ProtocolosSelecionados, type CustosProtocolo,
} from "@/lib/orcamento";
import { gerarPropostaPDF } from "@/lib/gerarProposta";

interface Props {
  etapas: EtapaServico[];
  custoHora: number;
  protocolos: ProtocolosSelecionados;
  custosProtocolo: CustosProtocolo;
  lucro: number;
  impostos: number;
  comissao: number;
}

export default function GerarPropostaModal({ etapas, custoHora, protocolos, custosProtocolo, lucro, impostos, comissao }: Props) {
  const [open, setOpen] = useState(false);
  const [nomeCliente, setNomeCliente] = useState("");
  const [localObra, setLocalObra] = useState("");
  const [prazo, setPrazo] = useState(30);

  const ativas = etapas.filter(e => e.ativa).length;

  const handleGerar = () => {
    gerarPropostaPDF(etapas, custoHora, protocolos, custosProtocolo, lucro, impostos, comissao, nomeCliente, localObra, prazo);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 text-xs">
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Proposta</span>
          <span className="sm:hidden">PDF</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-primary" />
            Gerar Proposta
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {ativas > 0 ? `${ativas} etapa${ativas > 1 ? 's' : ''}` : 'Nenhuma etapa'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-1">
          <Field icon={<User className="w-3 h-3" />} label="Cliente / Obra">
            <input type="text" value={nomeCliente} onChange={e => setNomeCliente(e.target.value)}
              placeholder="Ex: João da Silva" className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </Field>
          <Field icon={<MapPin className="w-3 h-3" />} label="Local">
            <input type="text" value={localObra} onChange={e => setLocalObra(e.target.value)}
              placeholder="Ex: Rua das Flores, 123" className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </Field>
          <Field icon={<Calendar className="w-3 h-3" />} label="Prazo (Dias)">
            <input type="number" min={1} value={prazo} onChange={e => setPrazo(Math.max(1, +e.target.value))}
              className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </Field>
        </div>

        <Button onClick={handleGerar} className="w-full mt-2 text-sm" disabled={ativas === 0}>
          <FileText className="w-4 h-4 mr-1" /> Gerar PDF
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="p-2 rounded-lg bg-surface">
      <label className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5 flex items-center gap-1">{icon} {label}</label>
      {children}
    </div>
  );
}
