export interface EtapaServico {
  id: string;
  nome: string;
  descricao: string;
  ativa: boolean;
  visitas: number;
  horas: number;
}

export const ETAPAS_PADRAO: Omit<EtapaServico, 'ativa' | 'visitas' | 'horas'>[] = [
  { 
    id: 'projeto-paramétrico', 
    nome: 'PROJETO PARAMÉTRICO', 
    descricao: 'Arquitetônico, Cortes, Fachadas e Pranchas' 
  },
  { 
    id: 'condominio-nbr', 
    nome: 'CONDOMÍNIO E NBR', 
    descricao: 'Memorial de Fração Ideal, Convenção e Quadro de Áreas' 
  },
  { 
    id: 'regularizacao-doc', 
    nome: 'REGULARIZAÇÃO DOCUMENTAL', 
    descricao: 'Memorial Descritivo, Habite-se e Certidões' 
  },
  { 
    id: 'gestao-tramite', 
    nome: 'GESTÃO DE TRÂMITE', 
    descricao: 'Protocolos e idas a órgãos públicos' 
  },
];

// Custos fixos de protocolo (valores padrão)
export interface CustosProtocolo {
  art: number;
  pasta: number;
  assinatura: number;
}

export const CUSTOS_PROTOCOLO_PADRAO: CustosProtocolo = {
  art: 115,
  pasta: 50,
  assinatura: 80,
};

export interface ProtocolosSelecionados {
  art: boolean;
  pasta: boolean;
  assinatura: boolean;
}

// Custos Operacionais padrão
export const CUSTOS_FIXOS_PADRAO = 775.0;
export const CUSTOS_VARIAVEIS_PADRAO = 1170.0;
export const INVESTIMENTOS_PADRAO = 700.0;
export const HORAS_PRODUTIVAS_PADRAO = 74;

export function calcularCustoHora(custoOperacional: number, horasProdutivas: number): number {
  if (horasProdutivas <= 0) return 0;
  return custoOperacional / horasProdutivas;
}

export function calcularCustoEtapa(
  etapa: EtapaServico,
  custoHora: number
): number {
  if (!etapa.ativa) return 0;
  // Cada visita representa 8 horas de dedicação técnica (1 dia de trabalho)
  const totalHoras = (etapa.visitas * 8) + etapa.horas;
  return totalHoras * custoHora;
}

export function calcularTotalHoras(etapas: EtapaServico[]): number {
  return etapas
    .filter(e => e.ativa)
    .reduce((acc, e) => acc + (e.visitas * 8) + e.horas, 0);
}

export function calcularTotalProtocolos(
  protocolos: ProtocolosSelecionados,
  custosProtocolo: CustosProtocolo
): number {
  let total = 0;
  if (protocolos.art) total += custosProtocolo.art;
  if (protocolos.pasta) total += custosProtocolo.pasta;
  if (protocolos.assinatura) total += custosProtocolo.assinatura;
  return total;
}

export function calcularPrecoFinal(
  custoTecnico: number,
  custoProtocolos: number,
  lucroPercent: number,
  impostosPercent: number,
  comissaoPercent: number
) {
  const custoTotal = custoTecnico + custoProtocolos;
  const lucro = custoTotal * (lucroPercent / 100);
  const imposto = custoTotal * (impostosPercent / 100);
  const subtotal = custoTotal + lucro + imposto;
  const comissao = subtotal * (comissaoPercent / 100);
  const precoVenda = subtotal + comissao;
  const valorLiquido = subtotal;
  const margem = precoVenda > 0 ? ((precoVenda - custoTotal) / precoVenda) * 100 : 0;
  return { precoVenda, custoTotal, lucro, imposto, comissao, valorLiquido, margem };
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
