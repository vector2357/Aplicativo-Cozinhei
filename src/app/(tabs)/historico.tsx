import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CartaoExecucao } from '@/components/execucao';
import {
  EstadoErro,
  EstadoVazio,
  SheetEmConstrucao,
  SkeletonFicha,
  Tela,
} from '@/components/ui';
import { listarHistoricoPorMes } from '@/features/execucoes/repositorio';
import { useDonoDosDados } from '@/features/execucoes/useDonoDosDados';
import { DESTINOS } from '@/features/navegacao/destinos';
import { useCarregamento } from '@/hooks/useCarregamento';
import { useEmConstrucao } from '@/hooks/useEmConstrucao';
import { spacing, text } from '@/theme';

export default function TelaHistorico() {
  const router = useRouter();
  const dono = useDonoDosDados();
  const emConstrucao = useEmConstrucao();

  const { estado, dados, recarregar } = useCarregamento(
    () => listarHistoricoPorMes(dono),
    [dono],
  );

  const meses = dados ?? [];
  const vazio = estado === 'pronto' && meses.length === 0;

  return (
    <Tela edges={['top']}>
      <View style={estilos.margem}>
        <Text style={text.screenTitle} accessibilityRole="header">
          histórico
        </Text>
      </View>

      {estado === 'carregando' ? (
        <View style={estilos.conteudoCarregando}>
          <SkeletonFicha quantidade={4} />
        </View>
      ) : null}

      {estado === 'erro' ? (
        <EstadoErro
          titulo="não consegui trazer seu histórico"
          descricao="suas execuções continuam salvas. pode ser a conexão."
          acao={{ rotulo: 'tentar de novo', onPress: recarregar }}
        />
      ) : null}

      {vazio ? (
        <EstadoVazio
          titulo="nenhuma execução ainda"
          descricao="assim que você registrar a primeira, ela aparece aqui — e o app começa a montar sua linha do tempo."
          acao={{
            rotulo: 'como registrar',
            onPress: () => emConstrucao.anunciar(DESTINOS.registrarAMao),
          }}
        />
      ) : null}

      {estado === 'pronto' && !vazio ? (
        <ScrollView contentContainerStyle={estilos.rolagem} showsVerticalScrollIndicator={false}>
          {meses.map((mes) => (
            <View key={mes.rotulo} style={estilos.mes}>
              {/*
                O mês é cabeçalho de verdade: é por ele que o leitor de tela
                salta de período em período, sem percorrer ficha por ficha.
              */}
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

      <SheetEmConstrucao destino={emConstrucao.destino} onFechar={emConstrucao.fechar} />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  margem: { paddingHorizontal: spacing.screenH, paddingTop: spacing.xs },
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
