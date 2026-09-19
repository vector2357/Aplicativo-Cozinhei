import { useCallback, useState } from 'react';

import type { DestinoEmConstrucao } from '@/components/ui/SheetEmConstrucao';

export type UseEmConstrucao = {
  /** Destino anunciado, ou `null` quando o sheet está fechado. */
  destino: DestinoEmConstrucao | null;
  anunciar: (destino: DestinoEmConstrucao) => void;
  fechar: () => void;
};

export function useEmConstrucao(): UseEmConstrucao {
  const [destino, setDestino] = useState<DestinoEmConstrucao | null>(null);

  const anunciar = useCallback((novo: DestinoEmConstrucao) => setDestino(novo), []);
  const fechar = useCallback(() => setDestino(null), []);

  return { destino, anunciar, fechar };
}
