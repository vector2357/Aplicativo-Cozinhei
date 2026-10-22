import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CartaoExecucao } from '@/components/execucao';
import {
  CabecalhoDeAba,
  EstadoErro,
  EstadoVazio,
  SkeletonFicha,
  Tela,
} from '@/components/ui';
import { listarHistoricoPorMes } from '@/features/execucoes/repositorio';
import { useDonoDosDados } from '@/features/execucoes/useDonoDosDados';
import { useVersaoDosDados } from '@/features/execucoes/versaoDosDados';
import { useCarregamento } from '@/hooks/useCarregamento';
import { spacing, text } from '@/theme';

export default function TelaHistorico() {
  const router = useRouter();
  const dono = useDonoDosDados();
  // Nas dependências da busca, faz a tela reler depois de uma mutação.
  const versao = useVersaoDosDados();

  const { estado, dados, recarregar } = useCarregamento(
    () => listarHistoricoPorMes(dono),
    [dono, versao],
  );

  const meses = dados ?? [];
  const vazio = estado === 'pronto' && meses.length === 0;

  return (
    <Tela edges={['top']}>
      <CabecalhoDeAba titulo="histórico" />

      {estado === 'carregando' ? (
        <View style={estilos.conteudoCarregando}>
          <SkeletonFicha quantidade={4} />
        </View>
      ) : null}

      {estado === 'erro' ? (
        <EstadoErro
          titulo="não consegui trazer seu histórico"
          descricao="suas execuções continuam salvas. pode ser o armazenamento do aparelho."
          acao={{ rotulo: 'tentar de novo', onPress: recarregar }}
        />
      ) : null}

      {vazio ? (
        <EstadoVazio
          titulo="nenhuma execução ainda"
          descricao="assim que você registrar a primeira, ela aparece aqui — e o app começa a montar sua linha do tempo."
          acao={{
            rotulo: 'registrar a primeira',
            onPress: () => router.push('/execucao/ficha'),
          }}
        />
      ) : null}

      {estado === 'pronto' && !vazio ? (
        <ScrollView contentContainerStyle={estilos.rolagem} showsVerticalScrollIndicator={false}>
          {meses.map((mes) => (
            <View key={mes.rotulo} style={estilos.mes}>
              {/* Cabeçalho de verdade: é por ele que o leitor salta de mês em mês. */}
              <Text style={[text.overline, estilos.rotuloMes]} accessibilityRole="header">
                {mes.rotulo}
              </Text>

              <View style={estilos.fichas}>
                {mes.execucoes.map((execucao) => (
                  <CartaoExecucao
                    key={execucao.id}
                    execucao={execucao}
                    variante="ficha"
                    onPress={() =>
                      router.push({ pathname: '/execucao/[id]', params: { id: execucao.id } })
                    }
                  />
                ))}
              </View>
            </View>
          ))}
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
  mes: { marginBottom: spacing.xl },
  rotuloMes: { marginBottom: spacing.sm },
  fichas: { gap: spacing.sm },
});
