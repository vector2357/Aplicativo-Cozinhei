/** Chip de avaliação. O tipo determina a cor — nunca escolha a cor na tela. */
export type TipoChip = 'qualidade' | 'defeito';

export type ChipAvaliacao = {
  texto: string;
  tipo: TipoChip;
};

/** Uma execução: uma vez que o usuário cozinhou algo. */
export type Execucao = {
  id: string;
  /** Nome do prato ao qual a execução pertence. */
  prato: string;
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
