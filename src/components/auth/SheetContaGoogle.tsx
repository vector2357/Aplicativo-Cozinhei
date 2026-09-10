/**
 * Tela 03 — escolha de conta Google, como bottom sheet.
 *
 * Não é rota própria: aparece sobre a tela de login ou de cadastro, que
 * ficam esmaecidas atrás do scrim. Toda escolha modal do app é bottom sheet,
 * nunca diálogo centralizado.
 *
 * A frase sobre o que o app recebe não é enfeite jurídico: declarar o
 * escopo no momento da escolha é o que torna a permissão informada.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Botao, BottomSheet, MarcaGoogle } from '@/components/ui';
import { CONTAS_GOOGLE } from '@/features/execucoes/fixtures';
import { color, fontFamily, radius, spacing, text, touch } from '@/theme';

type Conta = { nome: string; email: string; iniciais: string };

type Props = {
  visivel: boolean;
  onFechar: () => void;
  onEscolher: (conta: Conta) => void;
  /** Muda só o verbo da frase de contexto. */
  acao: 'entrar' | 'criar conta';
};

export function SheetContaGoogle({ visivel, onFechar, onEscolher, acao }: Props) {
  return (
    <BottomSheet
      visivel={visivel}
      onFechar={onFechar}
      tituloAcessivel="escolha uma conta Google"
    >
      <View style={estilos.contexto}>
        <MarcaGoogle tamanho={32} />
        <Text style={[text.body, estilos.contextoTexto]}>
          escolha a conta Google para {acao} no <Text style={estilos.marca}>Cozinhei</Text>
        </Text>
      </View>

      <View style={estilos.lista}>
        {CONTAS_GOOGLE.map((conta) => (
          <Pressable
            key={conta.email}
            accessibilityRole="button"
            accessibilityLabel={`${conta.nome}, ${conta.email}`}
            onPress={() => onEscolher(conta)}
            style={({ pressed }) => [estilos.conta, pressed && estilos.pressionado]}
          >
            <View style={estilos.avatar}>
              <Text style={estilos.avatarTexto}>{conta.iniciais}</Text>
            </View>
            <View style={estilos.contaCorpo}>
              <Text style={estilos.contaNome} numberOfLines={1}>
                {conta.nome}
              </Text>
              <Text style={[text.dataMeta, estilos.contaEmail]} numberOfLines={1}>
                {conta.email}
              </Text>
            </View>
          </Pressable>
        ))}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="usar outra conta"
          onPress={() => {}}
          style={({ pressed }) => [estilos.outraConta, pressed && estilos.pressionado]}
        >
          <Text style={[text.body, estilos.outraContaTexto]}>usar outra conta</Text>
        </Pressable>
      </View>

      <Text style={[text.body, estilos.escopo]}>
        o Cozinhei recebe seu nome, e-mail e foto. suas fichas e áudios ficam só no Cozinhei.
      </Text>

      <Botao
        titulo="cancelar"
        variante="secundaria"
        onPress={onFechar}
        style={estilos.cancelar}
      />
    </BottomSheet>
  );
}

const estilos = StyleSheet.create({
  contexto: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  contextoTexto: { flex: 1, fontSize: 13.5, lineHeight: 19, color: color.inkSoft },
  marca: { fontFamily: fontFamily.bodySemibold },
  lista: { gap: 9, marginTop: spacing.lg },
  conta: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: 'rgba(18,33,28,0.1)',
    borderRadius: radius.card,
  },
  pressionado: { opacity: 0.7 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: color.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 14,
    color: color.inkOnDark,
  },
  contaCorpo: { flex: 1, minWidth: 0 },
  contaNome: { fontFamily: fontFamily.bodySemibold, fontSize: 14.5, color: color.ink },
  contaEmail: { marginTop: 3 },
  outraConta: {
    minHeight: 56,
    justifyContent: 'center',
    padding: 13,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: color.borderDashed,
    borderRadius: radius.card,
  },
  outraContaTexto: { fontSize: 13.5, color: color.inkSoft },
  escopo: {
    fontSize: 11.5,
    lineHeight: 17,
    color: color.inkFaint,
    marginTop: spacing.lg,
  },
  cancelar: { marginTop: spacing.md, minHeight: 50, borderRadius: radius.field },
});
