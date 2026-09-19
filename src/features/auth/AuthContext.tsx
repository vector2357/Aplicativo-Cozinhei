import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { USUARIO_EXEMPLO } from '@/features/execucoes/fixtures';
import type { Usuario } from '@/types/dominio';

/** Tempo simulado de autenticação. */
const ATRASO_AUTENTICACAO_MS = 1800;

type Credenciais = { email: string; senha: string };
type Cadastro = Credenciais & { nome: string };

type AuthContextValor = {
  usuario: Usuario | null;
  /**
   * Quem está entrando, antes de a sessão existir.
   *
   * A tela de espera precisa dele: durante a autenticação `usuario` ainda é
   * `null`, e é o pendente que sabe se a conta é nova ou tem histórico.
   */
  usuarioPendente: Usuario;
  autenticado: boolean;
  /**
   * Resolve quando a sessão está pronta. Usada pela tela "entrando".
   *
   * O sinal permite desistir no meio: cancelada, a sessão NÃO é aplicada.
   * Na etapa 04 o mesmo sinal aborta a requisição ao servidor.
   */
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

export function AuthProvider({ children }: { children: ReactNode }) {
  // `pendente` guarda quem vai entrar; `usuario` só é preenchido depois que
  // `autenticar` resolve, para que a tela "entrando" tenha o que mostrar.
  const [pendente, setPendente] = useState<Usuario>(USUARIO_EXEMPLO);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

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
      await new Promise((resolve) => setTimeout(resolve, ATRASO_AUTENTICACAO_MS));
      // Sem esta checagem, cancelar bloquearia só a navegação: a sessão ficava
      // autenticada com o usuário de volta na tela de login. Vira bug de
      // verdade assim que existe guarda de rota — e agora existe.
      if (sinal?.aborted) return;
      setUsuario(pendente);
    },
    [pendente],
  );

  const sair = useCallback(() => setUsuario(null), []);

  const valor = useMemo<AuthContextValor>(
    () => ({
      usuario,
      usuarioPendente: pendente,
      autenticado: usuario !== null,
      autenticar,
      entrar,
      criarConta,
      entrarComGoogle,
      sair,
    }),
    [usuario, pendente, autenticar, entrar, criarConta, entrarComGoogle, sair],
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

/**
 * Usuário garantido, para telas que só existem depois do login. Cai no
 * usuário de exemplo se alguém abrir a rota direto (deep link em dev).
 */
export function useUsuario(): Usuario {
  // As telas de dentro do app só montam com sessão — quem garante isso é a
  // guarda em `(tabs)/_layout.tsx`. O usuário de exemplo continua como rede
  // de segurança para o instante entre a saída e o redirecionamento.
  return useAuth().usuario ?? USUARIO_EXEMPLO;
}
