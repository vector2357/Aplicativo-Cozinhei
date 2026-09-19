import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  CabecalhoTela,
  Chip,
  EstadoErro,
  Estrelas,
  MidiaPlaceholder,
  SkeletonFicha,
  Tela,
} from '@/components/ui';
import { buscarExecucao } from '@/features/execucoes/repositorio';
import { useDonoDosDados } from '@/features/execucoes/useDonoDosDados';
import { useCarregamento } from '@/hooks/useCarregamento';
import { color, radius, spacing, text } from '@/theme';
import { formatarMoeda, formatarNota } from '@/utils/formato';

export default function TelaExecucao() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dono = useDonoDosDados();

  const { estado, dados: execucao, recarregar } = useCarregamento(
    () => buscarExecucao(id, dono),
    [id, dono],
  );

  const naoEncontrada = estado === 'pronto' && !execucao;

  const qualidades = execucao?.chips.filter((chip) => chip.tipo === 'qualidade') ?? [];
  const defeitos = execucao?.chips.filter((chip) => chip.tipo === 'defeito') ?? [];

  return (
    <Tela edges={['top']}>
      <CabecalhoTela titulo={execucao ? execucao.prato : 'execução'} origem="a lista" />

      {estado === 'carregando' ? (
        <View style={estilos.margem}>
          <SkeletonFicha quantidade={2} />
        </View>
      ) : null}

      {estado === 'erro' ? (
        <EstadoErro
          titulo="não consegui abrir esta execução"
          descricao="sua ficha continua salva. pode ser a conexão."
          acao={{ rotulo: 'tentar de novo', onPress: recarregar }}
        />
      ) : null}

      {naoEncontrada ? (
        <EstadoErro
          titulo="não encontrei esta execução"
          descricao="ela pode ter sido removida, ou o link que você abriu está desatualizado."
          acao={{ rotulo: 'voltar', onPress: () => router.back() }}
        />
      ) : null}

      {estado === 'pronto' && execucao ? (
        <ScrollView contentContainerStyle={estilos.rolagem} showsVerticalScrollIndicator={false}>
          {/*
            A calha numerada é o elemento-assinatura do produto: o número da
            tentativa codifica a repetição deliberada, que é o que o app
            acompanha. Por isso ele vem antes da foto, e maior que ela.
          */}
          <View
            style={estilos.cabecalhoFicha}
            accessible
            accessibilityLabel={
              `tentativa ${execucao.tentativa}, ${execucao.prato}, ${execucao.data}, ` +
              `nota ${formatarNota(execucao.nota)} de 5`
            }
          >
            <View style={estilos.calha}>
              <Text style={estilos.numero} maxFontSizeMultiplier={1.3}>
                {execucao.tentativa}
              </Text>
              <Text style={[text.overline, estilos.rotuloCalha]}>tentativa</Text>
            </View>

            <View style={estilos.identidade}>
              <Text style={[text.sectionTitle]} numberOfLines={2}>
                {execucao.prato}
              </Text>
              <Text style={[text.dataMeta, estilos.data]}>{execucao.data}</Text>
              <View style={estilos.nota}>
                <Estrelas nota={execucao.nota} />
              </View>
            </View>
          </View>

          <MidiaPlaceholder altura={180} raio={radius.card} style={estilos.foto} />

          <View style={estilos.medidas}>
            <Medida rotulo="tempo" valor={execucao.tempo} />
            <View style={estilos.separador} />
            <Medida rotulo="custo" valor={formatarMoeda(execucao.custo)} />
          </View>

          {qualidades.length ? (
            <View style={estilos.bloco}>
              <Text style={[text.overline, estilos.rotulo]} accessibilityRole="header">
                o que deu certo
              </Text>
              <View style={estilos.chips}>
                {qualidades.map((chip) => (
                  <Chip key={chip.texto} texto={chip.texto} tipo="qualidade" />
                ))}
              </View>
            </View>
          ) : null}

          {defeitos.length ? (
            <View style={estilos.bloco}>
              <Text style={[text.overline, estilos.rotulo]} accessibilityRole="header">
                o que deu errado
              </Text>
              <View style={estilos.chips}>
                {defeitos.map((chip) => (
                  <Chip key={chip.texto} texto={chip.texto} tipo="defeito" />
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
      ) : null}
    </Tela>
  );
}

/** Um número medido da execução, com seu rótulo. */
function Medida({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={estilos.medida} accessible accessibilityLabel={`${rotulo}: ${valor}`}>
      <Text style={[text.overline, estilos.rotuloMedida]}>{rotulo}</Text>
      <Text style={text.data}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  margem: { paddingHorizontal: spacing.screenH, paddingTop: spacing.md },
  rolagem: { paddingHorizontal: spacing.screenH, paddingBottom: spacing.huge },
  cabecalhoFicha: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  calha: {
    width: 62,
    alignItems: 'center',
    paddingRight: spacing.md,
    borderRightWidth: 1,
    borderRightColor: color.borderHairline,
  },
  numero: { ...text.metric, fontSize: 34, lineHeight: 36 },
  rotuloCalha: { letterSpacing: 0.6, marginTop: 2 },
  identidade: { flex: 1, minWidth: 0 },
  data: { marginTop: 3 },
  nota: { marginTop: spacing.xs, alignItems: 'flex-start' },
  foto: { marginTop: spacing.lg },
  medidas: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: color.borderHairline,
  },
  medida: { flex: 1, gap: 3 },
  rotuloMedida: {},
  separador: { width: 1, height: 32, backgroundColor: color.borderHairline },
  bloco: { marginTop: spacing.lg },
  rotulo: { marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
