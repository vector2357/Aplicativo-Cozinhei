import { StyleSheet, Text, View } from 'react-native';

import { Botao } from './Botao';
import { BottomSheet } from './BottomSheet';
import { spacing, text } from '@/theme';

/** O que um controle órfão anuncia ao ser tocado. */
export type DestinoEmConstrucao = {
  /** Nome da tela que vai existir, em caixa baixa: "evolução", "importar". */
  titulo: string;
  /** Quando chega: "etapa 03", "etapa 04". */
  etapa: string;
  /** O que ela vai mostrar. Mesma frase que o vault da tela promete. */
  descricao: string;
};

type Props = {
  /** `null` mantém o sheet fechado. */
  destino: DestinoEmConstrucao | null;
  onFechar: () => void;
};

export function SheetEmConstrucao({ destino, onFechar }: Props) {
  return (
    <BottomSheet
      visivel={destino !== null}
      onFechar={onFechar}
      tituloAcessivel={destino ? `${destino.titulo}, em construção` : 'em construção'}
    >
      {destino ? (
        <View style={estilos.corpo}>
          <Text style={[text.overline, estilos.etapa]}>{destino.etapa}</Text>
          <Text style={text.stateTitle}>{destino.titulo}</Text>
          <Text style={[text.bodyMuted, estilos.descricao]}>{destino.descricao}</Text>
          <Text style={[text.dataMeta, estilos.aviso]}>
            esta tela ainda não existe. ela chega na {destino.etapa}.
          </Text>
          <Botao
            titulo="entendi"
            variante="secundaria"
            onPress={onFechar}
            style={estilos.fechar}
          />
        </View>
      ) : null}
    </BottomSheet>
  );
}

const estilos = StyleSheet.create({
  corpo: { paddingBottom: spacing.xs },
  etapa: { marginBottom: spacing.xs },
  descricao: { marginTop: spacing.sm },
  aviso: { marginTop: spacing.md },
  fechar: { marginTop: spacing.lg, minHeight: 50 },
});
