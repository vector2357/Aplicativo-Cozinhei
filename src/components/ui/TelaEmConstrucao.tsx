import { StyleSheet, Text, View } from 'react-native';

import { CabecalhoTela } from './CabecalhoTela';
import { Tela } from './Tela';
import { spacing, text } from '@/theme';

type Props = {
  titulo: string;
  /** O que esta tela vai mostrar quando existir. */
  descricao: string;
  etapa: string;
  /** Presente, troca o título por um cabeçalho com voltar. Ausente, é aba. */
  origem?: string;
};

export function TelaEmConstrucao({ titulo, descricao, etapa, origem }: Props) {
  return (
    <Tela edges={['top']}>
      {origem ? (
        <CabecalhoTela titulo={titulo} origem={origem} />
      ) : (
        <View style={estilos.margemTitulo}>
          <Text style={text.screenTitle} accessibilityRole="header">
            {titulo}
          </Text>
        </View>
      )}

      {/* Sem barra de abas embaixo, o vão dela não precisa ser reservado. */}
      <View style={[estilos.centro, !origem && estilos.centroComBarra]}>
        <Text style={[text.overline, estilos.etapa]}>{etapa}</Text>
        <Text style={[text.stateTitle, estilos.chamada]}>em construção</Text>
        <Text style={[text.bodyMuted, estilos.descricao]}>{descricao}</Text>
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  margemTitulo: { paddingHorizontal: spacing.screenH, paddingTop: spacing.xs },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenH,
  },
  centroComBarra: { paddingBottom: spacing.scrollBottom },
  etapa: { marginBottom: spacing.sm },
  chamada: { textAlign: 'center' },
  descricao: {
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
