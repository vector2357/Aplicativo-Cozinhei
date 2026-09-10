/**
 * Tela 01 — Entrar. Tela inicial da aplicação.
 *
 * Estrutura (protótipo, tela 01): marca, seletor entrar/criar, e-mail e
 * senha, promessa de continuidade, ação principal na zona do polegar,
 * divisor "ou" e entrada pelo Google.
 *
 * A escolha de conta Google é um BOTTOM SHEET sobre esta tela (tela 03), não
 * uma rota: é uma escolha modal, e toda escolha modal no app é bottom sheet.
 *
 * Um detalhe de layout que parece bobo e não é: o espaçador `flex: 1` entre
 * os campos e a ação principal só empurra o botão para baixo quando sobra
 * altura. Em tela curta o ScrollView assume e nada fica inalcançável.
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SheetContaGoogle } from '@/components/auth/SheetContaGoogle';
import { Botao, Campo, Divisor, MarcaGoogle, SeletorSegmentado, Tela } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthContext';
import { ErrosEntrar, semErros, validarEntrar } from '@/features/auth/validacao';
import { useLayoutResponsivo } from '@/hooks/useLayoutResponsivo';
import { color, radius, spacing, text } from '@/theme';

export default function TelaEntrar() {
  const router = useRouter();
  const { entrar, entrarComGoogle } = useAuth();
  const { compacta } = useLayoutResponsivo();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<ErrosEntrar>({});
  const [sheetGoogle, setSheetGoogle] = useState(false);

  function aoEntrar() {
    const encontrados = validarEntrar({ email, senha });
    setErros(encontrados);
    if (!semErros(encontrados)) return;
    entrar({ email, senha });
    router.push('/entrando');
  }

  function aoEscolherConta(conta: { nome: string; email: string; iniciais: string }) {
    setSheetGoogle(false);
    entrarComGoogle(conta);
    router.push('/entrando');
  }

  return (
    <Tela>
      <KeyboardAvoidingView
        style={estilos.preenche}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={estilos.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[estilos.cabecalho, compacta && estilos.cabecalhoCompacto]}>
            <Text style={text.brand}>Cozinhei</Text>
            <Text style={[text.overline, estilos.assinatura]}>seu diário de cozinha</Text>
          </View>

          <SeletorSegmentado
            valor="entrar"
            opcoes={[
              { valor: 'entrar', rotulo: 'entrar' },
              { valor: 'criar', rotulo: 'criar conta' },
            ]}
            onChange={(valor) => {
              if (valor === 'criar') router.replace('/criar-conta');
            }}
          />

          <View style={estilos.campos}>
            <Campo
              rotulo="e-mail"
              placeholder="marina@email.com"
              value={email}
              onChangeText={setEmail}
              erro={erros.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
            />
            <Campo
              rotulo="senha"
              placeholder="••••••••"
              value={senha}
              onChangeText={setSenha}
              erro={erros.senha}
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={aoEntrar}
            />
            <Botao
              titulo="esqueci minha senha"
              variante="fantasma"
              onPress={() => {}}
              style={estilos.esqueci}
            />
          </View>

          <View style={estilos.espacador} />

          <View style={estilos.promessa}>
            <Text style={[text.body, estilos.promessaTexto]}>
              seu histórico continua onde parou, mesmo se você trocar de celular.
            </Text>
          </View>

          {/* Única ação âmbar da tela. */}
          <Botao titulo="entrar" onPress={aoEntrar} style={estilos.acaoPrincipal} />

          <Divisor rotulo="ou" />

          <Botao
            titulo="continuar com o Google"
            variante="secundaria"
            icone={<MarcaGoogle />}
            onPress={() => setSheetGoogle(true)}
            accessibilityHint="abre a lista de contas Google deste aparelho"
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <SheetContaGoogle
        visivel={sheetGoogle}
        acao="entrar"
        onFechar={() => setSheetGoogle(false)}
        onEscolher={aoEscolherConta}
      />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  preenche: { flex: 1 },
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenHWide,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  cabecalho: { marginTop: spacing.xl },
  cabecalhoCompacto: { marginTop: spacing.sm },
  assinatura: { marginTop: spacing.sm, fontSize: 11, color: color.inkFaint },
  campos: { gap: spacing.sm, marginTop: spacing.xl },
  // Alinha o texto do link à margem apesar do padding que garante os 44pt.
  esqueci: { alignSelf: 'flex-start', marginLeft: -8 },
  espacador: { flex: 1, minHeight: spacing.lg },
  promessa: {
    backgroundColor: 'rgba(18,33,28,0.04)',
    borderWidth: 1,
    borderColor: color.borderHairline,
    borderRadius: radius.field,
    padding: 13,
  },
  promessaTexto: { fontSize: 12.5, lineHeight: 19, color: color.inkSoft },
  acaoPrincipal: { marginTop: spacing.lg },
});
