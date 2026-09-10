/**
 * Cozinhei — dados de exemplo da etapa 02.
 *
 * NÃO há persistência nem servidor nesta etapa (ver `local/etapas/ETAPA 02`).
 * Estes fixtures são a única fonte de dados das telas e serão substituídos
 * pelo Supabase na etapa seguinte — as telas consomem os TIPOS de
 * `types/dominio.ts`, então a troca não deve tocar em componente nenhum.
 *
 * Os números vêm de `local/design/README.md`, seção 10: usuária Marina
 * Salles, 21 execuções em 9 pratos desde abril de 2026, nota média 3,3,
 * tendência de alta. O prato de referência é o bolo de cenoura, em 4
 * tentativas: 2,0 -> 3,0 -> 3,0 -> 4,5.
 */
import type { Execucao, ReceitaGuia, ResumoMes, Usuario } from '@/types/dominio';

export const USUARIO_EXEMPLO: Usuario = {
  nome: 'Marina Salles',
  email: 'marina.salles@gmail.com',
  iniciais: 'MS',
  desde: 'cozinhando desde abril de 2026',
  totalExecucoes: 21,
};

/** Contas oferecidas no bottom sheet de login com o Google. */
export const CONTAS_GOOGLE = [
  { iniciais: 'MS', nome: 'Marina Salles', email: 'marina.salles@gmail.com' },
  { iniciais: 'MC', nome: 'Marina · cozinha', email: 'cozinhadamarina@gmail.com' },
] as const;

export const RESUMO_AGOSTO: ResumoMes = {
  periodo: 'agosto até aqui',
  execucoes: 6,
  notaMedia: 3.8,
  insight: {
    antes: 'seu bolo de cenoura subiu de 3,0 para 4,5 em quatro tentativas. o defeito que mais volta é ',
    destaque: 'massa crua no meio',
    depois: '.',
  },
};

export const EXECUCOES: Execucao[] = [
  {
    id: 'e1',
    prato: 'Arroz de forno',
    tentativa: '02',
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
    id: 'e2',
    prato: 'Bolo de cenoura',
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
    id: 'e3',
    prato: 'Pão de queijo',
    tentativa: '01',
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
    id: 'e4',
    prato: 'Strogonoff de frango',
    tentativa: '03',
    data: '11 ago',
    tempo: '45 min',
    custo: 31.2,
    nota: 3.5,
    chips: [{ texto: 'molho no ponto', tipo: 'qualidade' }],
  },
  {
    id: 'e5',
    prato: 'Feijoada',
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
];

/** As duas execuções mais recentes: bloco "continuar de onde parou". */
export const EXECUCOES_RECENTES: Execucao[] = EXECUCOES.slice(0, 2);

export const RECEITAS_GUIA: ReceitaGuia[] = [
  { id: 'g1', nome: 'Bolo de cenoura da vó', tempo: '1h', fonte: 'panelinha' },
  { id: 'g2', nome: 'Arroz de forno cremoso', tempo: '50 min', fonte: 'youtube' },
  { id: 'g3', nome: 'Pão de queijo mineiro', tempo: '45 min', fonte: 'pdf' },
];
