/** Chip de avaliação. O tipo determina a cor — nunca escolha a cor na tela. */
export type TipoChip = 'qualidade' | 'defeito';

export type ChipAvaliacao = {
  texto: string;
  tipo: TipoChip;
};

/** Uma execução: uma vez que o usuário cozinhou algo. */
export type Execucao = {
  id: string;
  pratoId: string;
  prato: string;
  /** Mês por extenso. Guardado, porque `data` é texto curto e sem ano. */
  mes: string;
  /** Número da tentativa dentro do prato, com dois dígitos: "04". */
  tentativa: string;
  /** Data curta no padrão brasileiro: "19 ago". */
  data: string;
  /** Tempo gasto já formatado: "1h05", "55 min". */
  tempo: string;
  custo: number;
  /** Nota de 0 a 5. */
  nota: number;
  chips: ChipAvaliacao[];
};

/** Um prato: o agrupador de execuções da mesma receita. */
export type Prato = {
  id: string;
  nome: string;
  tentativas: number;
  notaMedia: number;
  /** As notas em ordem: a média sozinha esconderia a evolução. */
  evolucao: number[];
  ultimaVez: string;
  defeitoRecorrente?: string;
};

/** Um mês do histórico, com as execuções daquele período. */
export type MesDeExecucoes = {
  /** Rótulo do período: "agosto de 2026". */
  rotulo: string;
  execucoes: Execucao[];
};

/** Receita de referência importada de fora (link, PDF, foto). */
export type ReceitaGuia = {
  id: string;
  nome: string;
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
  /** `destaque` é grifado em vinho sobre o fundo escuro. */
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
