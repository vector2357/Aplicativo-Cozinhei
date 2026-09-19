import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { SheetContaGoogle } from '@/components/auth/SheetContaGoogle';
import {
  Botao,
  Campo,
  Divisor,
  MarcaGoogle,
  SeletorSegmentado,
  SheetEmConstrucao,
  Tela,
} from '@/components/ui';
import { useAuth } from '@/features/auth/AuthContext';
import { ErrosEntrar, semErros, validarEntrar } from '@/features/auth/validacao';
import { DESTINOS } from '@/features/navegacao/destinos';
import { useEmConstrucao } from '@/hooks/useEmConstrucao';
import { useErrosFormulario } from '@/hooks/useErrosFormulario';
import { useAlturaDoTeclado } from '@/hooks/useAlturaDoTeclado';
import { useLayoutResponsivo } from '@/hooks/useLayoutResponsivo';
import { color, radius, spacing, text } from '@/theme';

export default function TelaEntrar() {
  const router = useRouter();
  const { entrar, entrarComGoogle } = useAuth();
  const { compacta } = useLayoutResponsivo();
  const alturaDoTeclado = useAlturaDoTeclado();
  // Com o teclado aberto, o recuo é a altura dele mais o respiro de sempre:
  // é o que faz sobrar conteúdo para rolar até a ação principal.
  const recuoInferior = alturaDoTeclado ? alturaDoTeclado + spacing.lg : spacing.xxl;

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { erros, definirErros, limparErro } = useErrosFormulario<ErrosEntrar>();
  const [sheetGoogle, setSheetGoogle] = useState(false);
  const emConstrucao = useEmConstrucao();

  function aoEntrar() {
    const encontrados = validarEntrar({ email, senha });
    definirErros(encontrados);
    if (!semErros(encontrados)) return;
    entrar({ email, senha });
    router.replace('/entrando');
  }

  function aoEscolherConta(conta: { nome: string; email: string; iniciais: string }) {
    setSheetGoogle(false);
    entrarComGoogle(conta);
    router.replace('/entrando');
  }

  return (
    <Tela>
      <ScrollView
        testID="rolagem-do-formulario"
        style={estilos.preenche}
        /*
          O espaço do teclado é reservado no PRÓPRIO conteúdo, e não por um
          `KeyboardAvoidingView`: com `edgeToEdgeEnabled` no `app.json` a
          janela do Android não é redimensionada quando o teclado sobe, e a
          moldura não tinha o que encolher. Sem esta reserva, a ação principal
          ficava atrás do teclado e não havia excesso para rolar até ela.
        */
        contentContainerStyle={[estilos.conteudo, { paddingBottom: recuoInferior }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
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
              onChangeText={(valor) => {
                setEmail(valor);
                limparErro('email');
              }}
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
              onChangeText={(valor) => {
                setSenha(valor);
                limparErro('senha');
              }}
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
              onPress={() => emConstrucao.anunciar(DESTINOS.recuperarSenha)}
              style={estilos.esqueci}
              accessibilityHint="explica quando a recuperação de senha fica disponível"
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

      <SheetContaGoogle
        visivel={sheetGoogle}
        acao="entrar"
        onFechar={() => setSheetGoogle(false)}
        onEscolher={aoEscolherConta}
        onOutraConta={() => {
          setSheetGoogle(false);
          emConstrucao.anunciar(DESTINOS.outraConta);
        }}
      />

      <SheetEmConstrucao destino={emConstrucao.destino} onFechar={emConstrucao.fechar} />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  preenche: { flex: 1 },
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenHWide,
    paddingTop: spacing.lg,
  },
  cabecalho: { marginTop: spacing.xl },
  cabecalhoCompacto: { marginTop: spacing.sm },
  assinatura: { marginTop: spacing.sm, color: color.inkFaint },
  campos: { gap: spacing.sm, marginTop: spacing.xl },
  // Alinha o texto do link à margem apesar do padding que garante os 44pt.
  esqueci: { alignSelf: 'flex-start', marginLeft: -8 },
  espacador: { flex: 1, minHeight: spacing.lg },
  promessa: {
    backgroundColor: color.fillSubtle,
    borderWidth: 1,
    borderColor: color.borderHairline,
    borderRadius: radius.field,
    padding: 13,
  },
  promessaTexto: { fontSize: 12.5, lineHeight: 19, color: color.inkSoft },
  acaoPrincipal: { marginTop: spacing.lg },
});
