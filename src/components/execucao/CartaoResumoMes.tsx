import { StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/ui';
import { color, fontFamily, radius, spacing, text } from '@/theme';
import type { ResumoMes } from '@/types/dominio';
import { formatarNota } from '@/utils/formato';

type Props = {
  resumo: ResumoMes;
  onVerEvolucao: () => void;
};

export function CartaoResumoMes({ resumo, onVerEvolucao }: Props) {
  return (
    <View style={estilos.cartao}>
      <Text style={[text.overline, estilos.periodo]}>{resumo.periodo}</Text>

      <View style={estilos.numeros}>
        <View>
          <Text style={estilos.metrica}>{resumo.execucoes}</Text>
          <Text style={estilos.legenda}>execuções</Text>
        </View>
        <View style={estilos.separador} />
        <View>
          <Text style={[estilos.metrica, estilos.metricaNota]}>
            {formatarNota(resumo.notaMedia)}
          </Text>
          <Text style={estilos.legenda}>nota média</Text>
        </View>
      </View>

      <Text style={estilos.insight}>
        {resumo.insight.antes}
        <Text style={estilos.defeito}>{resumo.insight.destaque}</Text>
        {resumo.insight.depois}
      </Text>

      <Botao
        titulo="ver sua evolução"
        variante="contornoEscuro"
        onPress={onVerEvolucao}
        style={estilos.acao}
        accessibilityHint="abre os painéis de nota, custo e defeitos"
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: color.backgroundDark,
    borderRadius: radius.summary,
    padding: spacing.lg,
  },
  periodo: { color: color.stone, letterSpacing: 1.2 },
  numeros: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xxl,
    marginTop: spacing.md,
  },
  metrica: {
    fontFamily: fontFamily.display,
    fontSize: 40,
    lineHeight: 40,
    letterSpacing: -1.2,
    color: color.inkOnDark,
  },
  metricaNota: { color: color.amber },
  legenda: {
    fontFamily: fontFamily.body,
    fontSize: 11.5,
    color: color.inkOnDarkFaint,
    marginTop: 5,
  },
  separador: {
    width: 1,
    height: 42,
    backgroundColor: 'rgba(242,243,240,0.16)',
  },
  insight: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 19.5,
    color: color.inkOnDarkMuted,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(242,243,240,0.14)',
    paddingTop: spacing.md,
  },
  defeito: { color: color.wineOnDark },
  acao: { marginTop: spacing.md, minHeight: 44, borderRadius: 10 },
});
