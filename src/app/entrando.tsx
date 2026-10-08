import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Botao, Indicador, Tela } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthContext';
import { useAviso } from '@/features/aviso/AvisoContext';
import { spacing, text } from '@/theme';

export default function TelaEntrando() {
  const router = useRouter();
  const { autenticar, usuarioPendente } = useAuth();
  const aviso = useAviso();

  // O número vem do usuário: conta nova não tem 21 execuções a prometer.
  const legenda = usuarioPendente.totalExecucoes
    ? `trazendo suas ${usuarioPendente.totalExecucoes} execuções e a despensa salva.`
    : 'preparando sua primeira ficha.';
  // Um sinal só impede as duas coisas: navegar para dentro e aplicar a sessão.
  const desistencia = useRef(new AbortController());

  useEffect(() => {
    const controlador = new AbortController();
    desistencia.current = controlador;

    autenticar(controlador.signal).then(() => {
      if (!controlador.signal.aborted) router.replace('/inicio');
    });

    return () => controlador.abort();
  }, [autenticar, router]);

  function cancelar() {
    desistencia.current.abort();
    router.replace('/');
    // Voltar em silêncio deixa a dúvida de ter tocado no lugar certo.
    aviso.mostrar({ texto: 'entrada cancelada' });
  }

  return (
    <Tela>
      <View style={estilos.centro}>
        <Indicador tamanho={40} rotulo="preparando sua cozinha" />
        <Text style={[text.stateTitle, estilos.titulo]}>preparando sua cozinha</Text>
        <Text style={[text.bodyMuted, estilos.legenda]}>{legenda}</Text>
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
