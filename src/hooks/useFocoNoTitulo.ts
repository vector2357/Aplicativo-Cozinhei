import { useCallback, useEffect, useRef } from 'react';
import { AccessibilityInfo, findNodeHandle } from 'react-native';
import type { Text } from 'react-native';

/** Espera a tela assentar antes de mover o foco. */
const ATRASO_MS = 350;

export function useFocoNoTitulo(pronto = true) {
  const alvo = useRef<Text>(null);

  const focar = useCallback(() => {
    const no = alvo.current && findNodeHandle(alvo.current);
    if (no) AccessibilityInfo.setAccessibilityFocus(no);
  }, []);

  useEffect(() => {
    if (!pronto) return;

    // No mesmo quadro da montagem o sistema devolve o foco para onde estava.
    const relogio = setTimeout(focar, ATRASO_MS);
    return () => clearTimeout(relogio);
  }, [pronto, focar]);

  return alvo;
}
