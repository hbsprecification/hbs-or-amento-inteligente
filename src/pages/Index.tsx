import { useState, useMemo } from "react";
import ConfiguracoesModal, { ConfigData, loadConfig } from "@/components/ConfiguracoesModal";
import ChecklistEtapas from "@/components/ChecklistEtapas";
import ResumoFixo from "@/components/ResumoFixo";
import GerarPropostaModal from "@/components/GerarPropostaModal";
import {
  EtapaServico,
  ETAPAS_PADRAO,
  calcularCustoHora,
  calcularCustoEtapa,
} from "@/lib/orcamento";

const initEtapas = (): EtapaServico[] =>
  ETAPAS_PADRAO.map(e => ({ ...e, ativa: false, visitas: 0, horas: 0, custoFixo: 0 }));

export default function Index() {
  const [config, setConfig] = useState<ConfigData>(loadConfig);
  const [etapas, setEtapas] = useState<EtapaServico[]>(initEtapas);
  const [lucro, setLucro] = useState(30);
  const [impostos, setImpostos] = useState(5);
  const [comissao, setComissao] = useState(15);

  const custoOperacional = config.custosFixos + config.custosVariaveis + config.investimentos;
  const custoHora = calcularCustoHora(custoOperacional, config.horasProdutivas);

  const custoExecucao = useMemo(
    () => etapas.filter(e => e.ativa).reduce((s, e) => s + calcularCustoEtapa(e, custoHora), 0),
    [etapas, custoHora]
  );

  return (
    <div className="min-h-screen bg-background pb-36">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-hbs.png" alt="HBS Engenharia" className="w-9 h-9 object-contain" />
            <div>
              <h1 className="text-base font-bold text-foreground leading-none">HBS Orçamentos</h1>
              <p className="text-xs text-muted-foreground">Modelo de Precificação</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ConfiguracoesModal config={config} onSave={setConfig} />
            <GerarPropostaModal
              etapas={etapas}
              custoHora={custoHora}
              lucro={lucro}
              impostos={impostos}
              comissao={comissao}
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5 space-y-4">
        {/* Custo/hora badge */}
        <div className="flex items-center justify-between glass-card px-4 py-2.5">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Custo Hora Técnica</span>
          <span className="text-lg font-extrabold text-gradient">
            {custoHora.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/h
          </span>
        </div>

        {/* Etapas */}
        <ChecklistEtapas etapas={etapas} custoHora={custoHora} onUpdate={setEtapas} />
      </main>

      {/* Sticky footer */}
      <ResumoFixo
        custoExecucao={custoExecucao}
        lucro={lucro}
        impostos={impostos}
        comissao={comissao}
        onLucroChange={setLucro}
        onImpostosChange={setImpostos}
        onComissaoChange={setComissao}
      />
    </div>
  );
}
