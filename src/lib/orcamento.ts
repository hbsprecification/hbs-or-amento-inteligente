export interface EtapaServico {
  id: string;
  nome: string;
  grupo: string;
  ativa: boolean;
  visitas: number;
  horas: number;
}

export const GRUPOS = [
  'CATEGORIA 1: PROJETO PARAMÉTRICO (PREFEITURA)',
  'CATEGORIA 2: REGULARIZAÇÃO FINAL E DOCUMENTOS',
  'CATEGORIA 3: SERVIÇOS DE DESPACHANTE E TRAMITAÇÃO',
];

export const ETAPAS_PADRAO: Omit<EtapaServico, 'ativa' | 'visitas' | 'horas'>[] = [
  // CATEGORIA 1
  { id: 'arq', nome: 'Projeto Arquitetônico', grupo: GRUPOS[0] },
  { id: 'corte-fachada', nome: 'Corte e Fachada', grupo: GRUPOS[0] },
  { id: 'situacao', nome: 'Planta de Situação', grupo: GRUPOS[0] },
  { id: 'calculos', nome: 'Cálculo para Aprovação', grupo: GRUPOS[0] },
  { id: 'pranchas', nome: 'Pranchas para Impressão', grupo: GRUPOS[0] },

  // CATEGORIA 2
  { id: 'memorial-desc', nome: 'Memorial Descritivo', grupo: GRUPOS[1] },
  { id: 'memorial-normas', nome: 'Memorial de Normas', grupo: GRUPOS[1] },
  { id: 'memorial-fracao', nome: 'Memorial com Fração Ideal', grupo: GRUPOS[1] },
  { id: 'convencao', nome: 'Convenção de Condomínio', grupo: GRUPOS[1] },
  { id: 'quadro-areas', nome: 'Quadro de Áreas NBR 12721', grupo: GRUPOS[1] },
  { id: 'habite-se', nome: 'Habite-se', grupo: GRUPOS[1] },
  { id: 'certidao-area', nome: 'Certidão de Área Construída', grupo: GRUPOS[1] },

  // CATEGORIA 3
  { id: 'proto-pref', nome: 'Protocolo e Acompanhamento Prefeitura', grupo: GRUPOS[2] },
  { id: 'proto-cartorio', nome: 'Protocolo e Acompanhamento Cartório', grupo: GRUPOS[2] },
  { id: 'retirada-cert', nome: 'Retirada de Certidões', grupo: GRUPOS[2] },
  { id: 'idas-orgaos', nome: 'Idas a Órgãos Públicos', grupo: GRUPOS[2] },
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
