import { StyleSheet, Text, View } from 'react-native';

import { Botao } from './Botao';
import { BottomSheet } from './BottomSheet';
import { spacing, text } from '@/theme';

type Props = {
  visivel: boolean;
  /** O que está em jogo, em caixa baixa: "descartar esta ficha?". */
  titulo: string;
  /** A consequência, por extenso. Confirmar sem saber o que se perde é cego. */
  descricao: string;
  /** O rótulo da ação, e não "ok": "descartar", "remover". */
  rotuloConfirmar: string;
  onConfirmar: () => void;
  /** Fechar e confirmar são caminhos diferentes — o scrim fecha, não confirma. */
  onCancelar: () => void;
};

/**
 * Escolha de três segundos com consequência: cabe em sheet, e nunca em rota.
 * A ação fica como fantasma e o cancelar como secundária, porque a saída segura
 * é a que precisa parecer o caminho normal.
 */
export function SheetConfirmar({
  visivel,
  titulo,
  descricao,
  rotuloConfirmar,
  onConfirmar,
  onCancelar,
}: Props) {
  return (
    <BottomSheet visivel={visivel} onFechar={onCancelar} tituloAcessivel={titulo}>
      <View style={estilos.corpo}>
        <Text style={text.stateTitle}>{titulo}</Text>
        <Text style={[text.bodyMuted, estilos.descricao]}>{descricao}</Text>

        <View style={estilos.acoes}>
          <Botao
            titulo={rotuloConfirmar}
            variante="fantasma"
            onPress={onConfirmar}
            accessibilityHint={descricao}
          />
          <Botao titulo="voltar e continuar" variante="secundaria" onPress={onCancelar} />
        </View>
      </View>
    </BottomSheet>
  );
}

const estilos = StyleSheet.create({
  corpo: { paddingBottom: spacing.xs },
  descricao: { marginTop: spacing.sm },
  acoes: { marginTop: spacing.lg, gap: spacing.sm },
});
