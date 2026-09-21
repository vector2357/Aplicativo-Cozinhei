import { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { Icone } from './Icone';
import { color, interacao, radius, spacing, text, touch } from '@/theme';

type Props = TextInputProps & {
  rotulo: string;
  /** Texto de ajuda abaixo do campo. */
  dica?: string;
  /** Mensagem de erro. Substitui a dica e pinta a borda de vinho. */
  erro?: string;
  /**
   * Campo de senha: esconde o texto e oferece o olho para revelá-lo.
   *
   * Prop própria em vez de `secureTextEntry` solto porque as duas coisas
   * andam juntas — esconder sem dar como conferir é o que faz o usuário
   * errar a senha e não saber onde. Quem escolhe é o campo, não a tela.
   */
  senha?: boolean;
  containerStyle?: ViewStyle;
};

export const Campo = forwardRef<TextInput, Props>(function Campo(
  { rotulo, dica, erro, senha = false, containerStyle, style, ...props },
  ref,
) {
  const [revelada, setRevelada] = useState(false);

  return (
    <View style={containerStyle}>
      <Text style={[text.overline, estilos.rotulo]}>{rotulo}</Text>
      {/*
        O olho é posicionado sobre o campo, então precisa de um pai que seja
        só o campo. Sem esta caixa ele cairia sobre a mensagem de erro, que
        fica abaixo.
      */}
      <View style={estilos.caixa}>
        <TextInput
          ref={ref}
          accessibilityLabel={rotulo}
          placeholderTextColor={color.stone}
          secureTextEntry={senha && !revelada}
          style={[
            estilos.campo,
            text.field,
            erro ? estilos.campoComErro : null,
            senha ? estilos.campoComOlho : null,
            style,
          ]}
          {...props}
        />
        {senha ? (
          <Pressable
            accessibilityRole="button"
            // Diz o que vai acontecer, não o que está acontecendo: o rótulo de
            // um botão é a ação dele.
            accessibilityLabel={revelada ? 'ocultar senha' : 'mostrar senha'}
            accessibilityState={{ selected: revelada }}
            onPress={() => setRevelada((antes) => !antes)}
            style={({ pressed }) => [estilos.olho, pressed && estilos.pressionado]}
          >
            <Icone nome={revelada ? 'olho-fechado' : 'olho'} cor={color.inkMuted} />
          </Pressable>
        ) : null}
      </View>
      {erro ? (
        <Text style={[text.dataMeta, estilos.erro]} accessibilityRole="alert">
          {erro}
        </Text>
      ) : dica ? (
        <Text style={[text.dataMeta, estilos.dica]}>{dica}</Text>
      ) : null}
    </View>
  );
});

const estilos = StyleSheet.create({
  rotulo: { marginBottom: spacing.xs },
  campo: {
    minHeight: touch.field,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.borderStrong,
    borderRadius: radius.field,
    paddingHorizontal: spacing.md,
    // Android centraliza mal sem isso quando minHeight > conteúdo.
    paddingVertical: spacing.sm,
  },
  campoComErro: { borderColor: color.wine },
  /** Abre espaço para o olho não ficar por cima do que se digita. */
  campoComOlho: { paddingRight: touch.minTarget + spacing.xs },
  /*
    Sobreposto ao campo, e não ao lado: pôr os dois em linha encolheria a
    área de digitação em todo aparelho estreito. O alvo tem os 44pt inteiros
    mesmo com o ícone medindo 22.
  */
  caixa: { justifyContent: 'center' },
  olho: {
    position: 'absolute',
    right: spacing.xs,
    width: touch.minTarget,
    height: touch.minTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressionado: { opacity: interacao.opacidadePressionado },
  dica: { marginTop: spacing.xs },
  erro: { marginTop: spacing.xs, color: color.wineInk },
});
