import type { Execucao } from '@/types/dominio';

type Sessao = {
  user: { id: string; email: string; created_at: string; user_metadata: { nome?: string } };
};

type LinhaGuardada = {
  usuario_id: string;
  id: string;
  prato_id: string;
  prato: string;
  mes: string;
  tentativa: string;
  data: string;
  tempo: string;
  custo: number;
  nota: number;
  chips: unknown;
  criado_em: number;
};

type Chamada = { operacao: string; tabela: string; carga?: Record<string, unknown> };

const estado = {
  conectado: false,
  sessao: null as Sessao | null,
  linhas: [] as LinhaGuardada[],
  contas: new Map<string, { id: string; senha: string; nome: string; criadoEm: string }>(),
  /** Próxima operação de dados falha com esta mensagem. Consome-se ao usar. */
  falhaDeDados: null as string | null,
  /** `getSession` nunca responde — imita o armazenamento que não devolve. */
  sessaoTravada: false,
  /** `modoConectado` lança — proxy de qualquer falha no portão da abertura. */
  portaoQuebrado: false,
  /** A próxima autenticação falha com esta mensagem crua do servidor. */
  falhaDeAutenticacao: null as string | null,
  chamadas: [] as Chamada[],
};

// --- controles do teste -----------------------------------------------------

export function reiniciarBackendFalso(): void {
  estado.conectado = false;
  estado.sessao = null;
  estado.linhas = [];
  estado.contas.clear();
  estado.falhaDeDados = null;
  estado.sessaoTravada = false;
  estado.portaoQuebrado = false;
  estado.falhaDeAutenticacao = null;
  estado.chamadas = [];
}

export function ligarBackendFalso(): void {
  estado.conectado = true;
}

/** Cria a conta direto, sem passar pelo fluxo de cadastro. */
export function semearConta(email: string, senha: string, nome: string): string {
  const id = `uid-${estado.contas.size + 1}`;
  estado.contas.set(email, { id, senha, nome, criadoEm: '2026-04-10T12:00:00.000Z' });
  return id;
}

export function proximaOperacaoDeDadosFalha(mensagem: string): void {
  estado.falhaDeDados = mensagem;
}

/** Para verificar que o portão da splash não fica preso esperando a sessão. */
export function travarLeituraDaSessao(): void {
  estado.sessaoTravada = true;
}

/**
 * Faz `modoConectado()` lançar. Não imita um defeito conhecido: serve de proxy
 * para **qualquer** falha inesperada no caminho do portão, cujo invariante é
 * abrir o aplicativo de todo jeito.
 */
export function quebrarPortao(): void {
  estado.portaoQuebrado = true;
}

/**
 * A próxima autenticação falha com a mensagem **crua** do servidor, em inglês.
 * É assim que se verifica a tradução sem expor a função que a faz.
 */
export function proximaAutenticacaoFalha(mensagem: string): void {
  estado.falhaDeAutenticacao = mensagem;
}

export function chamadasFeitas(): Chamada[] {
  return [...estado.chamadas];
}

export function linhasGuardadas(): LinhaGuardada[] {
  return [...estado.linhas];
}

export function donoDaSessaoFalsa(): string | null {
  return estado.sessao?.user.id ?? null;
}

// --- a superfície que o aplicativo consome ----------------------------------

export function modoConectado(): boolean {
  if (estado.portaoQuebrado) throw new Error('dublê: falha no portão');
  return estado.conectado;
}

function consumirFalha(): string | null {
  const falha = estado.falhaDeDados;
  estado.falhaDeDados = null;
  return falha;
}

function consumirFalhaDeAutenticacao(): string | null {
  const falha = estado.falhaDeAutenticacao;
  estado.falhaDeAutenticacao = null;
  return falha;
}

function donoAtual(): string {
  if (!estado.sessao) throw new Error('dublê: operação de dados sem sessão');
  return estado.sessao.user.id;
}

function sessaoDe(email: string): Sessao {
  const conta = estado.contas.get(email);
  if (!conta) throw new Error('dublê: conta inexistente');

  return {
    user: {
      id: conta.id,
      email,
      created_at: conta.criadoEm,
      user_metadata: { nome: conta.nome },
    },
  };
}

function tabelaDeExecucoes(tabela: string) {
  return {
    select: (_colunas: string) => ({
      order: async (_coluna: string, _opcoes: { ascending: boolean }) => {
        estado.chamadas.push({ operacao: 'select', tabela });
        const falha = consumirFalha();
        if (falha) return { data: null, error: { message: falha } };

        const dono = donoAtual();
        const minhas = estado.linhas
          .filter((linha) => linha.usuario_id === dono)
          .sort((a, b) => b.criado_em - a.criado_em);

        return { data: minhas, error: null };
      },
    }),

    insert: async (carga: Record<string, unknown>) => {
      estado.chamadas.push({ operacao: 'insert', tabela, carga });
      const falha = consumirFalha();
      if (falha) return { error: { message: falha } };

      // O `default auth.uid()` da migração, imitado: o dono não vem do cliente.
      estado.linhas.push({ ...(carga as Omit<LinhaGuardada, 'usuario_id'>), usuario_id: donoAtual() });
      return { error: null };
    },

    update: (carga: Record<string, unknown>) => ({
      eq: async (_coluna: string, valor: string) => {
        estado.chamadas.push({ operacao: 'update', tabela, carga });
        const falha = consumirFalha();
        if (falha) return { error: { message: falha } };

        const dono = donoAtual();
        const linha = estado.linhas.find((l) => l.id === valor && l.usuario_id === dono);
        if (linha) Object.assign(linha, carga);
        return { error: null };
      },
    }),

    delete: () => ({
      eq: async (_coluna: string, valor: string) => {
        estado.chamadas.push({ operacao: 'delete', tabela });
        const falha = consumirFalha();
        if (falha) return { error: { message: falha } };

        const dono = donoAtual();
        estado.linhas = estado.linhas.filter((l) => !(l.id === valor && l.usuario_id === dono));
        return { error: null };
      },
    }),
  };
}

export function supabase() {
  if (!estado.conectado) {
    throw new Error('supabase não configurado: faltam EXPO_PUBLIC_SUPABASE_URL e/ou _ANON_KEY');
  }

  return {
    from: (tabela: string) => tabelaDeExecucoes(tabela),

    auth: {
      getSession: async () => {
        if (estado.sessaoTravada) return new Promise(() => {}) as never;
        return { data: { session: estado.sessao } };
      },

      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const forcada = consumirFalhaDeAutenticacao();
        if (forcada) return { data: { session: null }, error: { message: forcada } };

        const conta = estado.contas.get(email.trim());
        if (!conta || conta.senha !== password) {
          return { data: { session: null }, error: { message: 'Invalid login credentials' } };
        }

        estado.sessao = sessaoDe(email.trim());
        return { data: { session: estado.sessao }, error: null };
      },

      signUp: async ({
        email,
        password,
        options,
      }: {
        email: string;
        password: string;
        options?: { data?: { nome?: string } };
      }) => {
        const forcada = consumirFalhaDeAutenticacao();
        if (forcada) return { data: { session: null }, error: { message: forcada } };

        const limpo = email.trim();
        if (estado.contas.has(limpo)) {
          return { data: { session: null }, error: { message: 'User already registered' } };
        }
        if (password.length < 6) {
          return {
            data: { session: null },
            error: { message: 'Password should be at least 6 characters' },
          };
        }

        semearConta(limpo, password, options?.data?.nome ?? '');
        estado.sessao = sessaoDe(limpo);
        return { data: { session: estado.sessao }, error: null };
      },

      signOut: async () => {
        estado.sessao = null;
        return { error: null };
      },
    },
  } as unknown as ReturnType<typeof import('@/services/supabase').supabase>;
}

/** Usado pelos testes que precisam de execuções já no servidor. */
export function semearExecucaoRemota(usuarioId: string, execucao: Execucao, criadoEm: number): void {
  estado.linhas.push({
    usuario_id: usuarioId,
    id: execucao.id,
    prato_id: execucao.pratoId,
    prato: execucao.prato,
    mes: execucao.mes,
    tentativa: execucao.tentativa,
    data: execucao.data,
    tempo: execucao.tempo,
    custo: execucao.custo,
    nota: execucao.nota,
    chips: execucao.chips,
    criado_em: criadoEm,
  });
}
