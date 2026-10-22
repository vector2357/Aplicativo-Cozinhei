import type { Execucao, ReceitaGuia, Usuario } from '@/types/dominio';

export const USUARIO_EXEMPLO: Usuario = {
  nome: 'Marina Cintra Marinho',
  email: 'marina.cintramarinho@gmail.com',
  iniciais: 'MC',
  desde: 'cozinhando desde abril de 2026',
  totalExecucoes: 21,
};

/** Contas oferecidas no bottom sheet de login com o Google. */
export const CONTAS_GOOGLE = [
  { iniciais: 'MC', nome: 'Marina Cintra Marinho', email: 'marina.cintramarinho@gmail.com' },
  { iniciais: 'MC', nome: 'Marina · cozinha', email: 'cozinhadamarina@gmail.com' },
] as const;

// Só a frase: os números do resumo são contados pelo repositório.
export const INSIGHT_DO_MES = {
  antes: 'seu bolo de cenoura subiu de 3,0 para 4,5 em quatro tentativas. o defeito que mais volta é ',
  destaque: 'massa crua no meio',
  depois: '.',
};

// O mês corrente do conjunto de exemplo. Em execução quem o determina é a
// execução mais recente do banco; esta constante é a referência dos testes.
export const MES_CORRENTE = 'agosto de 2026';

/**
 * As 21 execuções de exemplo, da mais recente para a mais antiga. A partir da
 * etapa 04 elas são a **semente** do banco local: entram uma vez, na primeira
 * entrada de um dono que traz o conjunto de exemplo.
 */
export const EXECUCOES: Execucao[] = [
  // ── agosto de 2026 · 6 execuções ──────────────────────────────────────
  {
    id: 'e1',
    pratoId: 'p6',
    prato: 'Panqueca de carne',
    mes: 'agosto de 2026',
    tentativa: '02',
    data: '27 ago',
    tempo: '50 min',
    custo: 24.5,
    nota: 5,
    chips: [
      { texto: 'massa fina', tipo: 'qualidade' },
      { texto: 'recheio suculento', tipo: 'qualidade' },
    ],
  },
  {
    id: 'e2',
    pratoId: 'p2',
    prato: 'Arroz de forno',
    mes: 'agosto de 2026',
    tentativa: '03',
    data: '22 ago',
    tempo: '55 min',
    custo: 18.4,
    nota: 4,
    chips: [
      { texto: 'queijo gratinado', tipo: 'qualidade' },
      { texto: 'salgado demais', tipo: 'defeito' },
    ],
  },
  {
    id: 'e3',
    pratoId: 'p1',
    prato: 'Bolo de cenoura',
    mes: 'agosto de 2026',
    tentativa: '04',
    data: '19 ago',
    tempo: '1h05',
    custo: 12.8,
    nota: 4.5,
    chips: [
      { texto: 'massa fofa', tipo: 'qualidade' },
      { texto: 'borda seca', tipo: 'defeito' },
    ],
  },
  {
    id: 'e4',
    pratoId: 'p3',
    prato: 'Pão de queijo',
    mes: 'agosto de 2026',
    tentativa: '02',
    data: '15 ago',
    tempo: '40 min',
    custo: 9.6,
    nota: 2.5,
    chips: [
      { texto: 'não cresceu', tipo: 'defeito' },
      { texto: 'massa dura', tipo: 'defeito' },
    ],
  },
  {
    id: 'e5',
    pratoId: 'p4',
    prato: 'Strogonoff de frango',
    mes: 'agosto de 2026',
    tentativa: '03',
    data: '11 ago',
    tempo: '45 min',
    custo: 31.2,
    nota: 3.5,
    chips: [{ texto: 'molho no ponto', tipo: 'qualidade' }],
  },
  {
    id: 'e6',
    pratoId: 'p5',
    prato: 'Feijoada',
    mes: 'agosto de 2026',
    tentativa: '01',
    data: '03 ago',
    tempo: '3h40',
    custo: 62,
    nota: 3,
    chips: [
      { texto: 'caldo grosso', tipo: 'qualidade' },
      { texto: 'carne dura', tipo: 'defeito' },
    ],
  },

  // ── julho de 2026 · 5 execuções ───────────────────────────────────────
  {
    id: 'e7',
    pratoId: 'p4',
    prato: 'Strogonoff de frango',
    mes: 'julho de 2026',
    tentativa: '02',
    data: '28 jul',
    tempo: '50 min',
    custo: 29.9,
    nota: 3,
    chips: [{ texto: 'creme talhou', tipo: 'defeito' }],
  },
  {
    id: 'e8',
    pratoId: 'p7',
    prato: 'Lasanha à bolonhesa',
    mes: 'julho de 2026',
    tentativa: '02',
    data: '21 jul',
    tempo: '1h30',
    custo: 44.7,
    nota: 4,
    chips: [{ texto: 'molho encorpado', tipo: 'qualidade' }],
  },
  {
    id: 'e9',
    pratoId: 'p2',
    prato: 'Arroz de forno',
    mes: 'julho de 2026',
    tentativa: '02',
    data: '14 jul',
    tempo: '1h',
    custo: 17.2,
    nota: 3,
    chips: [{ texto: 'arroz empapado', tipo: 'defeito' }],
  },
  {
    id: 'e10',
    pratoId: 'p6',
    prato: 'Panqueca de carne',
    mes: 'julho de 2026',
    tentativa: '01',
    data: '09 jul',
    tempo: '1h',
    custo: 23.1,
    nota: 3.5,
    chips: [{ texto: 'massa grossa', tipo: 'defeito' }],
  },
  {
    id: 'e11',
    pratoId: 'p8',
    prato: 'Risoto de cogumelos',
    mes: 'julho de 2026',
    tentativa: '02',
    data: '02 jul',
    tempo: '55 min',
    custo: 38.4,
    nota: 2.5,
    chips: [
      { texto: 'arroz cru no meio', tipo: 'defeito' },
      { texto: 'sem sal', tipo: 'defeito' },
    ],
  },

  // ── junho de 2026 · 4 execuções ───────────────────────────────────────
  {
    id: 'e12',
    pratoId: 'p1',
    prato: 'Bolo de cenoura',
    mes: 'junho de 2026',
    tentativa: '03',
    data: '25 jun',
    tempo: '1h10',
    custo: 12.4,
    nota: 3,
    chips: [
      { texto: 'cobertura boa', tipo: 'qualidade' },
      { texto: 'massa crua no meio', tipo: 'defeito' },
    ],
  },
  {
    id: 'e13',
    pratoId: 'p9',
    prato: 'Frango assado',
    mes: 'junho de 2026',
    tentativa: '02',
    data: '18 jun',
    tempo: '1h20',
    custo: 27.8,
    nota: 3.5,
    chips: [{ texto: 'pele crocante', tipo: 'qualidade' }],
  },
  {
    id: 'e14',
    pratoId: 'p3',
    prato: 'Pão de queijo',
    mes: 'junho de 2026',
    tentativa: '01',
    data: '11 jun',
    tempo: '45 min',
    custo: 10.2,
    nota: 2,
    chips: [{ texto: 'não cresceu', tipo: 'defeito' }],
  },
  {
    id: 'e15',
    pratoId: 'p7',
    prato: 'Lasanha à bolonhesa',
    mes: 'junho de 2026',
    tentativa: '01',
    data: '04 jun',
    tempo: '1h45',
    custo: 41.3,
    nota: 3,
    chips: [{ texto: 'massa ressecada', tipo: 'defeito' }],
  },

  // ── maio de 2026 · 3 execuções ────────────────────────────────────────
  {
    id: 'e16',
    pratoId: 'p1',
    prato: 'Bolo de cenoura',
    mes: 'maio de 2026',
    tentativa: '02',
    data: '23 mai',
    tempo: '1h15',
    custo: 11.9,
    nota: 3,
    chips: [{ texto: 'massa crua no meio', tipo: 'defeito' }],
  },
  {
    id: 'e17',
    pratoId: 'p4',
    prato: 'Strogonoff de frango',
    mes: 'maio de 2026',
    tentativa: '01',
    data: '16 mai',
    tempo: '55 min',
    custo: 28.6,
    nota: 2.5,
    chips: [{ texto: 'frango seco', tipo: 'defeito' }],
  },
  {
    id: 'e18',
    pratoId: 'p9',
    prato: 'Frango assado',
    mes: 'maio de 2026',
    tentativa: '01',
    data: '07 mai',
    tempo: '1h30',
    custo: 26.4,
    nota: 3,
    chips: [{ texto: 'temperado por dentro', tipo: 'qualidade' }],
  },

  // ── abril de 2026 · 3 execuções · o começo de tudo ────────────────────
  {
    id: 'e19',
    pratoId: 'p2',
    prato: 'Arroz de forno',
    mes: 'abril de 2026',
    tentativa: '01',
    data: '26 abr',
    tempo: '1h05',
    custo: 16.8,
    nota: 2.5,
    chips: [{ texto: 'sem gratinar', tipo: 'defeito' }],
  },
  {
    id: 'e20',
    pratoId: 'p1',
    prato: 'Bolo de cenoura',
    mes: 'abril de 2026',
    tentativa: '01',
    data: '19 abr',
    tempo: '1h20',
    custo: 11.5,
    nota: 2,
    chips: [
      { texto: 'massa crua no meio', tipo: 'defeito' },
      { texto: 'pouco doce', tipo: 'defeito' },
    ],
  },
  {
    id: 'e21',
    pratoId: 'p8',
    prato: 'Risoto de cogumelos',
    mes: 'abril de 2026',
    tentativa: '01',
    data: '12 abr',
    tempo: '1h',
    custo: 36.9,
    nota: 2.5,
    chips: [{ texto: 'arroz cru no meio', tipo: 'defeito' }],
  },
];

// As duas execuções mais recentes do conjunto de exemplo. O recorte de verdade
// é feito pelo repositório sobre o banco; aqui ele serve de referência aos testes.
export const EXECUCOES_RECENTES: Execucao[] = EXECUCOES.slice(0, 2);

export const RECEITAS_GUIA: ReceitaGuia[] = [
  { id: 'g1', nome: 'Bolo de cenoura da vó', tempo: '1h', fonte: 'panelinha' },
  { id: 'g2', nome: 'Arroz de forno cremoso', tempo: '50 min', fonte: 'youtube' },
  { id: 'g3', nome: 'Pão de queijo mineiro', tempo: '45 min', fonte: 'pdf' },
];
