import { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { color, radius, shadow, spacing } from '@/theme';

type Props = {
  visivel: boolean;
  onFechar: () => void;
  children: ReactNode;
  /** Anunciado ao leitor de tela quando o sheet abre. */
  tituloAcessivel: string;
};

export function BottomSheet({ visivel, onFechar, children, tituloAcessivel }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onFechar}
    >
      <View style={estilos.raiz}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="fechar"
          style={estilos.scrim}
          onPress={onFechar}
        />
        <View
          accessibilityViewIsModal
          accessibilityLabel={tituloAcessivel}
          style={[
            estilos.folha,
            { paddingBottom: Math.max(insets.bottom, spacing.xxl) },
          ]}
        >
          <View style={estilos.puxador} />
          {children}
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: color.scrim },
  folha: {
    backgroundColor: color.background,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: spacing.screenHWide,
    paddingTop: spacing.sm,
    ...shadow.sheet,
  },
  puxador: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(18,33,28,0.18)',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
});
