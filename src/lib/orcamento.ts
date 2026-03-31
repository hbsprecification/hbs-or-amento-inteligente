export interface EtapaServico {
  id: string;
  nome: string;
  grupo: string;
  ativa: boolean;
  visitas: number;
  horas: number;
}

export const GRUPOS = [
  'Módulo Projeto',
  'Módulo Documental',
  'Módulo Jurídico',
  'Módulo Trâmite',
];

export const ETAPAS_PADRAO: Omit<EtapaServico, 'ativa' | 'visitas' | 'horas'>[] = [
  // Módulo Projeto
  { id: 'levantamento', nome: 'Levantamento Cadastral', grupo: GRUPOS[0] },
  { id: 'arq', nome: 'Elaboração de Projeto Legal (Plantas, Cortes e Fachadas)', grupo: GRUPOS[0] },
  { id: 'cortes-fachadas', nome: 'Cortes e Fachadas (Aprovação)', grupo: GRUPOS[0] },
  { id: 'situacao', nome: 'Planta de Situação', grupo: GRUPOS[0] },
  { id: 'calculos', nome: 'Cálculo para Aprovação', grupo: GRUPOS[0] },
  { id: 'pranchas', nome: 'Pranchas para Impressão', grupo: GRUPOS[0] },

  // Módulo Documental
  { id: 'fracao-ideal', nome: 'Memorial Descritivo + Fração Ideal', grupo: GRUPOS[1] },

  // Módulo Jurídico
  { id: 'inst-convencao', nome: 'Instituição e Convenção de Condomínio', grupo: GRUPOS[2] },
  { id: 'nbr12721', nome: 'Quadro de Áreas NBR 12721', grupo: GRUPOS[2] },

  // Módulo Trâmite
  { id: 'certidao-tributos', nome: 'Certidão de Área Construída (Tributos)', grupo: GRUPOS[3] },
  { id: 'protocolos', nome: 'Protocolos em Órgãos', grupo: GRUPOS[3] },
  { id: 'acompanhamento', nome: 'Acompanhamento do Processo', grupo: GRUPOS[3] },
];

export interface TemposPadrao {
  [id: string]: { v: number; h: number };
}

export const TEMPOS_PADRAO_INICIAIS: TemposPadrao = {
  'levantamento': { v: 1, h: 0 },
  'arq': { v: 0, h: 16 },
  'cortes-fachadas': { v: 0, h: 8 },
  'situacao': { v: 0, h: 4 },
  'calculos': { v: 0, h: 4 },
  'pranchas': { v: 0, h: 2 },
  'fracao-ideal': { v: 0, h: 6 },
  'inst-convencao': { v: 0, h: 12 },
  'certidao-tributos': { v: 0, h: 4 },
  'protocolos': { v: 1, h: 0 },
  'acompanhamento': { v: 1, h: 0 }
};

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
