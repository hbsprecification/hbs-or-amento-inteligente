import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import {
  CUSTOS_FIXOS_PADRAO, CUSTOS_VARIAVEIS_PADRAO, INVESTIMENTOS_PADRAO,
  HORAS_PRODUTIVAS_PADRAO, CUSTOS_PROTOCOLO_PADRAO, TEMPOS_PADRAO_INICIAIS,
  calcularCustoHora, formatBRL, ETAPAS_PADRAO,
  type CustosProtocolo, type TemposPadrao,
} from "@/lib/orcamento";

const STORAGE_KEY = "hbs-config";

export interface ConfigData {
  custosFixos: number;
  custosVariaveis: number;
  investimentos: number;
  horasProdutivas: number;
  protocolo: CustosProtocolo;
  temposPadrao: TemposPadrao;
}

export function loadConfig(): ConfigData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { 
        ...defaultConfig(), 
        ...parsed, 
        protocolo: { ...CUSTOS_PROTOCOLO_PADRAO, ...(parsed.protocolo || {}) },
        temposPadrao: { ...TEMPOS_PADRAO_INICIAIS, ...(parsed.temposPadrao || {}) }
      };
    }
  } catch {}
  return defaultConfig();
}

function defaultConfig(): ConfigData {
  return {
    custosFixos: CUSTOS_FIXOS_PADRAO,
    custosVariaveis: CUSTOS_VARIAVEIS_PADRAO,
    investimentos: INVESTIMENTOS_PADRAO,
    horasProdutivas: HORAS_PRODUTIVAS_PADRAO,
    protocolo: { ...CUSTOS_PROTOCOLO_PADRAO },
    temposPadrao: { ...TEMPOS_PADRAO_INICIAIS },
  };
}

function saveConfig(data: ConfigData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

interface Props {
  config: ConfigData;
  onSave: (config: ConfigData) => void;
}

export default function ConfiguracoesModal({ config, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"financeiro" | "tempos">("financeiro");
  const [local, setLocal] = useState<ConfigData>(config);

  useEffect(() => { setLocal(config); }, [config]);

  const total = local.custosFixos + local.custosVariaveis + local.investimentos;
  const custoHora = calcularCustoHora(total, local.horasProdutivas);

  const handleSave = () => { saveConfig(local); onSave(local); setOpen(false); };

  const updateProto = (key: keyof CustosProtocolo, val: number) => {
    setLocal({ ...local, protocolo: { ...local.protocolo, [key]: Math.max(0, val) } });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Settings className="w-4 h-4 text-primary" />
            Configurações
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Ajuste a inteligência de negócios da HBS.
          </DialogDescription>
        </DialogHeader>

        <div className="flex bg-surface/50 p-1 rounded-lg gap-1 border border-white/5 mt-1">
          <button 
           onClick={() => setActiveTab('financeiro')} 
           className={`flex-1 text-[10px] sm:text-xs font-bold py-1.5 rounded-md transition-all ${activeTab === 'financeiro' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-white/5'}`}>Financeiro & Custos</button>
          <button 
           onClick={() => setActiveTab('tempos')} 
           className={`flex-1 text-[10px] sm:text-xs font-bold py-1.5 rounded-md transition-all ${activeTab === 'tempos' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-white/5'}`}>Tempos Padrão</button>
        </div>

        {activeTab === 'financeiro' && (
          <div className="space-y-2 mt-1">
            <p className="text-[9px] font-semibold text-primary uppercase tracking-wider">Custos Operacionais Mensais</p>
            <CurrencyField label="Custos Fixos" value={local.custosFixos} onChange={v => setLocal({ ...local, custosFixos: v })} desc="Aluguel, Internet, Condomínio, Softwares." />
            <CurrencyField label="Custos Variáveis" value={local.custosVariaveis} onChange={v => setLocal({ ...local, custosVariaveis: v })} desc="Combustível, Impressões, Taxas de Cartório." />
            <CurrencyField label="Investimentos" value={local.investimentos} onChange={v => setLocal({ ...local, investimentos: v })} desc="Anúncios, Cursos, Equipamentos." />

            <div className="p-2 rounded-lg bg-surface">
              <label className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1 block">Horas Produtivas/Mês</label>
              <input type="number" min={1} value={local.horasProdutivas}
                onChange={e => setLocal({ ...local, horasProdutivas: Math.max(1, +e.target.value) })}
                className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <p className="text-[10px] text-muted-foreground mt-0.5">Recomendado: 74h a 100h.</p>
            </div>

            <div className="p-3 rounded-lg gradient-primary text-center">
              <p className="text-[9px] text-primary-foreground/70 uppercase">Custo por Hora</p>
              <p className="text-xl font-extrabold text-primary-foreground">{formatBRL(custoHora)}</p>
              <p className="text-[9px] text-primary-foreground/50 mt-1">Custo mínimo para não ter prejuízo.</p>
            </div>

            <div className="h-px bg-border/50 my-1" />

            <p className="text-[9px] font-semibold text-primary uppercase tracking-wider">Custos Fixos de Protocolo</p>
            <p className="text-[10px] text-muted-foreground -mt-1">Valores somados ao orçamento quando ativados na tela principal.</p>

            <div className="grid grid-cols-3 gap-2">
              <ProtoField label="ART / RRT" value={local.protocolo.art} onChange={v => updateProto('art', v)} />
              <ProtoField label="Pasta Prefeitura" value={local.protocolo.pasta} onChange={v => updateProto('pasta', v)} />
              <ProtoField label="Assinatura Técnica" value={local.protocolo.assinatura} onChange={v => updateProto('assinatura', v)} />
            </div>
          </div>
        )}

        {activeTab === 'tempos' && (
          <div className="space-y-2 mt-1 px-1">
            <p className="text-[10px] text-muted-foreground leading-tight mb-2">Configure as horas e visitas automáticas para cada item. Isso será carregado sempre que você ativar o cartão na dashboard.</p>
            {ETAPAS_PADRAO.map(etapa => (
              <div key={etapa.id} className="p-2 mb-2 rounded-lg bg-surface border border-white/5">
                <p className="text-[10px] font-bold text-foreground mb-1.5 leading-tight truncate">{etapa.nome}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 bg-background rounded border border-border px-1.5">
                    <span className="text-[8px] sm:text-[9px] text-muted-foreground font-bold tracking-widest flex-1">HORAS</span>
                    <input type="number" min="0" value={local.temposPadrao[etapa.id]?.h || 0} 
                      onChange={e => setLocal({ ...local, temposPadrao: { ...local.temposPadrao, [etapa.id]: { ...(local.temposPadrao[etapa.id] || {v:0,h:0}), h: Math.max(0, +e.target.value) } } })}
                      className="w-10 bg-transparent py-1 text-right text-xs font-black focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-1.5 bg-background rounded border border-border px-1.5">
                    <span className="text-[8px] sm:text-[9px] text-muted-foreground font-bold tracking-widest flex-1">VISITAS</span>
                    <input type="number" min="0" value={local.temposPadrao[etapa.id]?.v || 0} 
                      onChange={e => setLocal({ ...local, temposPadrao: { ...local.temposPadrao, [etapa.id]: { ...(local.temposPadrao[etapa.id] || {v:0,h:0}), v: Math.max(0, +e.target.value) } } })}
                      className="w-10 bg-transparent py-1 text-right text-xs font-black focus:outline-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button onClick={handleSave} className="w-full mt-2 text-sm">Salvar Preferências</Button>
      </DialogContent>
    </Dialog>
  );
}

function CurrencyField({ label, value, onChange, desc }: { label: string; value: number; onChange: (v: number) => void; desc: string }) {
  return (
    <div className="p-2 rounded-lg bg-surface">
      <label className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1 block">{label}</label>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground text-xs">R$</span>
        <input type="number" min={0} step={50} value={value}
          onChange={e => onChange(Math.max(0, +e.target.value))}
          className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
    </div>
  );
}

function ProtoField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="p-2 rounded-lg bg-surface">
      <label className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5 block">{label}</label>
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground text-[10px]">R$</span>
        <input type="number" min={0} step={5} value={value}
          onChange={e => onChange(Math.max(0, +e.target.value))}
          className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>
  );
}
