import { useUsuario } from '@/features/auth/AuthContext';
import type { DonoDosDados } from '@/features/execucoes/repositorio';

export function useDonoDosDados(): DonoDosDados {
  const usuario = useUsuario();
  // Conta nova nasce com zero, e é isso que leva as telas ao estado vazio.
  return usuario.totalExecucoes > 0 ? 'exemplo' : 'conta-nova';
}
