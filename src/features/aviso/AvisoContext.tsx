import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { Aviso } from '@/components/ui/Aviso';
import type { ConteudoAviso } from '@/components/ui/Aviso';

/** Quanto tempo o aviso fica na tela antes de sair sozinho. */
const DURACAO_MS = 4000;

type AvisoContextValor = {
  /** Mostra um aviso. Um novo substitui o que estiver na tela. */
  mostrar: (conteudo: ConteudoAviso) => void;
  /** Tira o aviso antes da hora. */
  esconder: () => void;
  /** Altura livre no rodapé, declarada pelo layout dono do elemento fixo. */
  reservarRodape: (altura: number) => void;
};

const AvisoContext = createContext<AvisoContextValor | null>(null);

export function AvisoProvider({ children }: { children: ReactNode }) {
  const [aviso, setAviso] = useState<ConteudoAviso | null>(null);
  const [reserva, setReserva] = useState(0);
  const relogio = useRef<ReturnType<typeof setTimeout> | null>(null);

  const limparRelogio = useCallback(() => {
    if (relogio.current) {
      clearTimeout(relogio.current);
      relogio.current = null;
    }
  }, []);

  const esconder = useCallback(() => {
    limparRelogio();
    setAviso(null);
  }, [limparRelogio]);

  const mostrar = useCallback(
    (conteudo: ConteudoAviso) => {
      limparRelogio();
      setAviso(conteudo);
      // O leitor de tela não repara numa barra que só aparece no rodapé.
      AccessibilityInfo.announceForAccessibility(conteudo.texto);
      relogio.current = setTimeout(() => setAviso(null), DURACAO_MS);
    },
    [limparRelogio],
  );

  // Desmontar com um relógio em voo deixaria um `setState` órfão.
  useEffect(() => limparRelogio, [limparRelogio]);

  const reservarRodape = useCallback((altura: number) => setReserva(altura), []);

  const valor = useMemo<AvisoContextValor>(
    () => ({ mostrar, esconder, reservarRodape }),
    [mostrar, esconder, reservarRodape],
  );

  return (
    <AvisoContext.Provider value={valor}>
      {children}
      <Aviso aviso={aviso} onFechar={esconder} margemInferior={reserva} />
    </AvisoContext.Provider>
  );
}

/** Reserva espaço no rodapé enquanto a tela estiver montada. */
export function useReservaDeRodape(altura: number) {
  const { reservarRodape } = useAviso();

  useEffect(() => {
    reservarRodape(altura);
    return () => reservarRodape(0);
  }, [altura, reservarRodape]);
}

export function useAviso(): AvisoContextValor {
  const contexto = useContext(AvisoContext);
  if (!contexto) {
    throw new Error('useAviso precisa estar dentro de <AvisoProvider>');
  }
  return contexto;
}
