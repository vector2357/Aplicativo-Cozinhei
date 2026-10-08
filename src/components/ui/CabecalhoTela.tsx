import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icone } from './Icone';
import { useFocoNoTitulo } from '@/hooks/useFocoNoTitulo';
import { color, interacao, shadow, spacing, text, touch } from '@/theme';

type Props = {
  titulo: string;
  /** Para onde o voltar leva: "voltar para o histórico" diz mais que "voltar". */
  origem?: string;
  /** Renderizado à direita do título: filtro, editar, o que a tela precisar. */
  acao?: ReactNode;
};

export function CabecalhoTela({ titulo, origem, acao }: Props) {
  const router = useRouter();
  // Sem isto o leitor de tela deixa o foco no controle da tela de baixo.
  const tituloRef = useFocoNoTitulo();

  return (
    <View style={estilos.cabecalho}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={origem ? `voltar para ${origem}` : 'voltar'}
        onPress={() => router.back()}
        style={({ pressed }) => [estilos.voltar, pressed && estilos.pressionado]}
      >
        <Icone nome="voltar" />
      </Pressable>

      <Text
        ref={tituloRef}
        style={[text.screenTitle, estilos.titulo]}
        numberOfLines={1}
        accessibilityRole="header"
      >
        {titulo}
      </Text>

      {acao ? <View style={estilos.acao}>{acao}</View> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  // A sombra separa do que rola; o fundo opaco é o que a deixa existir.
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.screenH,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    backgroundColor: color.background,
    zIndex: 1,
    ...shadow.cabecalho,
  },
  voltar: {
    width: touch.minTarget,
    height: touch.minTarget,
    // Devolve o título à margem da tela sem encolher o alvo.
    marginLeft: -11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressionado: { opacity: interacao.opacidadePressionado },
  titulo: { flex: 1, minWidth: 0 },
  acao: { marginRight: -8 },
});
