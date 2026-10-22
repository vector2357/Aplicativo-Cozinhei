import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CartaoExecucao, TiraDeEvolucao } from '@/components/execucao';
import {
  CabecalhoTela,
  Chip,
  EstadoErro,
  SkeletonFicha,
  Tela,
} from '@/components/ui';
import { buscarPrato, listarExecucoesDoPrato } from '@/features/execucoes/repositorio';
import { useDonoDosDados } from '@/features/execucoes/useDonoDosDados';
import { useVersaoDosDados } from '@/features/execucoes/versaoDosDados';
import { useCarregamento } from '@/hooks/useCarregamento';
import { color, radius, spacing, text } from '@/theme';
import { formatarNota } from '@/utils/formato';

export default function TelaPrato() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dono = useDonoDosDados();
  // Nas dependências da busca, faz a tela reler depois de uma mutação.
  const versao = useVersaoDosDados();

  const { estado, dados, recarregar } = useCarregamento(
    async () => ({
      prato: await buscarPrato(id, dono),
      execucoes: await listarExecucoesDoPrato(id, dono),
    }),
    [id, dono, versao],
  );

  const prato = dados?.prato ?? null;
  // Id inexistente é entrada externa — deep link velho —, não defeito.
  const naoEncontrado = estado === 'pronto' && !prato;

  return (
    <Tela edges={['top']}>
      <CabecalhoTela titulo={prato ? prato.nome : 'prato'} origem="pratos" />

      {estado === 'carregando' ? (
        <View style={estilos.margem}>
          <SkeletonFicha quantidade={3} />
        </View>
      ) : null}

      {estado === 'erro' ? (
        <EstadoErro
          titulo="não consegui abrir este prato"
          descricao="suas execuções continuam salvas. pode ser o armazenamento do aparelho."
          acao={{ rotulo: 'tentar de novo', onPress: recarregar }}
        />
      ) : null}

      {naoEncontrado ? (
        <EstadoErro
          titulo="não encontrei este prato"
          descricao="ele pode ter sido removido, ou o link que você abriu está desatualizado."
          acao={{ rotulo: 'ver todos os pratos', onPress: () => router.back() }}
        />
      ) : null}

      {estado === 'pronto' && prato && dados ? (
        <ScrollView contentContainerStyle={estilos.rolagem} showsVerticalScrollIndicator={false}>
          {/* O painel responde "estou melhorando?" antes de qualquer lista. */}
          <View
            style={estilos.painel}
            accessible
            accessibilityLabel={
              `${prato.tentativas} tentativas, nota média ${formatarNota(prato.notaMedia)}` +
              (prato.tentativas > 1
                ? `, da primeira à última tentativa: ${prato.evolucao.map(formatarNota).join(', ')}`
                : '')
            }
          >
            <View style={estilos.numeros}>
              <View>
                <Text style={text.metric}>{prato.tentativas}</Text>
                <Text style={[text.bodyMuted, estilos.legenda]}>
                  {prato.tentativas === 1 ? 'tentativa' : 'tentativas'}
                </Text>
              </View>

              <View style={estilos.separador} />

              <View>
                {/* Sem âmbar: marca 2.27:1 no branco, e a hierarquia vem do tamanho. */}
                <Text style={text.metric}>{formatarNota(prato.notaMedia)}</Text>
                <Text style={[text.bodyMuted, estilos.legenda]}>nota média</Text>
              </View>
            </View>

            {prato.tentativas > 1 ? (
              <View style={estilos.evolucao}>
                <TiraDeEvolucao notas={prato.evolucao} prato={prato.nome} />
                <Text style={[text.dataMeta, estilos.legendaEvolucao]}>
                  da primeira à última tentativa
                </Text>
              </View>
            ) : null}
          </View>

          {prato.defeitoRecorrente ? (
            <View style={estilos.bloco}>
              <Text style={[text.overline, estilos.rotulo]} accessibilityRole="header">
                o que mais volta
              </Text>
              <View style={estilos.chips}>
                <Chip texto={prato.defeitoRecorrente} tipo="defeito" />
              </View>
            </View>
          ) : null}

          <View style={estilos.bloco}>
            <Text style={[text.overline, estilos.rotulo]} accessibilityRole="header">
              todas as tentativas
            </Text>
            <View style={estilos.lista}>
              {dados.execucoes.map((execucao) => (
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
        </ScrollView>
      ) : null}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  margem: { paddingHorizontal: spacing.screenH, paddingTop: spacing.md },
  rolagem: {
    paddingHorizontal: spacing.screenH,
    paddingBottom: spacing.huge,
  },
  painel: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.borderHairline,
    borderRadius: radius.summary,
    padding: spacing.lg,
  },
  numeros: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xxl },
  legenda: { marginTop: 4 },
  separador: { width: 1, height: 42, backgroundColor: color.borderHairline },
  evolucao: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: color.borderHairline,
  },
  legendaEvolucao: { marginTop: spacing.xs },
  bloco: { marginTop: spacing.xl },
  rotulo: { marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  lista: { gap: spacing.sm },
});
