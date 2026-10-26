import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/services/supabase';
import type { Usuario } from '@/types/dominio';
import { formatarMes, iniciaisDoNome } from '@/utils/formato';

type Credenciais = { email: string; senha: string };
type Cadastro = Credenciais & { nome: string };

/**
 * Falha de autenticação com mensagem pronta para a tela. Existe como tipo para
 * a tela de espera distinguir "não deu" de qualquer outra exceção — e para a
 * mensagem do servidor, que vem em inglês, nunca chegar ao usuário.
 */
export class ErroDeAutenticacao extends Error {}

/**
 * Traduz a falha do Supabase. A lista cobre o que o fluxo desta etapa alcança;
 * o resto cai numa frase genérica, que é melhor do que texto em inglês no meio
 * da interface.
 */
function traduzir(mensagem: string): string {
  const m = mensagem.toLowerCase();

  if (m.includes('invalid login credentials')) return 'e-mail ou senha incorretos.';
  if (m.includes('already registered') || m.includes('already been registered')) {
    return 'este e-mail já tem uma conta. tente entrar.';
  }
  if (m.includes('password should be at least')) {
    return 'a senha precisa de pelo menos 6 caracteres.';
  }
  if (m.includes('email not confirmed')) return 'confirme seu e-mail antes de entrar.';

  // Falhas de CONFIGURAÇÃO do servidor, não de quem está digitando. Mereceram
  // entrada própria porque a frase genérica ("tente de novo") convida a insistir
  // num caminho que nunca vai funcionar — e esconde de quem desenvolve o que
  // precisa ser mudado no painel. Aconteceu de verdade: um 400
  // `email_provider_disabled` chegou à tela como "não consegui entrar agora".
  if (m.includes('email signups are disabled') || m.includes('email_provider_disabled')) {
    return 'o cadastro por e-mail está desligado no servidor.';
  }
  if (m.includes('signups not allowed') || m.includes('signup_disabled')) {
    return 'o servidor não está aceitando contas novas agora.';
  }
  if (m.includes('invalid email') || m.includes('unable to validate email')) {
    return 'esse e-mail não parece válido.';
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'muitas tentativas. espere um instante e tente de novo.';
  }
  // `fetch failed` / `network request failed`: o servidor não respondeu.
  if (m.includes('network') || m.includes('fetch')) {
    return 'não consegui falar com o servidor. verifique sua conexão.';
  }

  return 'não consegui entrar agora. tente de novo.';
}

/**
 * O `Usuario` do domínio a partir da sessão. O nome vem dos metadados do
 * cadastro; `totalExecucoes` fica em zero de propósito — no modo conectado ele
 * não decide nada (a semente é local) e quem conta as execuções de verdade é o
 * repositório, direto das linhas.
 */
export function usuarioDaSessao(sessao: Session): Usuario {
  const email = sessao.user.email ?? '';
  const metadados = sessao.user.user_metadata as { nome?: string } | undefined;
  const nome = metadados?.nome?.trim() || email.split('@')[0] || 'você';

  return {
    nome,
    email,
    iniciais: iniciaisDoNome(nome),
    desde: `cozinhando desde ${formatarMes(new Date(sessao.user.created_at))}`,
    totalExecucoes: 0,
  };
}

/** A sessão guardada pelo próprio Supabase, ou `null`. Nunca lança. */
export async function sessaoRemota(): Promise<Usuario | null> {
  try {
    const { data } = await supabase().auth.getSession();
    return data.session ? usuarioDaSessao(data.session) : null;
  } catch {
    // Mesma regra da etapa 04: não saber a sessão vale como não ter sessão, e
    // travar a abertura do aplicativo seria pior do que pedir para entrar.
    return null;
  }
}

export async function entrarRemoto({ email, senha }: Credenciais): Promise<Usuario> {
  const { data, error } = await supabase().auth.signInWithPassword({
    email: email.trim(),
    password: senha,
  });

  if (error) throw new ErroDeAutenticacao(traduzir(error.message));
  if (!data.session) throw new ErroDeAutenticacao('não consegui entrar agora. tente de novo.');

  return usuarioDaSessao(data.session);
}

export async function criarContaRemota({ nome, email, senha }: Cadastro): Promise<Usuario> {
  const { data, error } = await supabase().auth.signUp({
    email: email.trim(),
    password: senha,
    // O nome não é campo de autenticação: vive nos metadados do usuário, e é
    // de lá que o avatar e o cumprimento do início saem.
    options: { data: { nome: nome.trim() } },
  });

  if (error) throw new ErroDeAutenticacao(traduzir(error.message));

  // Sem sessão depois de criar significa que o projeto exige confirmação de
  // e-mail. Não é erro de código, e o usuário precisa saber o que fazer.
  if (!data.session) {
    throw new ErroDeAutenticacao(
      'conta criada. confirme o link enviado para o seu e-mail e depois entre.',
    );
  }

  return usuarioDaSessao(data.session);
}

/** Encerra a sessão no servidor. Falha aqui não impede de sair do aplicativo. */
export async function sairRemoto(): Promise<void> {
  await supabase().auth.signOut();
}
