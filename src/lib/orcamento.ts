export interface EtapaServico {
  id: string;
  nome: string;
  grupo: string;
  ativa: boolean;
  visitas: number;
  horas: number;
}

export const GRUPOS = [
  'Atividades Iniciais',
  'Elaboração de Projeto',
  'Documentação e Regularização',
];

export const ETAPAS_PADRAO: Omit<EtapaServico, 'ativa' | 'visitas' | 'horas'>[] = [
  { id: 'reuniao', nome: 'Reunião Inicial', grupo: GRUPOS[0] },
  { id: 'visita-levantamento', nome: 'Visita Técnica e Levantamento', grupo: GRUPOS[0] },
  { id: 'esboco', nome: 'Estudo Preliminar', grupo: GRUPOS[0] },
  { id: 'levantamento-normas', nome: 'Levantamento de Normas', grupo: GRUPOS[0] },
  { id: 'planta-baixa', nome: 'Projeto Arquitetônico', grupo: GRUPOS[1] },
  { id: 'elevacoes', nome: 'Cortes e Fachadas', grupo: GRUPOS[1] },
  { id: 'planta-situacao', nome: 'Planta de Situação / Cobertura', grupo: GRUPOS[1] },
  { id: 'calculos', nome: 'Cálculos para Aprovação', grupo: GRUPOS[1] },
  { id: 'pranchas', nome: 'Pranchas para Impressão', grupo: GRUPOS[1] },
  { id: 'memorial-descritivo', nome: 'Memorial Descritivo', grupo: GRUPOS[2] },
  { id: 'memorial-normas', nome: 'Memorial de Normas', grupo: GRUPOS[2] },
  { id: 'memorial-fracao', nome: 'Memorial com Fração Ideal', grupo: GRUPOS[2] },
  { id: 'convencao-condominio', nome: 'Convenção de Condomínio', grupo: GRUPOS[2] },
  { id: 'quadro-areas', nome: 'Quadro de Áreas NBR 12721', grupo: GRUPOS[2] },
];

// Custos fixos de protocolo (valores padrão)
export interface CustosProtocolo {
  art: number;
  pasta: number;
  assinatura: number;
  custoVisita: number; // custo por visita/deslocamento
}

export const CUSTOS_PROTOCOLO_PADRAO: CustosProtocolo = {
  art: 115,
  pasta: 50,
  assinatura: 80,
  custoVisita: 150,
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
  custoHora: number,
  custoVisita: number
): number {
  if (!etapa.ativa) return 0;
  const custoHoras = etapa.horas * custoHora;
  const custoVisitas = etapa.visitas * custoVisita;
  return custoHoras + custoVisitas;
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
