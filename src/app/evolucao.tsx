import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { TiraDeEvolucao } from '@/components/execucao';
import {
  CabecalhoTela,
  Chip,
  EstadoErro,
  EstadoVazio,
  SkeletonFicha,
  Tela,
} from '@/components/ui';
import { listarPratos, obterEstatisticas } from '@/features/execucoes/repositorio';
import { useDonoDosDados } from '@/features/execucoes/useDonoDosDados';
import { useCarregamento } from '@/hooks/useCarregamento';
import { color, radius, spacing, text } from '@/theme';
import { formatarMoeda, formatarNota } from '@/utils/formato';

export default function TelaEvolucao() {
  const router = useRouter();
  const dono = useDonoDosDados();

  const { estado, dados, recarregar } = useCarregamento(
    async () => ({
      pratos: await listarPratos(dono),
      estatisticas: await obterEstatisticas(dono),
    }),
    [dono],
  );

  const comEvolucao = (dados?.pratos ?? []).filter((prato) => prato.tentativas > 1);
  const semDados = estado === 'pronto' && (dados?.estatisticas.execucoes ?? 0) === 0;

  return (
    <Tela edges={['top']}>
      <CabecalhoTela titulo="sua evolução" origem="início" />

      {estado === 'carregando' ? (
        <View style={estilos.margem}>
          <SkeletonFicha quantidade={3} />
        </View>
      ) : null}

      {estado === 'erro' ? (
        <EstadoErro
          titulo="não consegui montar sua evolução"
          descricao="suas execuções continuam salvas. pode ser a conexão."
          acao={{ rotulo: 'tentar de novo', onPress: recarregar }}
        />
      ) : null}

      {semDados ? (
        <EstadoVazio
          titulo="faltam execuções para desenhar sua evolução"
          descricao="registre e repita um prato: é a repetição que mostra se você está melhorando."
          acao={{ rotulo: 'voltar para o início', onPress: () => router.back() }}
        />
      ) : null}

      {estado === 'pronto' && dados && !semDados ? (
        <ScrollView contentContainerStyle={estilos.rolagem} showsVerticalScrollIndicator={false}>
          <View style={estilos.painel}>
            <View style={estilos.numeros}>
              <Metrica valor={String(dados.estatisticas.execucoes)} rotulo="execuções" />
              <View style={estilos.separador} />
              <Metrica valor={formatarNota(dados.estatisticas.notaMedia)} rotulo="nota média" />
              <View style={estilos.separador} />
              <Metrica valor={String(dados.estatisticas.pratos)} rotulo="pratos" />
            </View>

            <Text style={[text.dataMeta, estilos.gasto]}>
              {formatarMoeda(dados.estatisticas.custoTotal)} em ingredientes, desde a primeira ficha
            </Text>
          </View>

          {comEvolucao.length ? (
            <View style={estilos.bloco}>
              <Text style={[text.overline, estilos.rotulo]} accessibilityRole="header">
                a curva de cada prato repetido
              </Text>

              <View style={estilos.lista}>
                {comEvolucao.map((prato) => (
                  <View
                    key={prato.id}
                    style={estilos.linha}
                    // Um nó por prato, em vez de três paradas de foco por linha.
                    accessible
                    accessibilityLabel={
                      `${prato.nome}: de ${formatarNota(prato.evolucao[0])} a ` +
                      `${formatarNota(prato.evolucao[prato.evolucao.length - 1])} ` +
                      `em ${prato.tentativas} tentativas`
                    }
                  >
                    <View style={estilos.identidade}>
                      <Text style={text.dishTitleList} numberOfLines={1}>
                        {prato.nome}
                      </Text>
                      <Text style={[text.dataMeta, estilos.meta]}>
                        {formatarNota(prato.evolucao[0])} →{' '}
                        {formatarNota(prato.evolucao[prato.evolucao.length - 1])} em{' '}
                        {prato.tentativas} tentativas
                      </Text>
                    </View>
                    {/* A tira já está descrita no rótulo da linha. */}
                    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                      <TiraDeEvolucao notas={prato.evolucao} prato={prato.nome} />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={estilos.bloco}>
              <Text style={[text.bodyMuted, estilos.semRepeticao]}>
                você ainda não repetiu nenhum prato. a curva aparece a partir da segunda tentativa
                do mesmo prato.
              </Text>
            </View>
          )}

          {(dados.pratos.some((prato) => prato.defeitoRecorrente)) ? (
            <View style={estilos.bloco}>
              <Text style={[text.overline, estilos.rotulo]} accessibilityRole="header">
                os defeitos que mais voltam
              </Text>
              <View style={estilos.chips}>
                {dados.pratos
                  .filter((prato) => prato.defeitoRecorrente)
                  .map((prato) => (
                    <Chip
                      key={prato.id}
                      texto={`${prato.defeitoRecorrente} · ${prato.nome}`}
                      tipo="defeito"
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

function Metrica({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <View style={estilos.metrica} accessible accessibilityLabel={`${valor} ${rotulo}`}>
      <Text style={[text.metric, estilos.valor]}>{valor}</Text>
      <Text style={[text.bodyMuted, estilos.legenda]}>{rotulo}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  margem: { paddingHorizontal: spacing.screenH, paddingTop: spacing.md },
  rolagem: { paddingHorizontal: spacing.screenH, paddingBottom: spacing.huge },
  // Clara: o fundo escuro é reservado ao resumo, à gravação e ao cronômetro.
  painel: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.borderHairline,
    borderRadius: radius.summary,
    padding: spacing.lg,
  },
  numeros: { flexDirection: 'row', alignItems: 'flex-end' },
  metrica: { flex: 1 },
  valor: { fontSize: 32, lineHeight: 34 },
  legenda: { marginTop: 4, fontSize: 11.5 },
  separador: { width: 1, height: 38, backgroundColor: color.borderHairline },
  gasto: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: color.borderHairline,
  },
  bloco: { marginTop: spacing.xl },
  rotulo: { marginBottom: spacing.sm },
  lista: { gap: spacing.sm },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.borderHairline,
    borderRadius: radius.card,
    padding: 13,
  },
  identidade: { flex: 1, minWidth: 0 },
  meta: { marginTop: 3 },
  semRepeticao: { textAlign: 'center', paddingHorizontal: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
