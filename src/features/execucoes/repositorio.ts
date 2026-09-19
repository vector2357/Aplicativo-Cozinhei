import {
  EXECUCOES,
  EXECUCOES_RECENTES,
  INSIGHT_DO_MES,
  MES_CORRENTE,
  RECEITAS_GUIA,
} from '@/features/execucoes/fixtures';
import type {
  Execucao,
  MesDeExecucoes,
  Prato,
  ReceitaGuia,
  ResumoMes,
} from '@/types/dominio';

/**
 * Conta que ainda não cozinhou nada.
 *
 * As telas pedem os dados pelo `dono`, e não por um booleano de "tem dados":
 * é o mesmo lugar onde a etapa 04 vai passar o id do usuário autenticado.
 */
export type DonoDosDados = 'exemplo' | 'conta-nova';

const vazio = <T,>(dono: DonoDosDados, dados: T[]): T[] =>
  dono === 'conta-nova' ? [] : dados;

/**
 * Uma execução pelo id. `null` quando não existe — o id vem da rota.
 *
 * Recebe o dono como todas as outras: sem isso, uma conta que não tem
 * execução nenhuma abriria a ficha de outra pessoa por link direto.
 */
export async function buscarExecucao(
  id: string,
  dono: DonoDosDados = 'exemplo',
): Promise<Execucao | null> {
  return vazio(dono, EXECUCOES).find((execucao) => execucao.id === id) ?? null;
}

/** Todas as execuções, da mais recente para a mais antiga. */
export async function listarExecucoes(dono: DonoDosDados = 'exemplo'): Promise<Execucao[]> {
  return vazio(dono, EXECUCOES);
}

/** As últimas execuções, para "continuar de onde parou". */
export async function listarExecucoesRecentes(
  dono: DonoDosDados = 'exemplo',
): Promise<Execucao[]> {
  return vazio(dono, EXECUCOES_RECENTES);
}

/**
 * O histórico agrupado por mês, do mês mais recente ao mais antigo.
 *
 * O agrupamento acontece aqui, e não na tela, porque é regra de domínio: na
 * etapa 04 isto vira um `GROUP BY` e a tela continua recebendo a mesma forma.
 */
export async function listarHistoricoPorMes(
  dono: DonoDosDados = 'exemplo',
): Promise<MesDeExecucoes[]> {
  const execucoes = vazio(dono, EXECUCOES);
  const meses: MesDeExecucoes[] = [];

  for (const execucao of execucoes) {
    const atual = meses[meses.length - 1];
    // As execuções já vêm em ordem cronológica inversa, então um mês novo só
    // aparece quando o anterior termina — não é preciso ordenar de novo.
    if (atual && atual.rotulo === execucao.mes) atual.execucoes.push(execucao);
    else meses.push({ rotulo: execucao.mes, execucoes: [execucao] });
  }

  return meses;
}

/**
 * Os pratos do usuário, derivados das execuções.
 *
 * Derivar em vez de guardar evita a inconsistência clássica: a lista de
 * pratos dizendo "3 tentativas" enquanto o histórico mostra 4. Na etapa 04
 * isto vira uma view no banco, pela mesma razão.
 *
 * Ordem: quem foi feito mais vezes primeiro — é o que o usuário está
 * repetindo, e repetir é o que o produto acompanha. Empate desempata pela
 * execução mais recente.
 */
export async function listarPratos(dono: DonoDosDados = 'exemplo'): Promise<Prato[]> {
  const execucoes = vazio(dono, EXECUCOES);
  const porPrato = new Map<string, Execucao[]>();

  for (const execucao of execucoes) {
    const lista = porPrato.get(execucao.pratoId);
    if (lista) lista.push(execucao);
    else porPrato.set(execucao.pratoId, [execucao]);
  }

  const pratos: Prato[] = [];
  for (const [id, daquelePrato] of porPrato) {
    // Vêm da mais recente para a mais antiga; a evolução é o contrário.
    const cronologicas = [...daquelePrato].reverse();
    const notas = cronologicas.map((execucao) => execucao.nota);

    pratos.push({
      id,
      nome: daquelePrato[0].prato,
      tentativas: daquelePrato.length,
      notaMedia: notas.reduce((soma, nota) => soma + nota, 0) / notas.length,
      evolucao: notas,
      ultimaVez: daquelePrato[0].data,
      defeitoRecorrente: defeitoQueMaisVolta(daquelePrato),
    });
  }

  return pratos.sort((a, b) => b.tentativas - a.tentativas);
}

/** Um prato pelo id, com a tira de evolução montada. `null` se não existir. */
export async function buscarPrato(id: string, dono: DonoDosDados = 'exemplo'): Promise<Prato | null> {
  const pratos = await listarPratos(dono);
  return pratos.find((prato) => prato.id === id) ?? null;
}

/** As execuções de um prato, da mais recente para a mais antiga. */
export async function listarExecucoesDoPrato(
  pratoId: string,
  dono: DonoDosDados = 'exemplo',
): Promise<Execucao[]> {
  return vazio(dono, EXECUCOES).filter((execucao) => execucao.pratoId === pratoId);
}

/** As receitas-guia importadas pelo usuário. */
export async function listarReceitasGuia(
  dono: DonoDosDados = 'exemplo',
): Promise<ReceitaGuia[]> {
  return vazio(dono, RECEITAS_GUIA);
}

/**
 * O resumo do mês corrente, contado a partir das execuções.
 *
 * Os números são calculados, nunca escritos à mão: número escrito descola dos
 * dados na primeira vez que alguém mexe na lista, e aí o cartão do mês passa
 * a mentir. A frase de destaque continua vindo de fora, porque é texto de
 * interpretação — na etapa 04, do módulo de IA.
 */
export async function obterResumoDoMes(dono: DonoDosDados = 'exemplo'): Promise<ResumoMes> {
  const doMes = vazio(dono, EXECUCOES).filter((execucao) => execucao.mes === MES_CORRENTE);
  const soma = doMes.reduce((total, execucao) => total + execucao.nota, 0);

  return {
    periodo: `${MES_CORRENTE.split(' de ')[0]} até aqui`,
    execucoes: doMes.length,
    notaMedia: doMes.length ? soma / doMes.length : 0,
    insight: INSIGHT_DO_MES,
  };
}

/**
 * Estatísticas gerais, para a tela de perfil.
 *
 * `custoTotal` e `tempoTotal` ficam de fora por enquanto: o tempo é texto
 * formatado ("1h05"), e somar texto exigiria um campo em minutos que os
 * fixtures ainda não têm. Entra junto com o banco, que guarda número.
 */
export async function obterEstatisticas(dono: DonoDosDados = 'exemplo'): Promise<{
  execucoes: number;
  pratos: number;
  notaMedia: number;
  custoTotal: number;
}> {
  const execucoes = vazio(dono, EXECUCOES);
  const soma = execucoes.reduce((total, execucao) => total + execucao.nota, 0);

  return {
    execucoes: execucoes.length,
    pratos: new Set(execucoes.map((execucao) => execucao.pratoId)).size,
    notaMedia: execucoes.length ? soma / execucoes.length : 0,
    custoTotal: execucoes.reduce((total, execucao) => total + execucao.custo, 0),
  };
}

/** O defeito que mais aparece num conjunto de execuções, se algum repetir. */
function defeitoQueMaisVolta(execucoes: Execucao[]): string | undefined {
  const contagem = new Map<string, number>();

  for (const execucao of execucoes) {
    for (const chip of execucao.chips) {
      if (chip.tipo !== 'defeito') continue;
      contagem.set(chip.texto, (contagem.get(chip.texto) ?? 0) + 1);
    }
  }

  let campeao: string | undefined;
  let vezes = 1; // aparecer uma vez só não é recorrência
  for (const [texto, quantas] of contagem) {
    if (quantas > vezes) {
      campeao = texto;
      vezes = quantas;
    }
  }

  return campeao;
}
