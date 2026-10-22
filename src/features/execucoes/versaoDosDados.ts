import { useSyncExternalStore } from 'react';

let versao = 0;
const ouvintes = new Set<() => void>();

/** Chamada por toda mutação do repositório. Sem ela as abas ficam no dado velho. */
export function notificarMudanca(): void {
  versao += 1;
  for (const ouvinte of ouvintes) ouvinte();
}

/**
 * Entra na lista de dependências que a tela já declara ao `useCarregamento`:
 * é o que faz uma aba montada reler depois de um salvamento em outra tela.
 */
export function useVersaoDosDados(): number {
  return useSyncExternalStore(
    (ouvinte) => {
      ouvintes.add(ouvinte);
      return () => ouvintes.delete(ouvinte);
    },
    () => versao,
    () => versao,
  );
}
