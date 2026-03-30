import { useState, useMemo } from "react";
import { FileText, Download } from "lucide-react";
import CustoHoraTecnica from "@/components/CustoHoraTecnica";
import ChecklistEtapas from "@/components/ChecklistEtapas";
import PainelFechamento from "@/components/PainelFechamento";
import { Button } from "@/components/ui/button";
import {
  EtapaServico,
  ETAPAS_PADRAO,
  CUSTO_HORA_OPERACIONAL,
  calcularCustoEtapa,
} from "@/lib/orcamento";
import { gerarPropostaPDF } from "@/lib/gerarProposta";

const initEtapas = (): EtapaServico[] =>
  ETAPAS_PADRAO.map(e => ({ ...e, ativa: false, horasEstimadas: 0, visitasEstimadas: 0 }));

export default function Index() {
  const [salarioHora, setSalarioHora] = useState(50);
  const [etapas, setEtapas] = useState<EtapaServico[]>(initEtapas);
  const [markup, setMarkup] = useState(150);
  const [impostos, setImpostos] = useState(5);
  const [nomeCliente, setNomeCliente] = useState("");

  const custoHoraTotal = CUSTO_HORA_OPERACIONAL + salarioHora;

  const custoExecucao = useMemo(
    () => etapas.filter(e => e.ativa).reduce((s, e) => s + calcularCustoEtapa(e, custoHoraTotal), 0),
    [etapas, custoHoraTotal]
  );

  const handleGerarPDF = () => {
    gerarPropostaPDF(etapas, custoHoraTotal, markup, impostos, nomeCliente);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-hbs.png" alt="HBS" className="w-8 h-8" />
            <div>
              <h1 className="text-base font-bold text-foreground leading-none">HBS Orçamentos</h1>
              <p className="text-xs text-muted-foreground">Precificação de Engenharia</p>
            </div>
          </div>
          <Button onClick={handleGerarPDF} className="gap-2">
            <FileText className="w-4 h-4" />
            Gerar Proposta PDF
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Cliente */}
        <div className="glass-card p-4">
          <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Nome do Cliente</label>
          <input
            type="text"
            value={nomeCliente}
            onChange={e => setNomeCliente(e.target.value)}
            placeholder="Ex: João da Silva"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <CustoHoraTecnica salarioHora={salarioHora} onSalarioChange={setSalarioHora} />
        <ChecklistEtapas etapas={etapas} custoHoraTotal={custoHoraTotal} onUpdate={setEtapas} />
        <PainelFechamento
          custoExecucao={custoExecucao}
          markup={markup}
          impostos={impostos}
          onMarkupChange={setMarkup}
          onImpostosChange={setImpostos}
        />
      </main>
    </div>
  );
}
