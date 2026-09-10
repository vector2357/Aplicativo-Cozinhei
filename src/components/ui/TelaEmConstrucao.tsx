/**
 * Marcador de rota ainda não implementada.
 *
 * As abas histórico, pratos e perfil existem como rotas reais desde já para
 * que a navegação inteira possa ser exercitada e testada nesta etapa. O que
 * falta é o conteúdo — e dizer qual etapa vai trazê-lo é mais honesto (e mais
 * útil para quem avalia) do que uma aba que não responde ao toque.
 *
 * Segue a regra de estado vazio do app: nunca "nada encontrado", sempre o
 * que vem a seguir.
 */
import { StyleSheet, Text, View } from 'react-native';

import { Tela } from './Tela';
import { spacing, text } from '@/theme';

type Props = {
  titulo: string;
  /** O que esta tela vai mostrar quando existir. */
  descricao: string;
  etapa: string;
};

export function TelaEmConstrucao({ titulo, descricao, etapa }: Props) {
  return (
    <Tela edges={['top']}>
      <View style={estilos.margem}>
        <Text style={text.screenTitle}>{titulo}</Text>
        <View style={estilos.centro}>
          <Text style={[text.overline, estilos.etapa]}>{etapa}</Text>
          <Text style={[text.stateTitle, estilos.chamada]}>em construção</Text>
          <Text style={[text.bodyMuted, estilos.descricao]}>{descricao}</Text>
        </View>
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  margem: { flex: 1, paddingHorizontal: spacing.screenH, paddingTop: spacing.xs },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.scrollBottom,
  },
  etapa: { marginBottom: spacing.sm },
  chamada: { textAlign: 'center' },
  descricao: {
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
