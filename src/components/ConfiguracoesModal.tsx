import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CUSTOS_FIXOS_PADRAO,
  CUSTOS_VARIAVEIS_PADRAO,
  INVESTIMENTOS_PADRAO,
  HORAS_PRODUTIVAS_PADRAO,
  calcularCustoHora,
  formatBRL,
} from "@/lib/orcamento";

const STORAGE_KEY = "hbs-config";

export interface ConfigData {
  custosFixos: number;
  custosVariaveis: number;
  investimentos: number;
  horasProdutivas: number;
}

export function loadConfig(): ConfigData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    custosFixos: CUSTOS_FIXOS_PADRAO,
    custosVariaveis: CUSTOS_VARIAVEIS_PADRAO,
    investimentos: INVESTIMENTOS_PADRAO,
    horasProdutivas: HORAS_PRODUTIVAS_PADRAO,
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
  const [local, setLocal] = useState<ConfigData>(config);

  useEffect(() => {
    setLocal(config);
  }, [config]);

  const total = local.custosFixos + local.custosVariaveis + local.investimentos;
  const custoHora = calcularCustoHora(total, local.horasProdutivas);

  const handleSave = () => {
    saveConfig(local);
    onSave(local);
    setOpen(false);
  };

  const field = (label: string, value: number, key: keyof ConfigData, desc: string) => (
    <div className="p-3 rounded-lg bg-surface">
      <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">{label}</label>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">R$</span>
        <input
          type="number" min={0} step={50} value={value}
          onChange={e => setLocal({ ...local, [key]: Math.max(0, +e.target.value) })}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <p className="text-[11px] text-muted-foreground mt-1">{desc}</p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Configurações de Custos
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Defina seus custos operacionais mensais. Os valores são salvos automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {field("Custos Fixos", local.custosFixos, "custosFixos", "Soma das contas que não mudam (Aluguel, Internet, Condomínio, Softwares).")}
          {field("Custos Variáveis", local.custosVariaveis, "custosVariaveis", "Despesas que oscilam conforme o volume de obras (Combustível, Impressões, Taxas de Cartório).")}
          {field("Investimentos", local.investimentos, "investimentos", "Verba para crescimento (Anúncios no Instagram, Cursos, Equipamentos novos).")}

          <div className="p-3 rounded-lg bg-surface">
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Horas Produtivas/Mês</label>
            <input
              type="number" min={1} step={1} value={local.horasProdutivas}
              onChange={e => setLocal({ ...local, horasProdutivas: Math.max(1, +e.target.value) })}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-[11px] text-muted-foreground mt-1">Total de horas reais que você dedica a serviços técnicos (Recomendado: 74h a 100h para ser realista).</p>
          </div>

          <div className="p-4 rounded-xl gradient-primary glow-primary text-center">
            <p className="text-xs text-primary-foreground/70 uppercase tracking-wide mb-0.5">Custo Operacional Total</p>
            <p className="text-xl font-extrabold text-primary-foreground">{formatBRL(total)}</p>
            <div className="w-12 h-px bg-primary-foreground/20 mx-auto my-2" />
            <p className="text-xs text-primary-foreground/70 uppercase tracking-wide mb-0.5">Custo por Hora</p>
            <p className="text-2xl font-extrabold text-primary-foreground">{formatBRL(custoHora)}</p>
            <p className="text-[10px] text-primary-foreground/60 mt-1.5 max-w-[280px] mx-auto leading-relaxed">Este é o custo mínimo que sua hora de trabalho deve cobrir para o escritório não ter prejuízo.</p>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full mt-2">
          Salvar Configurações
        </Button>
      </DialogContent>
    </Dialog>
  );
}
