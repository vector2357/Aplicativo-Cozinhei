import { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useReduzirMovimento } from '@/hooks/useReduzirMovimento';
import { color, radius, shadow, text, touch } from '@/theme';

export type OpcaoSegmento<T extends string> = { valor: T; rotulo: string };

type Props<T extends string> = {
  opcoes: OpcaoSegmento<T>[];
  valor: T;
  onChange: (valor: T) => void;
};

/**
 * Vão entre os dois segmentos.
 *
 * É o mesmo `deadSpace` da barra de abas, e pela mesma razão: dois alvos de
 * 44pt encostados erram, porque o dedo cobre mais área do que o ponto que a
 * pessoa mira.
 */
const FOLGA = touch.deadSpace;

/** Respiro do trilho para os segmentos. Interno, não separa alvos. */
const RECUO = 4;

/** Duração do deslize. Curta: o controle precisa parecer imediato. */
const DURACAO_MS = 220;

export function SeletorSegmentado<T extends string>({ opcoes, valor, onChange }: Props<T>) {
  const reduzirMovimento = useReduzirMovimento();
  const [larguraDoTrilho, setLarguraDoTrilho] = useState(0);

  const indiceAtivo = Math.max(
    0,
    opcoes.findIndex((opcao) => opcao.valor === valor),
  );

  /*
    A pílula é um retângulo só, que anda — não um fundo que acende e apaga em
    cada segmento. A diferença importa: o movimento é o que liga visualmente
    o "de onde saiu" ao "para onde foi". Sem ele o controle pisca, e piscar
    parece recarregamento.

    A largura vem do layout porque os segmentos são `flex: 1`: só o aparelho
    sabe quanto sobra depois da margem da tela.
  */
  const larguraDoSegmento = larguraDoTrilho
    ? (larguraDoTrilho - RECUO * 2 - FOLGA * (opcoes.length - 1)) / opcoes.length
    : 0;

  const deslocamento = useSharedValue(0);
  const posicionado = useRef(false);
  const destino = RECUO + indiceAtivo * (larguraDoSegmento + FOLGA);

  useEffect(() => {
    if (larguraDoSegmento === 0) return;

    /*
      A primeira posição é posta sem animação: animar a partir do zero faria
      a pílula atravessar a tela quando a tela abre. Quem desligou movimento
      no sistema recebe sempre o salto.
    */
    const semAnimar = !posicionado.current || reduzirMovimento;
    posicionado.current = true;

    deslocamento.value = semAnimar ? destino : withTiming(destino, { duration: DURACAO_MS });
  }, [destino, larguraDoSegmento, reduzirMovimento, deslocamento]);

  const estiloDaPilula = useAnimatedStyle(() => ({
    transform: [{ translateX: deslocamento.value }],
  }));

  function medir(evento: LayoutChangeEvent) {
    setLarguraDoTrilho(evento.nativeEvent.layout.width);
  }

  return (
    <View style={estilos.trilho} accessibilityRole="tablist" onLayout={medir}>
      {larguraDoSegmento > 0 ? (
        <Animated.View
          // Decoração: quem fala é o estado `selected` de cada segmento.
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[estilos.pilula, { width: larguraDoSegmento }, estiloDaPilula]}
        />
      ) : null}

      {opcoes.map((opcao) => {
        const ativo = opcao.valor === valor;
        return (
          <Pressable
            key={opcao.valor}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativo }}
            accessibilityLabel={opcao.rotulo}
            onPress={() => onChange(opcao.valor)}
            style={estilos.segmento}
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
    gap: FOLGA,
    backgroundColor: color.fillTrack,
    borderRadius: radius.field,
    padding: RECUO,
  },
  /** Atrás dos rótulos, por vir antes deles na ordem de pintura. */
  pilula: {
    position: 'absolute',
    top: RECUO,
    bottom: RECUO,
    borderRadius: radius.segmento,
    backgroundColor: color.surface,
    ...shadow.segment,
  },
  segmento: {
    flex: 1,
    minHeight: touch.minTarget,
    borderRadius: radius.segmento,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotulo: { fontSize: 13.5, color: color.inkMuted },
  rotuloAtivo: { color: color.ink },
});
