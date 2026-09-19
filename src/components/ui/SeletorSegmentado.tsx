import { Pressable, StyleSheet, Text, View } from 'react-native';

import { color, radius, shadow, text, touch } from '@/theme';

export type OpcaoSegmento<T extends string> = { valor: T; rotulo: string };

type Props<T extends string> = {
  opcoes: OpcaoSegmento<T>[];
  valor: T;
  onChange: (valor: T) => void;
};

export function SeletorSegmentado<T extends string>({ opcoes, valor, onChange }: Props<T>) {
  return (
    <View style={estilos.trilho} accessibilityRole="tablist">
      {opcoes.map((opcao) => {
        const ativo = opcao.valor === valor;
        return (
          <Pressable
            key={opcao.valor}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativo }}
            accessibilityLabel={opcao.rotulo}
            onPress={() => onChange(opcao.valor)}
            style={[estilos.segmento, ativo && estilos.segmentoAtivo]}
          >
            <Text style={[text.label, estilos.rotulo, ativo && estilos.rotuloAtivo]}>
              {opcao.rotulo}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  trilho: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: color.fillTrack,
    borderRadius: radius.field,
    padding: 4,
  },
  segmento: {
    flex: 1,
    minHeight: touch.minTarget,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentoAtivo: { backgroundColor: color.surface, ...shadow.segment },
  rotulo: { fontSize: 13.5, color: color.inkMuted },
  rotuloAtivo: { color: color.ink },
});
