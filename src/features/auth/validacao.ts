/**
 * Validação dos formulários de entrada.
 *
 * Fica fora das telas de propósito: são regras de negócio, e na etapa 03 o
 * servidor vai reaproveitar as mesmas para responder erro de cadastro.
 * As mensagens são em caixa baixa, como todo texto de interface do app.
 */

/** Mínimo pedido na tela de criar conta ("use 8 caracteres ou mais"). */
export const MINIMO_SENHA = 8;

// Simples de propósito: validação de e-mail por regex nunca é completa, e a
// confirmação real acontece no servidor. Aqui só evitamos o erro óbvio.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ErrosEntrar = { email?: string; senha?: string };
export type ErrosCriarConta = ErrosEntrar & { nome?: string; termos?: string };

export function validarEntrar(valores: { email: string; senha: string }): ErrosEntrar {
  const erros: ErrosEntrar = {};
  if (!valores.email.trim()) erros.email = 'informe seu e-mail';
  else if (!EMAIL.test(valores.email.trim())) erros.email = 'esse e-mail não parece completo';
  if (!valores.senha) erros.senha = 'informe sua senha';
  return erros;
}

export function validarCriarConta(valores: {
  nome: string;
  email: string;
  senha: string;
  termos: boolean;
}): ErrosCriarConta {
  const erros: ErrosCriarConta = validarEntrar(valores);
  if (!valores.nome.trim()) erros.nome = 'diga como te chamamos';
  if (valores.senha && valores.senha.length < MINIMO_SENHA) {
    erros.senha = `use ${MINIMO_SENHA} caracteres ou mais`;
  }
  if (!valores.termos) erros.termos = 'é preciso aceitar os termos para criar a conta';
  return erros;
}

export const semErros = (erros: object): boolean => Object.keys(erros).length === 0;
