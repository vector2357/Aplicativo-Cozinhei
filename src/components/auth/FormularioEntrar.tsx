import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EntradaComGoogle } from './EntradaComGoogle';
import { Botao, Campo } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthContext';
import { ErrosEntrar, semErros, validarEntrar } from '@/features/auth/validacao';
import { DESTINOS } from '@/features/navegacao/destinos';
import type { DestinoEmConstrucao } from '@/components/ui';
import { useErrosFormulario } from '@/hooks/useErrosFormulario';
import { color, radius, spacing, text } from '@/theme';

type Props = {
  /** Abre o sheet de contas Google, que vive no painel. */
  onGoogle: () => void;
  onEmConstrucao: (destino: DestinoEmConstrucao) => void;
};

export function FormularioEntrar({ onGoogle, onEmConstrucao }: Props) {
  const router = useRouter();
  const { entrar } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { erros, definirErros, limparErro } = useErrosFormulario<ErrosEntrar>();

  function aoEntrar() {
    const encontrados = validarEntrar({ email, senha });
    definirErros(encontrados);
    if (!semErros(encontrados)) return;
    entrar({ email, senha });
    router.replace('/entrando');
  }

  return (
    <View style={estilos.preenche}>
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
          senha
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={aoEntrar}
        />
        <Botao
          titulo="esqueci minha senha"
          variante="fantasma"
          onPress={() => onEmConstrucao(DESTINOS.recuperarSenha)}
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

      <EntradaComGoogle titulo="continuar com o Google" onPress={onGoogle} />
    </View>
  );
}

const estilos = StyleSheet.create({
  preenche: { flex: 1 },
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
