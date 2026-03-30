export interface EtapaServico {
  id: string;
  nome: string;
  grupo: string;
  ativa: boolean;
  visitas: number;
  horas: number;
  custoFixo: number; // custo fixo adicional por etapa (ex: ART, pasta prefeitura)
}

export const GRUPOS = [
  'Atividades Iniciais (Visitas e Proposta)',
  'Elaboração do Projeto Paramétrico para Aprovação',
  'Custos Diversos',
];

export const ETAPAS_PADRAO: Omit<EtapaServico, 'ativa' | 'visitas' | 'horas' | 'custoFixo'>[] = [
  // Grupo 1 - Atividades Iniciais
  { id: 'reuniao', nome: 'Reunião Inicial', grupo: GRUPOS[0] },
  { id: 'elaboracao-proposta', nome: 'Elaboração da Proposta', grupo: GRUPOS[0] },
  { id: 'visita-levantamento', nome: 'Visita Técnica e Levantamento', grupo: GRUPOS[0] },
  { id: 'esboco', nome: 'Esboço do Projeto', grupo: GRUPOS[0] },
  { id: 'levantamento-normas', nome: 'Levantamento de Normas', grupo: GRUPOS[0] },
  // Grupo 2 - Elaboração do Projeto
  { id: 'planta-baixa', nome: 'Projeto Arquitetônico (planta baixa)', grupo: GRUPOS[1] },
  { id: 'elevacoes', nome: 'Elevações (corte e fachada)', grupo: GRUPOS[1] },
  { id: 'planta-situacao', nome: 'Planta de Situação (Cobertura)', grupo: GRUPOS[1] },
  { id: 'calculos', nome: 'Cálculos para Aprovação', grupo: GRUPOS[1] },
  { id: 'pranchas', nome: 'Pranchas para Impressão', grupo: GRUPOS[1] },
  // Grupo 3 - Custos Diversos
  { id: 'assinatura', nome: 'Assinatura do Projeto', grupo: GRUPOS[2] },
  { id: 'pasta-prefeitura', nome: 'Pasta Projeto Prefeitura', grupo: GRUPOS[2] },
  { id: 'visitas-tecnicas', nome: 'Visitas Técnicas', grupo: GRUPOS[2] },
  { id: 'art', nome: 'Anotação de Responsabilidade Técnica', grupo: GRUPOS[2] },
];

// Custos Operacionais padrão
export const CUSTOS_FIXOS_PADRAO = 775.0;
export const CUSTOS_VARIAVEIS_PADRAO = 1170.0;
export const INVESTIMENTOS_PADRAO = 700.0;
export const CUSTO_OPERACIONAL_TOTAL = CUSTOS_FIXOS_PADRAO + CUSTOS_VARIAVEIS_PADRAO + INVESTIMENTOS_PADRAO; // 2645

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
  const horasTotais = etapa.horas + etapa.visitas * 8;
  return horasTotais * custoHora + etapa.custoFixo;
}

export function calcularPrecoFinal(
  custoExecucao: number,
  lucroPercent: number,
  impostosPercent: number,
  comissaoPercent: number
) {
  const lucro = custoExecucao * (lucroPercent / 100);
  const imposto = custoExecucao * (impostosPercent / 100);
  const subtotal = custoExecucao + lucro + imposto;
  const comissao = subtotal * (comissaoPercent / 100);
  const precoVenda = subtotal;
  const valorLiquidoAposComissao = subtotal - comissao;
  const margem = precoVenda > 0 ? ((precoVenda - custoExecucao) / precoVenda) * 100 : 0;
  return { precoVenda, lucro, imposto, comissao, valorLiquidoAposComissao, margem };
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
