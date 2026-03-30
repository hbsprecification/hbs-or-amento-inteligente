export interface EtapaServico {
  id: string;
  nome: string;
  ativa: boolean;
  horasEstimadas: number;
  visitasEstimadas: number;
}

export const ETAPAS_PADRAO: Omit<EtapaServico, 'ativa' | 'horasEstimadas' | 'visitasEstimadas'>[] = [
  { id: 'levantamento', nome: 'Levantamento Cadastral' },
  { id: 'desenho', nome: 'Desenho de Planta' },
  { id: 'memorial', nome: 'Memorial Descritivo' },
  { id: 'art', nome: 'ART / RRT' },
  { id: 'protocolo', nome: 'Protocolo na Prefeitura' },
  { id: 'acompanhamento', nome: 'Acompanhamento de Processo' },
  { id: 'vistoria', nome: 'Vistoria Técnica' },
  { id: 'laudo', nome: 'Laudo Técnico' },
  { id: 'regularizacao', nome: 'Regularização de Imóvel' },
  { id: 'habite-se', nome: 'Habite-se' },
];

export const CUSTO_OPERACIONAL_MENSAL = 2645.0;
export const DIAS_UTEIS = 22;
export const HORAS_DIA = 8;
export const CUSTO_HORA_OPERACIONAL = +(CUSTO_OPERACIONAL_MENSAL / (DIAS_UTEIS * HORAS_DIA)).toFixed(2); // 15.03

export function calcularCustoEtapa(
  etapa: EtapaServico,
  custoHoraTotal: number
): number {
  if (!etapa.ativa) return 0;
  const horasTotais = etapa.horasEstimadas + etapa.visitasEstimadas * HORAS_DIA;
  return horasTotais * custoHoraTotal;
}

export function calcularPrecoFinal(
  custoExecucao: number,
  markupPercent: number,
  impostosPercent: number
) {
  const precoVenda = custoExecucao * (1 + markupPercent / 100) * (1 + impostosPercent / 100);
  const lucroLiquido = precoVenda - custoExecucao - custoExecucao * (impostosPercent / 100);
  const margem = precoVenda > 0 ? ((precoVenda - custoExecucao) / precoVenda) * 100 : 0;
  return { precoVenda, lucroLiquido, margem };
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
