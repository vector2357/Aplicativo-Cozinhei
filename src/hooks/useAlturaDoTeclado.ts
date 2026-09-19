import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

export function useAlturaDoTeclado(): number {
  const [altura, setAltura] = useState(0);

  useEffect(() => {
    // `will*` no iOS acompanha a animação do teclado; o Android só tem `did*`.
    const aoAbrir = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const aoFechar = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const abriu = Keyboard.addListener(aoAbrir, (evento) => {
      setAltura(evento.endCoordinates.height);
    });
    const fechou = Keyboard.addListener(aoFechar, () => setAltura(0));

    return () => {
      abriu.remove();
      fechou.remove();
    };
  }, []);

  return altura;
}
