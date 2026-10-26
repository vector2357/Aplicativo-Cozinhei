import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  criarContaRemota,
  entrarRemoto,
  ErroDeAutenticacao,
  sairRemoto,
  sessaoRemota,
} from '@/features/auth/autenticacaoRemota';
import { limparSessao, lerSessao, salvarSessao } from '@/features/auth/sessaoArmazenada';
import { USUARIO_EXEMPLO } from '@/features/execucoes/fixtures';
import { donoDe, garantirDadosDoDono } from '@/features/execucoes/repositorio';
import { modoConectado } from '@/services/supabase';
import type { Usuario } from '@/types/dominio';
import { iniciaisDoNome } from '@/utils/formato';

/** Tempo simulado de autenticação. */
const ATRASO_AUTENTICACAO_MS = 1800;

/** Teto para a leitura da sessão guardada, na abertura do aplicativo. */
const LIMITE_LEITURA_SESSAO_MS = 2000;

type Credenciais = { email: string; senha: string };
type Cadastro = Credenciais & { nome: string };

/**
 * Qual caminho o usuário escolheu. A tela de espera é a mesma para os três, e é
 * ela que chama `autenticar` — sem guardar a intenção, o contexto não saberia
 * se deve criar conta ou entrar numa que já existe.
 */
type Intencao = 'entrar' | 'criar' | 'google';

/**
 * As credenciais ficam **só em memória**, e só até `autenticar` resolver. Não
 * vão para o AsyncStorage, não entram no `Usuario` e não aparecem em log: o que
 * é persistido depois do login é o token da sessão, nunca a senha.
 */
type Pendencia = { intencao: Intencao; senha: string };

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

/**
 * A ida ao servidor, escolhida pela intenção que a tela de entrada registrou.
 *
 * Fica fora do componente porque não depende de estado nenhum além do que
 * recebe — e porque é aqui que mora a única diferença real entre criar conta e
 * entrar: o Supabase tem duas chamadas distintas para as duas coisas.
 */
async function autenticarNoServidor(pendente: Usuario, pendencia: Pendencia): Promise<Usuario> {
  if (pendencia.intencao === 'google') {
    // O fluxo oficial do provedor precisa de configuração de OAuth e de
    // redirecionamento no aparelho. Anunciar é melhor do que entrar num
    // caminho falso e fingir que a conta do Google foi verificada.
    throw new ErroDeAutenticacao(
      'entrar com google chega numa etapa seguinte. use e-mail e senha.',
    );
  }

  const credenciais = { email: pendente.email, senha: pendencia.senha };

  return pendencia.intencao === 'criar'
    ? criarContaRemota({ ...credenciais, nome: pendente.nome })
    : entrarRemoto(credenciais);
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
 * A sessão guardada, ou `null` quando a fonte não responde a tempo.
 *
 * O teto existe porque é esta leitura que libera as rotas: sem ele, uma fonte
 * que não devolve resposta prende o aplicativo na splash para sempre, e pedir
 * para entrar outra vez é muito melhor do que um aplicativo que não abre.
 *
 * Vale para as duas fontes, e isto é deliberado. No modo local a espera é o
 * disco; no conectado é o armazenamento do token — que também é I/O, e que num
 * aparelho sem rede pode demorar mais. Deixar o caminho novo fora do teto
 * repetiria exatamente o defeito que a etapa 04 custou a achar.
 */
async function lerSessaoComTeto(): Promise<Usuario | null> {
  let expirar: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      // No modo conectado quem guarda a sessão é o próprio Supabase, com token
      // e renovação; a chave da etapa 04 deixa de ser consultada, e o perfil é
      // remontado dos metadados do usuário.
      modoConectado() ? sessaoRemota() : lerSessao(),
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
  const [pendencia, setPendencia] = useState<Pendencia>({ intencao: 'entrar', senha: '' });
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [sessaoVerificada, setSessaoVerificada] = useState(false);

  // Abrir o app com sessão guardada não passa pela tela de entrada: é o que faz
  // os dados do banco aparecerem já na primeira tela depois de reabrir.
  useEffect(() => {
    let atual = true;

    (async () => {
      try {
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
      } catch {
        // Sem sessão é o resultado certo para qualquer falha aqui: uma
        // configuração de backend inválida, por exemplo, faz o cliente lançar
        // na construção. O aplicativo abre pedindo para entrar, e é na entrada
        // que o erro aparece com texto e com saída.
      } finally {
        // No `finally`, e não no fim do corpo: é esta bandeira que libera as
        // rotas, e enquanto ela é falsa não há tela montada onde mostrar erro
        // nenhum. Qualquer caminho que não a marque deixa o aplicativo parado
        // na splash para sempre — foi o defeito da etapa 04, e deixá-la fora do
        // `finally` era a porta aberta para ele voltar.
        if (atual) setSessaoVerificada(true);
      }
    })();

    return () => {
      atual = false;
    };
  }, []);

  const entrar = useCallback(({ email, senha }: Credenciais) => {
    setPendente({ ...USUARIO_EXEMPLO, email: email.trim() || USUARIO_EXEMPLO.email });
    setPendencia({ intencao: 'entrar', senha });
  }, []);

  const criarConta = useCallback(({ nome, email, senha }: Cadastro) => {
    const limpo = nome.trim() || USUARIO_EXEMPLO.nome;
    setPendente({
      nome: limpo,
      email: email.trim() || USUARIO_EXEMPLO.email,
      iniciais: iniciaisDoNome(limpo),
      // Conta nova começa vazia — é o que leva ao histórico vazio na etapa 03.
      desde: 'cozinhando desde hoje',
      totalExecucoes: 0,
    });
    setPendencia({ intencao: 'criar', senha });
  }, []);

  const entrarComGoogle = useCallback(
    (conta: { nome: string; email: string; iniciais: string }) => {
      setPendente({ ...USUARIO_EXEMPLO, ...conta });
      setPendencia({ intencao: 'google', senha: '' });
    },
    [],
  );

  const autenticar = useCallback(
    async (sinal?: AbortSignal) => {
      if (modoConectado()) {
        const autenticado = await autenticarNoServidor(pendente, pendencia);
        // Cancelou durante a ida ao servidor: a conta pode ter sido criada, mas
        // a sessão não é aplicada e o usuário continua fora.
        if (sinal?.aborted) return;

        setPendente(autenticado);
        // A senha sai da memória assim que deixa de ser necessária.
        setPendencia((atual) => ({ ...atual, senha: '' }));
        setUsuario(autenticado);
        return;
      }

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
    [pendente, pendencia],
  );

  const sair = useCallback(() => {
    setUsuario(null);
    setPendencia({ intencao: 'entrar', senha: '' });
    // Sem `await`: a volta ao login não tem por que esperar o servidor nem o
    // disco. Encerrar a sessão remota e falhar nisso não prende ninguém dentro.
    if (modoConectado()) sairRemoto().catch(() => {});
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
