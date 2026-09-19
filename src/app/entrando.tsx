import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Botao, Tela } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthContext';
import { color, spacing, text } from '@/theme';

export default function TelaEntrando() {
  const router = useRouter();
  const { autenticar } = useAuth();
  // Se o usuário cancelar, a promessa em voo não pode navegar mais.
  const cancelado = useRef(false);

  useEffect(() => {
    cancelado.current = false;
    autenticar().then(() => {
      if (!cancelado.current) router.replace('/inicio');
    });
    return () => {
      cancelado.current = true;
    };
  }, [autenticar, router]);

  function cancelar() {
    cancelado.current = true;
    router.replace('/');
  }

  return (
    <Tela>
      <View style={estilos.centro}>
        <ActivityIndicator size="large" color={color.amber} />
        <Text style={[text.stateTitle, estilos.titulo]}>preparando sua cozinha</Text>
        <Text style={[text.bodyMuted, estilos.legenda]}>
          trazendo suas 21 execuções e a despensa salva.
        </Text>
      </View>

      <View style={estilos.rodape}>
        <Botao titulo="cancelar" variante="secundaria" onPress={cancelar} />
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenHWide,
  },
  titulo: { marginTop: spacing.xxl, textAlign: 'center' },
  legenda: { marginTop: 9, textAlign: 'center', paddingHorizontal: spacing.xl },
  rodape: {
    paddingHorizontal: spacing.screenHWide,
    paddingBottom: spacing.huge,
  },
});
