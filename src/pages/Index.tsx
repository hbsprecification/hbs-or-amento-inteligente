import { useState, useMemo } from "react";
import { FileText } from "lucide-react";
import CustoHoraTecnica from "@/components/CustoHoraTecnica";
import ChecklistEtapas from "@/components/ChecklistEtapas";
import PainelFechamento from "@/components/PainelFechamento";
import { Button } from "@/components/ui/button";
import {
  EtapaServico,
  ETAPAS_PADRAO,
  CUSTO_OPERACIONAL_TOTAL,
  HORAS_PRODUTIVAS_PADRAO,
  calcularCustoHora,
  calcularCustoEtapa,
} from "@/lib/orcamento";
import { gerarPropostaPDF } from "@/lib/gerarProposta";

const initEtapas = (): EtapaServico[] =>
  ETAPAS_PADRAO.map(e => ({ ...e, ativa: false, visitas: 0, horas: 0, custoFixo: 0 }));

export default function Index() {
  const [custoOperacional, setCustoOperacional] = useState(CUSTO_OPERACIONAL_TOTAL);
  const [horasProdutivas, setHorasProdutivas] = useState(HORAS_PRODUTIVAS_PADRAO);
  const [etapas, setEtapas] = useState<EtapaServico[]>(initEtapas);
  const [lucro, setLucro] = useState(30);
  const [impostos, setImpostos] = useState(5);
  const [comissao, setComissao] = useState(15);
  const [nomeCliente, setNomeCliente] = useState("");

  const custoHora = calcularCustoHora(custoOperacional, horasProdutivas);

  const custoExecucao = useMemo(
    () => etapas.filter(e => e.ativa).reduce((s, e) => s + calcularCustoEtapa(e, custoHora), 0),
    [etapas, custoHora]
  );

  const handleGerarPDF = () => {
    gerarPropostaPDF(etapas, custoHora, lucro, impostos, comissao, nomeCliente);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-hbs.png" alt="HBS Engenharia" className="w-9 h-9 object-contain" />
            <div>
              <h1 className="text-base font-bold text-foreground leading-none">HBS Orçamentos</h1>
              <p className="text-xs text-muted-foreground">Modelo de Precificação</p>
            </div>
          </div>
          <Button onClick={handleGerarPDF} className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Gerar Proposta PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
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

        <CustoHoraTecnica
          custoOperacional={custoOperacional}
          horasProdutivas={horasProdutivas}
          onCustoChange={setCustoOperacional}
          onHorasChange={setHorasProdutivas}
        />

        <ChecklistEtapas etapas={etapas} custoHora={custoHora} onUpdate={setEtapas} />

        <PainelFechamento
          custoExecucao={custoExecucao}
          lucro={lucro}
          impostos={impostos}
          comissao={comissao}
          onLucroChange={setLucro}
          onImpostosChange={setImpostos}
          onComissaoChange={setComissao}
        />
      </main>
    </div>
  );
}
