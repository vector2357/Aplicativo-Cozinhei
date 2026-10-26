import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * As duas variáveis são lidas de dentro de funções, e não numa constante no topo
 * do módulo, para que importar este arquivo não decida nada: `modoConectado()`
 * pode ser chamado antes de existir cliente, e nada acontece na carga.
 *
 * O `EXPO_PUBLIC_` é substituído em tempo de build, então o valor é fixo numa
 * execução do aplicativo. Trocar de modo exige reiniciar o servidor de
 * desenvolvimento — e é por isso que o roteiro de `docs/etapa-05.md` §7 pede
 * isso em voz alta.
 */
const url = (): string | undefined => process.env.EXPO_PUBLIC_SUPABASE_URL;
const chave = (): string | undefined => process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Se há backend configurado. Falso é um estado de primeira classe, não um erro:
 * sem as variáveis o aplicativo roda inteiro contra o SQLite da etapa 04. É o
 * que permite clonar o repositório e abrir o app sem credencial nenhuma.
 */
export function modoConectado(): boolean {
  return Boolean(url() && chave());
}

let cliente: SupabaseClient | null = null;

/**
 * O cliente, criado uma vez. Lança quando não há configuração — quem pergunta
 * antes é `modoConectado()`, e chamar isto sem perguntar é erro de programação,
 * não condição de execução.
 */
export function supabase(): SupabaseClient {
  if (cliente) return cliente;

  const endereco = url();
  const anon = chave();
  if (!endereco || !anon) {
    throw new Error('supabase não configurado: faltam EXPO_PUBLIC_SUPABASE_URL e/ou _ANON_KEY');
  }

  cliente = createClient(endereco, anon, {
    auth: {
      // A sessão vive no mesmo armazenamento da etapa 04, e é o que faz reabrir
      // o aplicativo cair direto na conta — agora com token de verdade.
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      // Só faz sentido na web, onde o token volta na barra de endereços. E
      // desligar tem uma consequência boa: é nos caminhos de `window.location`
      // que a biblioteca usa `new URL`, a única coisa nela que pediria um
      // polyfill em React Native. Entrada por e-mail e senha não passa por lá.
      detectSessionInUrl: false,
    },
  });

  return cliente;
}
