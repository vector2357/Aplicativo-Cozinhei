export type ErrosFicha = { prato?: string; tempo?: string; custo?: string };

/** Teto de sanidade: acima disso é erro de digitação, não uma receita longa. */
const MAXIMO_MINUTOS = 24 * 60;

/**
 * Lê os campos como texto porque é assim que eles saem do `TextInput` — e
 * porque "12,80" e "12.80" precisam valer o mesmo. A nota não entra: ela vem
 * de um seletor, e seletor não tem estado inválido.
 */
export function validarFicha(valores: {
  prato: string;
  tempo: string;
  custo: string;
}): ErrosFicha {
  const erros: ErrosFicha = {};

  if (!valores.prato.trim()) erros.prato = 'diga o que você cozinhou';

  const minutos = emNumero(valores.tempo);
  if (!valores.tempo.trim()) erros.tempo = 'informe quanto tempo levou';
  else if (minutos === null || minutos <= 0) erros.tempo = 'use só números, em minutos';
  else if (minutos > MAXIMO_MINUTOS) erros.tempo = 'mais de um dia de forno? confira o número';

  const custo = emNumero(valores.custo);
  if (!valores.custo.trim()) erros.custo = 'informe quanto gastou';
  else if (custo === null || custo < 0) erros.custo = 'use só números, em reais';

  return erros;
}

/** `null` quando o texto não é um número. Aceita a vírgula decimal brasileira. */
export function emNumero(texto: string): number | null {
  const limpo = texto.trim().replace(',', '.');
  if (!limpo || !/^\d*\.?\d+$/.test(limpo)) return null;

  const numero = Number(limpo);
  return Number.isFinite(numero) ? numero : null;
}
