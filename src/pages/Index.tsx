import { useState, useMemo } from "react";
import { FileCheck, RotateCcw } from "lucide-react";
import ConfiguracoesModal, { ConfigData, loadConfig } from "@/components/ConfiguracoesModal";
import ChecklistEtapas from "@/components/ChecklistEtapas";
import ResumoFixo from "@/components/ResumoFixo";
import GerarPropostaModal from "@/components/GerarPropostaModal";
import { Switch } from "@/components/ui/switch";
import {
  EtapaServico, ETAPAS_PADRAO, calcularCustoHora, calcularCustoEtapa,
  calcularTotalProtocolos, formatBRL, calcularTotalHoras,
  type ProtocolosSelecionados,
} from "@/lib/orcamento";

const initEtapas = (): EtapaServico[] =>
  ETAPAS_PADRAO.map(e => ({ ...e, ativa: false, visitas: 0, horas: 0 }));

export default function Index() {
  const [config, setConfig] = useState<ConfigData>(loadConfig);
  const [etapas, setEtapas] = useState<EtapaServico[]>(initEtapas);
  const [protocolos, setProtocolos] = useState<ProtocolosSelecionados>({ art: false, pasta: false, assinatura: false });
  const [lucro, setLucro] = useState(30);
  const [impostos, setImpostos] = useState(5);
  const [comissao, setComissao] = useState(15);

  const custoOperacional = config.custosFixos + config.custosVariaveis + config.investimentos;
  const custoHora = calcularCustoHora(custoOperacional, config.horasProdutivas);

  const custoTecnico = useMemo(
    () => etapas.filter(e => e.ativa).reduce((s, e) => s + calcularCustoEtapa(e, custoHora), 0),
    [etapas, custoHora]
  );

  const totalHoras = useMemo(() => calcularTotalHoras(etapas), [etapas]);

  const custoProtocolos = calcularTotalProtocolos(protocolos, config.protocolo);

  const clearAll = () => {
    setEtapas(initEtapas());
    setProtocolos({ art: false, pasta: false, assinatura: false });
  };

  const toggleProto = (key: keyof ProtocolosSelecionados) => {
    setProtocolos(p => ({ ...p, [key]: !p[key] }));
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="glass-header shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-primary/10 rounded-xl border border-primary/20">
              <img src="/logo-hbs.png" alt="HBS" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-none tracking-tight uppercase">HBS Orçamentos</h1>
              <p className="text-[9px] text-muted-foreground font-medium">Arquitetura & Engenharia</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ConfiguracoesModal config={config} onSave={setConfig} />
            <GerarPropostaModal
              etapas={etapas} custoHora={custoHora}
              protocolos={protocolos} custosProtocolo={config.protocolo}
              lucro={lucro} impostos={impostos} comissao={comissao}
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-3 py-3 space-y-3">
        {/* Custo/hora */}
        <div className="flex items-center justify-between glass-card px-4 py-3">
          <div>
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Custo Hora Técnica</span>
            <p className="text-[10px] text-muted-foreground/60 leading-none">Baseado em custos operacionais</p>
          </div>
          <span className="text-xl font-black text-gradient">{formatBRL(custoHora)}<span className="text-xs text-muted-foreground">/h</span></span>
        </div>

        {/* Protocolos toggles */}
        <div className="glass-card p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Taxas e Protocolos</span>
            </div>
            <button onClick={clearAll}
              className="flex items-center gap-0.5 text-[9px] text-muted-foreground hover:text-destructive px-1.5 py-0.5 rounded hover:bg-destructive/10">
              <RotateCcw className="w-2.5 h-2.5" /> Limpar tudo
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <ProtoToggle label="ART/RRT" value={config.protocolo.art} checked={protocolos.art} onToggle={() => toggleProto('art')} />
            <ProtoToggle label="Pasta Prefeitura" value={config.protocolo.pasta} checked={protocolos.pasta} onToggle={() => toggleProto('pasta')} />
            <ProtoToggle label="Assinatura" value={config.protocolo.assinatura} checked={protocolos.assinatura} onToggle={() => toggleProto('assinatura')} />
          </div>
        </div>

        {/* Etapas */}
        <div className="glass-card p-3">
          <h2 className="text-xs font-semibold text-foreground mb-2">Serviços Técnicos</h2>
          <ChecklistEtapas etapas={etapas} custoHora={custoHora} onUpdate={setEtapas} />
        </div>
      </main>

      <ResumoFixo
        custoTecnico={custoTecnico}
        custoProtocolos={custoProtocolos}
        totalHoras={totalHoras}
        lucro={lucro} impostos={impostos} comissao={comissao}
        onLucroChange={setLucro} onImpostosChange={setImpostos} onComissaoChange={setComissao}
      />
    </div>
  );
}

function ProtoToggle({ label, value, checked, onToggle }: { label: string; value: number; checked: boolean; onToggle: () => void }) {
  return (
    <div className={`flex flex-col items-center gap-1 p-2 rounded-md border transition-all cursor-pointer ${
      checked ? 'bg-primary/10 border-primary/30' : 'bg-surface border-border/20 opacity-50'
    }`} onClick={onToggle}>
      <Switch checked={checked} onCheckedChange={onToggle} className="scale-75" />
      <span className="text-[9px] font-medium text-foreground text-center leading-tight">{label}</span>
      <span className={`text-[10px] font-bold ${checked ? 'text-primary' : 'text-muted-foreground'}`}>{formatBRL(value)}</span>
    </div>
  );
}
