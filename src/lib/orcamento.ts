export interface EtapaServico {
  id: string;
  nome: string;
  grupo: string;
  ativa: boolean;
  visitas: number;
  horas: number;
  custoFixo: number;
}

export const GRUPOS = [
  'Atividades Iniciais (Visitas e Proposta)',
  'Elaboração do Projeto Paramétrico para Aprovação',
  'Documentação e Regularização',
  'Custos Diversos',
];

export const ETAPAS_PADRAO: Omit<EtapaServico, 'ativa' | 'visitas' | 'horas' | 'custoFixo'>[] = [
  // Grupo 1 - Atividades Iniciais
  { id: 'reuniao', nome: 'Reunião Inicial', grupo: GRUPOS[0] },
  { id: 'elaboracao-proposta', nome: 'Elaboração da Proposta', grupo: GRUPOS[0] },
  { id: 'visita-levantamento', nome: 'Visita Técnica e Levantamento', grupo: GRUPOS[0] },
  { id: 'esboco', nome: 'Esboço / Estudo Preliminar', grupo: GRUPOS[0] },
  { id: 'levantamento-normas', nome: 'Levantamento de Normas', grupo: GRUPOS[0] },
  // Grupo 2 - Elaboração do Projeto
  { id: 'planta-baixa', nome: 'Projeto Arquitetônico (planta baixa)', grupo: GRUPOS[1] },
  { id: 'elevacoes', nome: 'Elevações (corte e fachada)', grupo: GRUPOS[1] },
  { id: 'planta-situacao', nome: 'Planta de Situação (Cobertura)', grupo: GRUPOS[1] },
  { id: 'calculos', nome: 'Cálculos para Aprovação', grupo: GRUPOS[1] },
  { id: 'pranchas', nome: 'Pranchas para Impressão', grupo: GRUPOS[1] },
  { id: 'memorial-normas', nome: 'Memorial de Atendimento às Normas', grupo: GRUPOS[1] },
  // Grupo 3 - Documentação e Regularização
  { id: 'memorial-descritivo', nome: 'Memorial Descritivo', grupo: GRUPOS[2] },
  { id: 'memorial-fracao', nome: 'Memorial com Fração Ideal', grupo: GRUPOS[2] },
  { id: 'convencao-condominio', nome: 'Instituição e Convenção de Condomínio', grupo: GRUPOS[2] },
  { id: 'quadro-areas', nome: 'Quadro de Áreas NBR 12721', grupo: GRUPOS[2] },
  { id: 'protocolo-cartorio', nome: 'Protocolo Cartório', grupo: GRUPOS[2] },
  { id: 'protocolo-prefeitura', nome: 'Protocolo Prefeitura', grupo: GRUPOS[2] },
  // Grupo 4 - Custos Diversos
  { id: 'assinatura', nome: 'Assinatura do Projeto', grupo: GRUPOS[3] },
  { id: 'pasta-prefeitura', nome: 'Pasta Projeto Prefeitura', grupo: GRUPOS[3] },
  { id: 'visitas-tecnicas', nome: 'Visitas Técnicas', grupo: GRUPOS[3] },
  { id: 'art', nome: 'Anotação de Responsabilidade Técnica (ART/RRT)', grupo: GRUPOS[3] },
];

// Custos Operacionais padrão
export const CUSTOS_FIXOS_PADRAO = 775.0;
export const CUSTOS_VARIAVEIS_PADRAO = 1170.0;
export const INVESTIMENTOS_PADRAO = 700.0;
export const CUSTO_OPERACIONAL_TOTAL = CUSTOS_FIXOS_PADRAO + CUSTOS_VARIAVEIS_PADRAO + INVESTIMENTOS_PADRAO;

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
  // Comissão é abatida do valor final (paga ao parceiro)
  const comissao = subtotal * (comissaoPercent / 100);
  const precoVenda = subtotal + comissao; // Preço cobrado do cliente inclui a comissão
  const valorLiquidoAposComissao = subtotal; // O que fica para a empresa
  const margem = precoVenda > 0 ? ((precoVenda - custoExecucao) / precoVenda) * 100 : 0;
  return { precoVenda, lucro, imposto, comissao, valorLiquidoAposComissao, margem };
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
