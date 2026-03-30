import { useState } from "react";
import { FileText, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { EtapaServico } from "@/lib/orcamento";
import { gerarPropostaPDF } from "@/lib/gerarProposta";

interface Props {
  etapas: EtapaServico[];
  custoHora: number;
  lucro: number;
  impostos: number;
  comissao: number;
}

export default function GerarPropostaModal({ etapas, custoHora, lucro, impostos, comissao }: Props) {
  const [open, setOpen] = useState(false);
  const [nomeCliente, setNomeCliente] = useState("");
  const [localObra, setLocalObra] = useState("");

  const ativas = etapas.filter(e => e.ativa).length;

  const handleGerar = () => {
    gerarPropostaPDF(etapas, custoHora, lucro, impostos, comissao, nomeCliente, localObra);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Gerar Proposta</span>
          <span className="sm:hidden">PDF</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Gerar Proposta PDF
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {ativas > 0
              ? `${ativas} etapa${ativas > 1 ? 's' : ''} selecionada${ativas > 1 ? 's' : ''}`
              : 'Nenhuma etapa selecionada'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div className="p-3 rounded-lg bg-surface">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
              <User className="w-3 h-3" /> Nome do Cliente
            </label>
            <input
              type="text"
              value={nomeCliente}
              onChange={e => setNomeCliente(e.target.value)}
              placeholder="Ex: João da Silva"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="p-3 rounded-lg bg-surface">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Local da Obra
            </label>
            <input
              type="text"
              value={localObra}
              onChange={e => setLocalObra(e.target.value)}
              placeholder="Ex: Rua das Flores, 123 - Centro"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <Button onClick={handleGerar} className="w-full mt-2" disabled={ativas === 0}>
          <FileText className="w-4 h-4 mr-1.5" />
          Gerar PDF
        </Button>
      </DialogContent>
    </Dialog>
  );
}
