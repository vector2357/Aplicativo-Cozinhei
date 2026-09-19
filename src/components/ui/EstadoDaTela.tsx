import { StyleSheet, Text, View } from 'react-native';

import { Botao } from './Botao';
import { Icone } from './Icone';
import { color, spacing, text } from '@/theme';

type Props = {
  /** O que aconteceu, em uma linha e em caixa baixa. */
  titulo: string;
  /** Por que está assim, e o que muda isso. */
  descricao: string;
  /** A saída. Estado sem ação é beco. */
  acao?: { rotulo: string; onPress: () => void };
};

export function EstadoVazio({ titulo, descricao, acao }: Props) {
  return (
    <View style={estilos.centro}>
      {/*
        O grupo cobre só o TEXTO. Envolver o botão junto o tiraria da árvore
        de acessibilidade no iOS — e ele é a única saída da tela vazia.
      */}
      <View accessible accessibilityLabel={`${titulo}. ${descricao}`}>
        <Text style={[text.stateTitle, estilos.titulo]}>{titulo}</Text>
        <Text style={[text.bodyMuted, estilos.descricao]}>{descricao}</Text>
      </View>
      {acao ? (
        <Botao
          titulo={acao.rotulo}
          variante="secundaria"
          onPress={acao.onPress}
          style={estilos.acao}
        />
      ) : null}
    </View>
  );
}

export function EstadoErro({ titulo, descricao, acao }: Props) {
  return (
    <View
      style={estilos.centro}
      accessibilityRole="alert"
      // `role="alert"` é dica de papel, não gatilho de anúncio no Android. Sem
      // a região viva, o esqueleto some e o erro entra em silêncio — o usuário
      // segue esperando um carregamento que já falhou.
      accessibilityLiveRegion="assertive"
    >
      {/*
        O triângulo faz o que a cor sozinha não faz: distingue erro de vazio
        para quem não separa vermelho de verde. Decorativo para o leitor de
        tela, que já recebe o texto pelo papel de alerta.
      */}
      <Icone nome="alerta" tamanho={28} cor={color.wine} />
      <Text style={[text.stateTitle, estilos.tituloErro]}>{titulo}</Text>
      <Text style={[text.bodyMuted, estilos.descricao]}>{descricao}</Text>
      {acao ? (
        <Botao
          titulo={acao.rotulo}
          variante="secundaria"
          onPress={acao.onPress}
          style={estilos.acao}
        />
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.huge,
  },
  titulo: { textAlign: 'center' },
  tituloErro: { textAlign: 'center', marginTop: spacing.md },
  descricao: {
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  acao: { marginTop: spacing.lg, minWidth: 200 },
});
