/** Chip de avaliação. O tipo determina a cor — nunca escolha a cor na tela. */
export type TipoChip = 'qualidade' | 'defeito';

export type ChipAvaliacao = {
  texto: string;
  tipo: TipoChip;
};

/** Uma execução: uma vez que o usuário cozinhou algo. */
export type Execucao = {
  id: string;
  /** Prato ao qual a execução pertence. Liga a ficha à tela do prato. */
  pratoId: string;
  /** Nome do prato ao qual a execução pertence. */
  prato: string;
  /**
   * Mês em que aconteceu: "agosto de 2026".
   *
   * Guardado junto da execução, e não derivado da data, porque `data` é texto
   * curto já formatado ("19 ago") e não carrega o ano. Quando a etapa 04
   * trouxer data real do banco, este campo vira uma coluna derivada e as
   * telas continuam iguais.
   */
  mes: string;
  /** Número da tentativa dentro do prato, com dois dígitos: "04". */
  tentativa: string;
  /** Data curta no padrão brasileiro: "19 ago". */
  data: string;
  /** Tempo gasto já formatado: "1h05", "55 min". */
  tempo: string;
  /** Custo total em reais. Formate com `formatarMoeda` na hora de exibir. */
  custo: number;
  /** Nota de 0 a 5. Formate com `formatarNota` na hora de exibir. */
  nota: number;
  chips: ChipAvaliacao[];
};

/**
 * Um prato: o agrupador de execuções da mesma receita.
 *
 * É o que responde à segunda pergunta do produto — "estou melhorando?" —, e
 * por isso carrega a sequência de notas, e não só a média: a média esconde
 * justamente a evolução que o app existe para mostrar.
 */
export type Prato = {
  id: string;
  nome: string;
  /** Quantas vezes o usuário já fez este prato. */
  tentativas: number;
  /** Média das notas, de 0 a 5. */
  notaMedia: number;
  /** As notas em ordem cronológica, da primeira tentativa à última. */
  evolucao: number[];
  /** Data curta da última vez: "19 ago". */
  ultimaVez: string;
  /** O defeito que mais se repete neste prato, se houver. */
  defeitoRecorrente?: string;
};

/**
 * Um mês do histórico, com as execuções daquele período.
 *
 * O histórico é cronológico e agrupado por mês porque é assim que a memória
 * de quem cozinha funciona — "em julho eu tentei três vezes" —, e porque é o
 * recorte que deixa a evolução visível sem precisar de gráfico.
 */
export type MesDeExecucoes = {
  /** Rótulo do período: "agosto de 2026". */
  rotulo: string;
  execucoes: Execucao[];
};

/** Receita de referência importada de fora (link, PDF, foto). */
export type ReceitaGuia = {
  id: string;
  nome: string;
  /** Tempo estimado da receita: "1h", "45 min". */
  tempo: string;
  /** De onde veio: "panelinha", "youtube", "pdf". */
  fonte: string;
};

/** Resumo do mês exibido no cartão escuro da tela de início. */
export type ResumoMes = {
  /** Rótulo do período: "agosto até aqui". */
  periodo: string;
  execucoes: number;
  notaMedia: number;
  /** Frase de destaque. `destaque` é grifado em vinho sobre o fundo escuro. */
  insight: { antes: string; destaque: string; depois: string };
};

/** Usuário autenticado. Nesta etapa vem do mock em `features/auth`. */
export type Usuario = {
  nome: string;
  email: string;
  /** Iniciais para o avatar: "MS". */
  iniciais: string;
  /** "cozinhando desde abril de 2026" */
  desde: string;
  totalExecucoes: number;
};
