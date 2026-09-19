import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icone } from './Icone';
import { useFocoNoTitulo } from '@/hooks/useFocoNoTitulo';
import { interacao, spacing, text, touch } from '@/theme';

type Props = {
  titulo: string;
  /**
   * Para onde o voltar leva, em caixa baixa: "início", "histórico". Entra no
   * rótulo de acessibilidade — "voltar para o histórico" diz mais que
   * "voltar". Omita quando a origem for variável.
   */
  origem?: string;
  /** Renderizado à direita do título: filtro, editar, o que a tela precisar. */
  acao?: ReactNode;
};

export function CabecalhoTela({ titulo, origem, acao }: Props) {
  const router = useRouter();
  /*
    Ao empilhar uma tela, o leitor de tela costuma manter o foco onde estava —
    no controle que a abriu, que agora está na tela de baixo. Quem entrou fica
    sem saber que chegou. Mover o foco para o título resolve, e o título é o
    lugar certo: ele diz onde se está.
  */
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
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.screenH,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  voltar: {
    width: touch.minTarget,
    height: touch.minTarget,
    // O ícone é menor que o alvo; a margem negativa devolve o título à margem
    // da tela sem que o alvo encolha.
    marginLeft: -11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressionado: { opacity: interacao.opacidadePressionado },
  titulo: { flex: 1, minWidth: 0 },
  acao: { marginRight: -8 },
});
