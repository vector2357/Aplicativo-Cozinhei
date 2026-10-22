import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CartaoPrato } from '@/components/execucao';
import {
  CabecalhoDeAba,
  EstadoErro,
  EstadoVazio,
  SkeletonFicha,
  Tela,
} from '@/components/ui';
import { listarPratos } from '@/features/execucoes/repositorio';
import { useDonoDosDados } from '@/features/execucoes/useDonoDosDados';
import { useVersaoDosDados } from '@/features/execucoes/versaoDosDados';
import { useCarregamento } from '@/hooks/useCarregamento';
import { spacing, text } from '@/theme';

export default function TelaPratos() {
  const router = useRouter();
  const dono = useDonoDosDados();
  // Nas dependências da busca, faz a tela reler depois de uma mutação.
  const versao = useVersaoDosDados();

  const { estado, dados, recarregar } = useCarregamento(
    () => listarPratos(dono),
    [dono, versao],
  );

  // Repetir é o que o app acompanha, então vem primeiro.
  const { repetindo, primeiraVez } = useMemo(() => {
    const pratos = dados ?? [];
    return {
      repetindo: pratos.filter((prato) => prato.tentativas > 1),
      primeiraVez: pratos.filter((prato) => prato.tentativas === 1),
    };
  }, [dados]);

  const vazio = estado === 'pronto' && (dados?.length ?? 0) === 0;

  return (
    <Tela edges={['top']}>
      <CabecalhoDeAba titulo="pratos" />

      {estado === 'carregando' ? (
        <View style={estilos.conteudoCarregando}>
          <SkeletonFicha quantidade={3} />
        </View>
      ) : null}

      {estado === 'erro' ? (
        <EstadoErro
          titulo="não consegui trazer seus pratos"
          descricao="suas execuções continuam salvas. pode ser o armazenamento do aparelho."
          acao={{ rotulo: 'tentar de novo', onPress: recarregar }}
        />
      ) : null}

      {vazio ? (
        <EstadoVazio
          titulo="nenhum prato ainda"
          descricao="cada execução que você registrar entra num prato. quando repetir o mesmo prato, aparece aqui a curva da sua nota."
          acao={{
            rotulo: 'registrar a primeira',
            onPress: () => router.push('/execucao/ficha'),
          }}
        />
      ) : null}

      {estado === 'pronto' && !vazio ? (
        <ScrollView contentContainerStyle={estilos.rolagem} showsVerticalScrollIndicator={false}>
          {repetindo.length ? (
            <View style={estilos.grupo}>
              <Text style={[text.overline, estilos.rotuloGrupo]} accessibilityRole="header">
                você está repetindo
              </Text>
              <View style={estilos.lista}>
                {repetindo.map((prato) => (
                  <CartaoPrato
                    key={prato.id}
                    prato={prato}
                    onPress={() =>
                      router.push({ pathname: '/prato/[id]', params: { id: prato.id } })
                    }
                  />
                ))}
              </View>
            </View>
          ) : null}

          {primeiraVez.length ? (
            <View style={estilos.grupo}>
              <Text style={[text.overline, estilos.rotuloGrupo]} accessibilityRole="header">
                ainda na primeira vez
              </Text>
              <View style={estilos.lista}>
                {primeiraVez.map((prato) => (
                  <CartaoPrato
                    key={prato.id}
                    prato={prato}
                    onPress={() =>
                      router.push({ pathname: '/prato/[id]', params: { id: prato.id } })
                    }
                  />
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
      ) : null}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  conteudoCarregando: { paddingHorizontal: spacing.screenH, paddingTop: spacing.lg },
  rolagem: {
    paddingHorizontal: spacing.screenH,
    paddingTop: spacing.md,
    paddingBottom: spacing.scrollBottom,
  },
  grupo: { marginBottom: spacing.xl },
  rotuloGrupo: { marginBottom: spacing.sm },
  lista: { gap: spacing.sm },
});
