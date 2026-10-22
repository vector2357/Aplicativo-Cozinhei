import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  Botao,
  CabecalhoTela,
  Chip,
  EstadoErro,
  Estrelas,
  MidiaPlaceholder,
  SheetConfirmar,
  SkeletonFicha,
  Tela,
} from '@/components/ui';
import { useAviso } from '@/features/aviso/AvisoContext';
import { buscarExecucao, removerExecucao } from '@/features/execucoes/repositorio';
import { useDonoDosDados } from '@/features/execucoes/useDonoDosDados';
import { useVersaoDosDados } from '@/features/execucoes/versaoDosDados';
import { useCarregamento } from '@/hooks/useCarregamento';
import { color, radius, spacing, text } from '@/theme';
import { formatarMoeda, formatarNota } from '@/utils/formato';

export default function TelaExecucao() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dono = useDonoDosDados();
  // Nas dependências da busca, faz a tela reler depois de uma mutação.
  const versao = useVersaoDosDados();
  const aviso = useAviso();
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false);

  const { estado, dados: execucao, recarregar } = useCarregamento(
    () => buscarExecucao(id, dono),
    [id, dono, versao],
  );

  const naoEncontrada = estado === 'pronto' && !execucao;

  const qualidades = execucao?.chips.filter((chip) => chip.tipo === 'qualidade') ?? [];
  const defeitos = execucao?.chips.filter((chip) => chip.tipo === 'defeito') ?? [];

  return (
    <Tela edges={['top']}>
      <CabecalhoTela
        titulo={execucao ? execucao.prato : 'execução'}
        origem="a lista"
        acao={
          execucao ? (
            <Botao
              titulo="editar"
              variante="secundaria"
              onPress={() => router.push(`/execucao/ficha?id=${execucao.id}`)}
              accessibilityHint="abre a ficha para alterar tempo, custo, nota e chips"
            />
          ) : null
        }
      />

      {estado === 'carregando' ? (
        <View style={estilos.margem}>
          <SkeletonFicha quantidade={2} />
        </View>
      ) : null}

      {estado === 'erro' ? (
        <EstadoErro
          titulo="não consegui abrir esta execução"
          descricao="sua ficha continua salva. pode ser o armazenamento do aparelho."
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
          {/* O número da tentativa vem antes da foto, e maior que ela. */}
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

          {/* Ação destrutiva pede distância: fica no fim, como o "sair da conta". */}
          <View style={estilos.remocao}>
            <Botao
              titulo="remover execução"
              variante="fantasma"
              onPress={() => setConfirmandoRemocao(true)}
              accessibilityHint="pede confirmação antes de apagar esta ficha do aparelho"
            />
          </View>
        </ScrollView>
      ) : null}

      <SheetConfirmar
        visivel={confirmandoRemocao}
        titulo="remover esta execução?"
        descricao={
          execucao
            ? `a tentativa ${execucao.tentativa} de ${execucao.prato} sai do seu histórico e da contagem do prato. não há como desfazer.`
            : 'a ficha sai do seu histórico e da contagem do prato. não há como desfazer.'
        }
        rotuloConfirmar="remover"
        onConfirmar={async () => {
          try {
            await removerExecucao(dono, id);
          } catch {
            // Fechar o sheet antes de ter certeza deixaria a falha invisível:
            // a ficha continuaria na lista sem ninguém dizer por quê.
            aviso.mostrar({
              texto: 'não consegui remover. a ficha continua aqui — tente de novo.',
              tom: 'erro',
            });
            return;
          }

          setConfirmandoRemocao(false);
          router.back();
          aviso.mostrar({ texto: 'execução removida' });
        }}
        onCancelar={() => setConfirmandoRemocao(false)}
      />
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
  remocao: { marginTop: spacing.huge, alignItems: 'center' },
  rotulo: { marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
