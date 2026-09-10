/**
 * Tela 02 — Criar conta.
 *
 * Mesma moldura da tela 01: mesma marca, mesmo seletor segmentado, mesmos
 * campos, mesmo divisor. A repetição é intencional — trocar de aba não pode
 * parecer trocar de aplicativo.
 *
 * Duas diferenças de conteúdo: a assinatura vira um convite à ação
 * ("registre a primeira tentativa hoje") e existe o aceite de termos, que é
 * um alvo de 48pt porque um checkbox de 22pt sozinho é impossível de acertar.
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SheetContaGoogle } from '@/components/auth/SheetContaGoogle';
import { Botao, Campo, Divisor, MarcaGoogle, SeletorSegmentado, Tela } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthContext';
import { ErrosCriarConta, MINIMO_SENHA, semErros, validarCriarConta } from '@/features/auth/validacao';
import { useLayoutResponsivo } from '@/hooks/useLayoutResponsivo';
import { color, radius, spacing, text } from '@/theme';

export default function TelaCriarConta() {
  const router = useRouter();
  const { criarConta, entrarComGoogle } = useAuth();
  const { compacta } = useLayoutResponsivo();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [termos, setTermos] = useState(false);
  const [erros, setErros] = useState<ErrosCriarConta>({});
  const [sheetGoogle, setSheetGoogle] = useState(false);

  function aoCriar() {
    const encontrados = validarCriarConta({ nome, email, senha, termos });
    setErros(encontrados);
    if (!semErros(encontrados)) return;
    criarConta({ nome, email, senha });
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
            <Text style={[text.overline, estilos.assinatura]}>
              registre a primeira tentativa hoje
            </Text>
          </View>

          <SeletorSegmentado
            valor="criar"
            opcoes={[
              { valor: 'entrar', rotulo: 'entrar' },
              { valor: 'criar', rotulo: 'criar conta' },
            ]}
            onChange={(valor) => {
              if (valor === 'entrar') router.replace('/');
            }}
          />

          <View style={estilos.campos}>
            <Campo
              rotulo="como te chamamos"
              placeholder="Marina"
              value={nome}
              onChangeText={setNome}
              erro={erros.nome}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
            />
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
            />
            <Campo
              rotulo="senha"
              placeholder="oito caracteres ou mais"
              dica={`use ${MINIMO_SENHA} caracteres ou mais`}
              value={senha}
              onChangeText={setSenha}
              erro={erros.senha}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              onSubmitEditing={aoCriar}
            />
          </View>

          <View style={estilos.espacador} />

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: termos }}
            accessibilityLabel="aceito os termos de uso e a política de privacidade"
            onPress={() => setTermos((atual) => !atual)}
            style={estilos.termos}
          >
            <View style={[estilos.caixaTermos, termos && estilos.caixaTermosMarcada]}>
              {termos ? <Text style={estilos.marca}>✓</Text> : null}
            </View>
            <Text style={[text.body, estilos.termosTexto]}>
              aceito os termos de uso e a política de privacidade
            </Text>
          </Pressable>
          {erros.termos ? (
            <Text style={[text.dataMeta, estilos.erroTermos]} accessibilityRole="alert">
              {erros.termos}
            </Text>
          ) : null}

          {/* Única ação âmbar da tela. */}
          <Botao titulo="criar minha conta" onPress={aoCriar} style={estilos.acaoPrincipal} />

          <Divisor rotulo="ou" />

          <Botao
            titulo="criar conta com o Google"
            variante="secundaria"
            icone={<MarcaGoogle />}
            onPress={() => setSheetGoogle(true)}
            accessibilityHint="abre a lista de contas Google deste aparelho"
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <SheetContaGoogle
        visivel={sheetGoogle}
        acao="criar conta"
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
  espacador: { flex: 1, minHeight: spacing.lg },
  termos: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 6,
  },
  caixaTermos: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(18,33,28,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caixaTermosMarcada: { backgroundColor: color.ink, borderColor: color.ink },
  marca: { color: color.inkOnDark, fontSize: 12, lineHeight: 14 },
  termosTexto: { flex: 1, fontSize: 12.5, lineHeight: 18, color: color.inkSoft },
  erroTermos: { color: color.wineInk, marginTop: 2 },
  acaoPrincipal: { marginTop: spacing.md },
});
