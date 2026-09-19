import {
  EXECUCOES,
  EXECUCOES_RECENTES,
  RECEITAS_GUIA,
  RESUMO_AGOSTO,
} from '@/features/execucoes/fixtures';
import type { Execucao, ReceitaGuia, ResumoMes } from '@/types/dominio';

/** Uma execução pelo id. `null` quando não existe — o id vem da rota. */
export async function buscarExecucao(id: string): Promise<Execucao | null> {
  return EXECUCOES.find((execucao) => execucao.id === id) ?? null;
}

/** Todas as execuções, da mais recente para a mais antiga. */
export async function listarExecucoes(): Promise<Execucao[]> {
  return EXECUCOES;
}

/** As últimas execuções, para "continuar de onde parou". */
export async function listarExecucoesRecentes(): Promise<Execucao[]> {
  return EXECUCOES_RECENTES;
}

/** As receitas-guia importadas pelo usuário. */
export async function listarReceitasGuia(): Promise<ReceitaGuia[]> {
  return RECEITAS_GUIA;
}

/** O resumo do mês corrente, para o cartão escuro da tela de início. */
export async function obterResumoDoMes(): Promise<ResumoMes> {
  return RESUMO_AGOSTO;
}
