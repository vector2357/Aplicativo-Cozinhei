import { ReactNode } from 'react';
import { StatusBar, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { useLayoutResponsivo } from '@/hooks/useLayoutResponsivo';
import { color } from '@/theme';

type Props = {
  children: ReactNode;
  /** `escura` só no cronômetro, na gravação e no resumo. */
  tom?: 'clara' | 'escura';
  /** Bordas onde aplicar a área segura. Padrão: topo e base. */
  edges?: readonly Edge[];
  style?: ViewStyle;
};

export function Tela({ children, tom = 'clara', edges = ['top', 'bottom'], style }: Props) {
  const { larguraConteudo, larga } = useLayoutResponsivo();
  const escura = tom === 'escura';

  return (
    <SafeAreaView
      edges={edges}
      style={[estilos.raiz, { backgroundColor: escura ? color.backgroundDark : color.background }]}
    >
      <StatusBar barStyle={escura ? 'light-content' : 'dark-content'} />
      <View
        style={[
          estilos.coluna,
          larga && { width: larguraConteudo, alignSelf: 'center' },
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1 },
  coluna: { flex: 1, width: '100%' },
});
