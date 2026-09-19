import { useUsuario } from '@/features/auth/AuthContext';
import type { DonoDosDados } from '@/features/execucoes/repositorio';

export function useDonoDosDados(): DonoDosDados {
  const usuario = useUsuario();
  // Conta recém-criada nasce com zero: é isso que faz as telas mostrarem o
  // estado vazio em vez do histórico de outra pessoa.
  return usuario.totalExecucoes > 0 ? 'exemplo' : 'conta-nova';
}
