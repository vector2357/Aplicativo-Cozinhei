import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Botao, Indicador, Tela } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthContext';
import { useAviso } from '@/features/aviso/AvisoContext';
import { spacing, text } from '@/theme';

export default function TelaEntrando() {
  const router = useRouter();
  const { autenticar, usuarioPendente } = useAuth();
  const aviso = useAviso();

  /*
    O número vem do usuário, não de um texto fixo. Uma conta recém-criada tem
    zero execuções, e prometer "suas 21 execuções" para ela contradiz os dados
    que o próprio app acabou de gerar.
  */
  const legenda = usuarioPendente.totalExecucoes
    ? `trazendo suas ${usuarioPendente.totalExecucoes} execuções e a despensa salva.`
    : 'preparando sua primeira ficha.';
  /**
   * Um sinal só para as duas coisas que o cancelamento precisa impedir: a
   * navegação para dentro do app, e a sessão ser aplicada quando a promessa
   * em voo resolver.
   */
  const desistencia = useRef(new AbortController());

  useEffect(() => {
    const controlador = new AbortController();
    desistencia.current = controlador;

    autenticar(controlador.signal).then(() => {
      if (!controlador.signal.aborted) router.replace('/inicio');
    });

    return () => controlador.abort();
  }, [autenticar, router]);

  function cancelar() {
    desistencia.current.abort();
    router.replace('/');
    // Voltar para o login sem dizer nada deixa a dúvida de ter tocado no
    // lugar certo. O aviso sobrevive à troca de tela porque vive no layout
    // raiz, fora do Stack.
    aviso.mostrar({ texto: 'entrada cancelada' });
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
