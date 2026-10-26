import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Botao, EstadoErro, Indicador, Tela } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthContext';
import { useAviso } from '@/features/aviso/AvisoContext';
import { spacing, text } from '@/theme';

export default function TelaEntrando() {
  const router = useRouter();
  const { autenticar, usuarioPendente } = useAuth();
  const aviso = useAviso();

  // O número vem do usuário: conta nova não tem 21 execuções a prometer.
  const legenda = usuarioPendente.totalExecucoes
    ? `trazendo suas ${usuarioPendente.totalExecucoes} execuções e a despensa salva.`
    : 'preparando sua primeira ficha.';
  // Um sinal só impede as duas coisas: navegar para dentro e aplicar a sessão.
  const desistencia = useRef(new AbortController());
  // A falha do servidor, já traduzida pelo contexto. `null` é "ainda esperando".
  const [erro, setErro] = useState<string | null>(null);
  // Sobe a cada "tentar de novo" e é o que reexecuta o efeito.
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();
    desistencia.current = controlador;
    setErro(null);

    autenticar(controlador.signal)
      .then(() => {
        if (!controlador.signal.aborted) router.replace('/inicio');
      })
      .catch((falha: unknown) => {
        // Cancelar não é erro: quem desistiu já está voltando para o login, e
        // mostrar "não consegui entrar" ali seria culpar o usuário pela escolha.
        if (controlador.signal.aborted) return;

        setErro(
          falha instanceof Error && falha.message
            ? falha.message
            : 'não consegui entrar agora. tente de novo.',
        );
      });

    return () => controlador.abort();
  }, [autenticar, router, tentativa]);

  const cancelar = useCallback(() => {
    desistencia.current.abort();
    router.replace('/');
    // Voltar em silêncio deixa a dúvida de ter tocado no lugar certo.
    aviso.mostrar({ texto: 'entrada cancelada' });
  }, [aviso, router]);

  if (erro) {
    return (
      <Tela>
        <EstadoErro
          titulo="não consegui entrar"
          descricao={erro}
          acao={{ rotulo: 'tentar de novo', onPress: () => setTentativa((n) => n + 1) }}
        />

        <View style={estilos.rodape}>
          {/* A segunda saída: insistir pode não ser o que resolve. */}
          <Botao titulo="voltar para a entrada" variante="fantasma" onPress={cancelar} />
        </View>
      </Tela>
    );
  }

  return (
    <Tela>
      <View style={estilos.centro}>
        <Indicador tamanho={40} rotulo="preparando sua cozinha" />
        <Text style={[text.stateTitle, estilos.titulo]}>preparando sua cozinha</Text>
        <Text style={[text.bodyMuted, estilos.legenda]}>{legenda}</Text>
      </View>

      <View style={estilos.rodape}>
        <Botao titulo="cancelar" variante="secundaria" onPress={cancelar} />
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenHWide,
  },
  titulo: { marginTop: spacing.xxl, textAlign: 'center' },
  legenda: { marginTop: 9, textAlign: 'center', paddingHorizontal: spacing.xl },
  rodape: {
    paddingHorizontal: spacing.screenHWide,
    paddingBottom: spacing.huge,
  },
});
