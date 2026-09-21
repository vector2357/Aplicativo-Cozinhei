import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EntradaComGoogle } from './EntradaComGoogle';
import { Botao, Campo } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthContext';
import {
  ErrosCriarConta,
  MINIMO_SENHA,
  semErros,
  validarCriarConta,
} from '@/features/auth/validacao';
import { useErrosFormulario } from '@/hooks/useErrosFormulario';
import { color, spacing, text } from '@/theme';

type Props = {
  /** Abre o sheet de contas Google, que vive no painel. */
  onGoogle: () => void;
};

export function FormularioCriarConta({ onGoogle }: Props) {
  const router = useRouter();
  const { criarConta } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [termos, setTermos] = useState(false);
  const { erros, definirErros, limparErro } = useErrosFormulario<ErrosCriarConta>();

  function aoCriar() {
    const encontrados = validarCriarConta({ nome, email, senha, termos });
    definirErros(encontrados);
    if (!semErros(encontrados)) return;
    criarConta({ nome, email, senha });
    router.replace('/entrando');
  }

  function alternarTermos() {
    setTermos((atual) => !atual);
    limparErro('termos');
  }

  return (
    <View style={estilos.preenche}>
      <View style={estilos.campos}>
        <Campo
          rotulo="como te chamamos"
          placeholder="Marina"
          value={nome}
          onChangeText={(valor) => {
            setNome(valor);
            limparErro('nome');
          }}
          erro={erros.nome}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
        />
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
        />
        <Campo
          rotulo="senha"
          placeholder="oito caracteres ou mais"
          dica={`use ${MINIMO_SENHA} caracteres ou mais`}
          value={senha}
          onChangeText={(valor) => {
            setSenha(valor);
            limparErro('senha');
          }}
          erro={erros.senha}
          senha
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
        onPress={alternarTermos}
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

      <EntradaComGoogle titulo="criar conta com o Google" onPress={onGoogle} />
    </View>
  );
}

const estilos = StyleSheet.create({
  preenche: { flex: 1 },
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
    borderColor: color.borderControl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caixaTermosMarcada: { backgroundColor: color.ink, borderColor: color.ink },
  marca: { color: color.inkOnDark, fontSize: 12, lineHeight: 14 },
  termosTexto: { flex: 1, fontSize: 12.5, lineHeight: 18, color: color.inkSoft },
  erroTermos: { color: color.wineInk, marginTop: 2 },
  acaoPrincipal: { marginTop: spacing.md },
});
