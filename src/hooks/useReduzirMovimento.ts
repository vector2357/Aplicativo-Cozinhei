import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReduzirMovimento(): boolean {
  const [reduzir, setReduzir] = useState(false);

  useEffect(() => {
    let montado = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((ativo) => {
        if (montado) setReduzir(ativo);
      })
      // Plataforma que não responde segue no padrão, que é animar.
      .catch(() => {});

    // O usuário pode ligar o ajuste com o app aberto.
    const inscricao = AccessibilityInfo.addEventListener('reduceMotionChanged', (ativo) => {
      if (montado) setReduzir(ativo);
    });

    return () => {
      montado = false;
      inscricao.remove();
    };
  }, []);

  return reduzir;
}
