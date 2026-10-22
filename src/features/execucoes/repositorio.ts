import {
  apagarExecucao,
  atualizarExecucao as gravarAtualizacao,
  donoSemeado,
  inserirExecucao,
  lerExecucoes,
  registrarDono,
} from '@/features/execucoes/bancoLocal';
import { EXECUCOES, INSIGHT_DO_MES, RECEITAS_GUIA } from '@/features/execucoes/fixtures';
import { notificarMudanca } from '@/features/execucoes/versaoDosDados';
import type {
  ChipAvaliacao,
  Execucao,
  MesDeExecucoes,
  Prato,
  RascunhoExecucao,
  ReceitaGuia,
  ResumoMes,
  Usuario,
} from '@/types/dominio';
import {
  formatarDataCurta,
  formatarMes,
  formatarTempo,
  formatarTentativa,
} from '@/utils/formato';

/** Quem é o dono das linhas: o e-mail do usuário autenticado, normalizado. */
export type DonoDosDados = string;

/** Quantas execuções o bloco "continuar de onde parou" mostra. */
const QUANTOS_RECENTES = 2;

export const donoDe = (usuario: Usuario): DonoDosDados => usuario.email.trim().toLowerCase();

// Duas execuções gravadas no mesmo milissegundo empatariam no `ORDER BY`, e o
// desempate do SQLite é arbitrário — a lista trocaria de ordem sem motivo. Um
// contador que só sobe elimina o empate sem precisar de outra coluna.
let ultimoCriadoEm = 0;

function proximoCriadoEm(): number {
  ultimoCriadoEm = Math.max(Date.now(), ultimoCriadoEm + 1);
  return ultimoCriadoEm;
}

/**
 * Prepara o banco para um dono que entra pela primeira vez. Chamada pelo
 * `AuthContext` antes de a sessão valer, para que as telas já encontrem dados.
 * Reentrante: restaurar a sessão não semeia de novo.
 */
export async function garantirDadosDoDono(
  dono: DonoDosDados,
  semearExemplo: boolean,
): Promise<void> {
  if (donoSemeado(dono) !== null) return;

  registrarDono(dono, semearExemplo);
  if (!semearExemplo) return;

  // As execuções vêm da mais recente para a mais antiga, e `criado_em` ordena
  // ao contrário — daí o decremento. O `- 1` garante que qualquer execução
  // criada depois fique acima de todas elas.
  const base = Date.now() - 1;
  EXECUCOES.forEach((execucao, indice) => inserirExecucao(dono, execucao, base - indice));

  notificarMudanca();
}

// A única porta de leitura: todo o resto do arquivo deriva daqui.
async function todas(dono: DonoDosDados): Promise<Execucao[]> {
  return lerExecucoes(dono);
}

/** Uma execução pelo id. `null` quando não existe — o id vem da rota. */
export async function buscarExecucao(id: string, dono: DonoDosDados): Promise<Execucao | null> {
  return (await todas(dono)).find((execucao) => execucao.id === id) ?? null;
}

/** Todas as execuções, da mais recente para a mais antiga. */
export async function listarExecucoes(dono: DonoDosDados): Promise<Execucao[]> {
  return todas(dono);
}

/** As últimas execuções, para "continuar de onde parou". */
export async function listarExecucoesRecentes(dono: DonoDosDados): Promise<Execucao[]> {
  return (await todas(dono)).slice(0, QUANTOS_RECENTES);
}

/** O histórico agrupado por mês, do mais recente ao mais antigo. */
export async function listarHistoricoPorMes(dono: DonoDosDados): Promise<MesDeExecucoes[]> {
  const execucoes = await todas(dono);
  const meses: MesDeExecucoes[] = [];

  for (const execucao of execucoes) {
    const atual = meses[meses.length - 1];
    // Já vêm em ordem inversa: mês novo só começa quando o anterior termina.
    if (atual && atual.rotulo === execucao.mes) atual.execucoes.push(execucao);
    else meses.push({ rotulo: execucao.mes, execucoes: [execucao] });
  }

  return meses;
}

// Derivados das execuções: guardar deixaria a contagem descolar do histórico.
export async function listarPratos(dono: DonoDosDados): Promise<Prato[]> {
  const execucoes = await todas(dono);
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
export async function buscarPrato(id: string, dono: DonoDosDados): Promise<Prato | null> {
  const pratos = await listarPratos(dono);
  return pratos.find((prato) => prato.id === id) ?? null;
}

/** As execuções de um prato, da mais recente para a mais antiga. */
export async function listarExecucoesDoPrato(
  pratoId: string,
  dono: DonoDosDados,
): Promise<Execucao[]> {
  return (await todas(dono)).filter((execucao) => execucao.pratoId === pratoId);
}

/** As receitas-guia importadas pelo usuário. */
export async function listarReceitasGuia(dono: DonoDosDados): Promise<ReceitaGuia[]> {
  // Importar receita-guia é de etapa posterior, e sem fluxo de criação uma
  // tabela própria seria peso morto: só o conjunto de exemplo as tem.
  return donoSemeado(dono) ? RECEITAS_GUIA : [];
}

// Os números são contados, nunca escritos. Só a frase vem de fora.
export async function obterResumoDoMes(dono: DonoDosDados): Promise<ResumoMes> {
  const execucoes = await todas(dono);
  // O mês corrente é o da execução mais recente — as linhas já vêm em ordem.
  const mesCorrente = execucoes[0]?.mes ?? '';
  const doMes = execucoes.filter((execucao) => execucao.mes === mesCorrente);
  const soma = doMes.reduce((total, execucao) => total + execucao.nota, 0);

  return {
    periodo: mesCorrente ? `${mesCorrente.split(' de ')[0]} até aqui` : 'este mês',
    execucoes: doMes.length,
    notaMedia: doMes.length ? soma / doMes.length : 0,
    insight: insightDoMes(dono, doMes),
  };
}

// Sem `tempoTotal`: somar "1h05" pede um campo em minutos que só vem com o banco.
export async function obterEstatisticas(dono: DonoDosDados): Promise<{
  execucoes: number;
  pratos: number;
  notaMedia: number;
  custoTotal: number;
}> {
  const execucoes = await todas(dono);
  const soma = execucoes.reduce((total, execucao) => total + execucao.nota, 0);

  return {
    execucoes: execucoes.length,
    pratos: new Set(execucoes.map((execucao) => execucao.pratoId)).size,
    notaMedia: execucoes.length ? soma / execucoes.length : 0,
    custoTotal: execucoes.reduce((total, execucao) => total + execucao.custo, 0),
  };
}

/** Cria uma execução a partir do rascunho da ficha, e devolve o que gravou. */
export async function criarExecucao(
  dono: DonoDosDados,
  rascunho: RascunhoExecucao,
): Promise<Execucao> {
  const execucoes = await todas(dono);
  const nome = rascunho.prato.trim();
  const mesmoPrato = execucoes.filter(
    (execucao) => normalizar(execucao.prato) === normalizar(nome),
  );
  const agora = new Date();

  const execucao: Execucao = {
    id: novoId('e'),
    // Nome já registrado reaproveita o prato: é isso que numera a tentativa e
    // faz a tira de evolução crescer em vez de começar de novo.
    pratoId: mesmoPrato[0]?.pratoId ?? novoId('p'),
    prato: nome,
    mes: formatarMes(agora),
    tentativa: formatarTentativa(mesmoPrato.length + 1),
    data: formatarDataCurta(agora),
    tempo: formatarTempo(rascunho.tempoMinutos),
    custo: rascunho.custo,
    nota: rascunho.nota,
    chips: chipsDe(rascunho),
  };

  inserirExecucao(dono, execucao, proximoCriadoEm());
  notificarMudanca();
  return execucao;
}

/**
 * Altera o que a edição permite mexer. O prato fica fora de propósito: trocá-lo
 * moveria a execução de série e renumeraria duas sequências de tentativas, o
 * que é transação de servidor. `null` quando o id não existe.
 */
export async function atualizarExecucao(
  dono: DonoDosDados,
  id: string,
  rascunho: Omit<RascunhoExecucao, 'prato'>,
): Promise<Execucao | null> {
  const atual = await buscarExecucao(id, dono);
  if (!atual) return null;

  const execucao: Execucao = {
    ...atual,
    tempo: formatarTempo(rascunho.tempoMinutos),
    custo: rascunho.custo,
    nota: rascunho.nota,
    chips: chipsDe(rascunho),
  };

  gravarAtualizacao(dono, execucao);
  notificarMudanca();
  return execucao;
}

/** Apaga a execução. Id desconhecido não é erro: a lista já não o tem. */
export async function removerExecucao(dono: DonoDosDados, id: string): Promise<void> {
  apagarExecucao(dono, id);
  notificarMudanca();
}

// Único o bastante para um banco de um aparelho só; no servidor quem gera é o
// Postgres. O prefixo mantém a leitura dos ids igual à dos dados de exemplo.
const novoId = (prefixo: string): string =>
  `${prefixo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// Nome de prato compara sem acento nem caixa: "Bolo de cenoura" e "bolo de
// cenoura" são o mesmo prato, e precisam cair na mesma série de tentativas.
const normalizar = (texto: string): string =>
  texto.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function chipsDe(rascunho: Pick<RascunhoExecucao, 'qualidade' | 'defeito'>): ChipAvaliacao[] {
  const chips: ChipAvaliacao[] = [];
  const qualidade = rascunho.qualidade?.trim();
  const defeito = rascunho.defeito?.trim();

  if (qualidade) chips.push({ texto: qualidade, tipo: 'qualidade' });
  if (defeito) chips.push({ texto: defeito, tipo: 'defeito' });

  return chips;
}

// A frase do conjunto de exemplo é escrita; a de um histórico real é derivada
// do defeito que mais volta. Quem interpreta o fato é a etapa da análise — aqui
// ele já sai pronto dos dados, como manda a regra de produto.
function insightDoMes(dono: DonoDosDados, doMes: Execucao[]): ResumoMes['insight'] {
  if (donoSemeado(dono)) return INSIGHT_DO_MES;

  const defeito = defeitoQueMaisVolta(doMes);
  if (!defeito) {
    return { antes: 'ainda não há um defeito que se repita neste mês.', destaque: '', depois: '' };
  }

  return { antes: 'o defeito que mais volta neste mês é ', destaque: defeito, depois: '.' };
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
