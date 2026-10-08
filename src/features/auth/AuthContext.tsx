import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { USUARIO_EXEMPLO } from '@/features/execucoes/fixtures';
import type { Usuario } from '@/types/dominio';

/** Tempo simulado de autenticação. */
const ATRASO_AUTENTICACAO_MS = 1800;

type Credenciais = { email: string; senha: string };
type Cadastro = Credenciais & { nome: string };

type AuthContextValor = {
  usuario: Usuario | null;
  /** Quem está entrando, enquanto `usuario` ainda é `null`. */
  usuarioPendente: Usuario;
  autenticado: boolean;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  // `usuario` só é preenchido quando `autenticar` resolve.
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
      // Sem isto, cancelar deixava a sessão autenticada na tela de login.
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

/** Usuário garantido, para telas que só existem depois do login. */
export function useUsuario(): Usuario {
  // Rede de segurança para o instante entre sair e ser redirecionado.
  return useAuth().usuario ?? USUARIO_EXEMPLO;
}
