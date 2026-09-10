/**
 * Cozinhei — formatação brasileira.
 *
 * Regra de design: nota `4,5`, dinheiro `R$ 12,80`, data `19 ago`,
 * tempo `1h05`. Nenhuma tela deve montar essas strings à mão.
 */

/** Nota (0–5) no padrão brasileiro: 4.5 -> "4,5". */
export const formatarNota = (nota: number): string =>
  nota.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Valor em reais: 12.8 -> "R$ 12,80". */
export const formatarMoeda = (valor: number): string =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Número de tentativa sempre com dois dígitos: 4 -> "04". */
export const formatarTentativa = (n: number): string => String(n).padStart(2, '0');

/**
 * Estrelas cheias e vazias para a nota, arredondando para o inteiro mais
 * próximo. Sempre cinco glifos, para que a largura não dance na lista.
 */
export const estrelas = (nota: number): string => {
  const cheias = Math.max(0, Math.min(5, Math.round(nota)));
  return '★'.repeat(cheias) + '☆'.repeat(5 - cheias);
};

/** Data por extenso do cabeçalho de início: "segunda, 26 de agosto". */
export const dataPorExtenso = (data: Date): string =>
  data
    .toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace('-feira', '');
