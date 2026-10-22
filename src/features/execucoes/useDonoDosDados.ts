import { useUsuario } from '@/features/auth/AuthContext';
import { donoDe, type DonoDosDados } from '@/features/execucoes/repositorio';

export function useDonoDosDados(): DonoDosDados {
  // As linhas do banco são por dono: trocar de conta troca o conjunto inteiro,
  // e é isso que faz uma conta nova nascer nos estados vazios.
  return donoDe(useUsuario());
}
