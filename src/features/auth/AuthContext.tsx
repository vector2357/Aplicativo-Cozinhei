import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { limparSessao, lerSessao, salvarSessao } from '@/features/auth/sessaoArmazenada';
import { USUARIO_EXEMPLO } from '@/features/execucoes/fixtures';
import { donoDe, garantirDadosDoDono } from '@/features/execucoes/repositorio';
import type { Usuario } from '@/types/dominio';

/** Tempo simulado de autenticação. */
const ATRASO_AUTENTICACAO_MS = 1800;

/** Teto para a leitura da sessão guardada, na abertura do aplicativo. */
const LIMITE_LEITURA_SESSAO_MS = 2000;

type Credenciais = { email: string; senha: string };
type Cadastro = Credenciais & { nome: string };

type AuthContextValor = {
  usuario: Usuario | null;
  /** Quem está entrando, enquanto `usuario` ainda é `null`. */
  usuarioPendente: Usuario;
  autenticado: boolean;
  /** Se a sessão guardada já foi consultada. Antes disso não se sabe nada. */
  sessaoVerificada: boolean;
  /** Resolve quando a sessão está pronta. Cancelada, não aplica sessão. */
  autenticar: (sinal?: AbortSignal) => Promise<void>;
  entrar: (credenciais: Credenciais) => void;
  criarConta: (cadastro: Cadastro) => void;
  entrarComGoogle: (conta: { nome: string; email: string; iniciais: string }) => void;
  sair: () => void;
};

const AuthContext = createContext<AuthContextValor | null>(null);

/** Iniciais para o avatar: "Marina Salles" -> "MS". */
function iniciaisDe(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const primeira = partes[0][0] ?? '';
  const ultima = partes.length > 1 ? (partes[partes.length - 1][0] ?? '') : '';
  return (primeira + ultima).toUpperCase();
}

/**
 * Prepara o banco do dono sem deixar a falha escapar. Se o armazenamento do
 * aparelho estiver indisponível, entrar continua possível: quem mostra o erro é
 * a tela que precisa dos dados, que já tem o estado e o "tentar de novo". Deixar
 * a exceção subir travaria a abertura do aplicativo, que é muito pior.
 */
async function prepararBanco(usuario: Usuario): Promise<void> {
  try {
    await garantirDadosDoDono(donoDe(usuario), usuario.totalExecucoes > 0);
  } catch {
    // Silêncio proposital: ver acima.
  }
}

/**
 * A sessão guardada, ou `null` quando o disco não responde a tempo. O teto
 * existe porque é esta leitura que libera as rotas: sem ele, um armazenamento
 * que não devolve resposta prende o aplicativo na splash para sempre, e pedir
 * para entrar outra vez é muito melhor do que um aplicativo que não abre.
 */
async function lerSessaoComTeto(): Promise<Usuario | null> {
  let expirar: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      lerSessao(),
      new Promise<null>((resolve) => {
        expirar = setTimeout(() => resolve(null), LIMITE_LEITURA_SESSAO_MS);
      }),
    ]);
  } finally {
    if (expirar) clearTimeout(expirar);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // `usuario` só é preenchido quando `autenticar` resolve ou quando a sessão
  // guardada é restaurada.
  const [pendente, setPendente] = useState<Usuario>(USUARIO_EXEMPLO);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [sessaoVerificada, setSessaoVerificada] = useState(false);

  // Abrir o app com sessão guardada não passa pela tela de entrada: é o que faz
  // os dados do banco aparecerem já na primeira tela depois de reabrir.
  useEffect(() => {
    let atual = true;

    (async () => {
      const guardada = await lerSessaoComTeto();
      if (!atual) return;

      if (guardada) {
        setPendente(guardada);
        setUsuario(guardada);

        // Fora do caminho da abertura, e num tique à parte: abrir o banco é
        // trabalho síncrono na linha do JS, e esperá-lo aqui deixava o
        // aplicativo parado na splash ao reabrir com sessão guardada. É
        // idempotente — protege o caso de a sessão sobreviver a uma limpeza
        // dos dados do app — e avisa as telas ao semear, então soltá-lo custa
        // no máximo um quadro de estado de carregamento.
        setTimeout(() => {
          if (atual) void prepararBanco(guardada);
        }, 0);
      }

      // Sempre, inclusive depois de falha: é esta bandeira que libera as rotas,
      // e sem ela o aplicativo ficaria na splash para sempre.
      setSessaoVerificada(true);
    })();

    return () => {
      atual = false;
    };
  }, []);

  const entrar = useCallback(({ email }: Credenciais) => {
    setPendente({ ...USUARIO_EXEMPLO, email: email.trim() || USUARIO_EXEMPLO.email });
  }, []);

  const criarConta = useCallback(({ nome, email }: Cadastro) => {
    const limpo = nome.trim() || USUARIO_EXEMPLO.nome;
    setPendente({
      nome: limpo,
      email: email.trim() || USUARIO_EXEMPLO.email,
      iniciais: iniciaisDe(limpo),
      // Conta nova começa vazia — é o que leva ao histórico vazio na etapa 03.
      desde: 'cozinhando desde hoje',
      totalExecucoes: 0,
    });
  }, []);

  const entrarComGoogle = useCallback(
    (conta: { nome: string; email: string; iniciais: string }) => {
      setPendente({ ...USUARIO_EXEMPLO, ...conta });
    },
    [],
  );

  const autenticar = useCallback(
    async (sinal?: AbortSignal) => {
      // O banco é preparado antes da espera: quando a sessão valer, as telas já
      // encontram as linhas do dono, sem um quadro de lista vazia no meio.
      await prepararBanco(pendente);

      await new Promise((resolve) => setTimeout(resolve, ATRASO_AUTENTICACAO_MS));
      // Sem isto, cancelar deixava a sessão autenticada na tela de login.
      if (sinal?.aborted) return;

      // Falhar aqui não impede de entrar: a sessão vale nesta abertura e o
      // usuário é levado para dentro, em vez de ficar preso na tela de espera.
      await salvarSessao(pendente).catch(() => {});
      setUsuario(pendente);
    },
    [pendente],
  );

  const sair = useCallback(() => {
    setUsuario(null);
    // Sem `await`: a volta ao login não tem por que esperar o disco.
    limparSessao().catch(() => {});
  }, []);

  const valor = useMemo<AuthContextValor>(
    () => ({
      usuario,
      usuarioPendente: pendente,
      autenticado: usuario !== null,
      sessaoVerificada,
      autenticar,
      entrar,
      criarConta,
      entrarComGoogle,
      sair,
    }),
    [
      usuario,
      pendente,
      sessaoVerificada,
      autenticar,
      entrar,
      criarConta,
      entrarComGoogle,
      sair,
    ],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValor {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  }
  return contexto;
}

/** Usuário garantido, para telas que só existem depois do login. */
export function useUsuario(): Usuario {
  // Rede de segurança para o instante entre sair e ser redirecionado.
  return useAuth().usuario ?? USUARIO_EXEMPLO;
}
