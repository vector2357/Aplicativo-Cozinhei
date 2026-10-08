import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  Botao,
  Chip,
  EstadoErro,
  EstadoVazio,
  SheetEmConstrucao,
  SkeletonFicha,
  Tela,
} from '@/components/ui';
import { useAuth, useUsuario } from '@/features/auth/AuthContext';
import { useAviso } from '@/features/aviso/AvisoContext';
import { obterEstatisticas } from '@/features/execucoes/repositorio';
import { useDonoDosDados } from '@/features/execucoes/useDonoDosDados';
import { DESTINOS } from '@/features/navegacao/destinos';
import { useCarregamento } from '@/hooks/useCarregamento';
import { useEmConstrucao } from '@/hooks/useEmConstrucao';
import { color, radius, spacing, text } from '@/theme';
import { formatarMoeda, formatarNota } from '@/utils/formato';

export default function TelaPerfil() {
  const router = useRouter();
  const usuario = useUsuario();
  const { sair } = useAuth();
  const aviso = useAviso();
  const dono = useDonoDosDados();
  const emConstrucao = useEmConstrucao();

  const { estado, dados, recarregar } = useCarregamento(() => obterEstatisticas(dono), [dono]);

  function encerrarSessao() {
    sair();
    router.replace('/');
    aviso.mostrar({ texto: 'você saiu da sua conta' });
  }

  return (
    <Tela edges={['top']}>
      {/* Sem título: a aba já diz "perfil", e quem identifica é o nome abaixo. */}
      <ScrollView contentContainerStyle={estilos.rolagem} showsVerticalScrollIndicator={false}>
        <View style={estilos.identidade} accessible accessibilityLabel={`${usuario.nome}, ${usuario.email}, ${usuario.desde}`}>
          <View style={estilos.avatar}>
            <Text style={estilos.iniciais}>{usuario.iniciais}</Text>
          </View>
          <View style={estilos.dados}>
            <Text style={text.sectionTitle} numberOfLines={1}>
              {usuario.nome}
            </Text>
            <Text style={[text.dataMeta, estilos.email]} numberOfLines={1}>
              {usuario.email}
            </Text>
            <Text style={[text.dataMeta, estilos.desde]}>{usuario.desde}</Text>
          </View>
        </View>

        {estado === 'carregando' ? <SkeletonFicha quantidade={1} /> : null}

        {estado === 'erro' ? (
          <EstadoErro
            titulo="não consegui trazer seus números"
            descricao="seus registros continuam salvos. pode ser a conexão."
            acao={{ rotulo: 'tentar de novo', onPress: recarregar }}
          />
        ) : null}

        {/* Três zeros não oferecem saída; o convite leva ao primeiro registro. */}
        {estado === 'pronto' && dados && !dados.execucoes ? (
          <EstadoVazio
            titulo="seus números começam na primeira execução"
            descricao="assim que você registrar algo, aparecem aqui quantas vezes cozinhou, quantos pratos tem e quanto gastou."
            acao={{ rotulo: 'como registrar', onPress: () => emConstrucao.anunciar(DESTINOS.registrarAMao) }}
          />
        ) : null}

        {estado === 'pronto' && dados && dados.execucoes ? (
          <View style={estilos.painel}>
            <View style={estilos.numeros}>
              <Numero valor={String(dados.execucoes)} rotulo="execuções" />
              <View style={estilos.separador} />
              <Numero valor={String(dados.pratos)} rotulo="pratos" />
              <View style={estilos.separador} />
              <Numero valor={formatarNota(dados.notaMedia)} rotulo="nota média" />
            </View>
            <Text style={[text.dataMeta, estilos.gasto]}>
              {formatarMoeda(dados.custoTotal)} em ingredientes até aqui
            </Text>
          </View>
        ) : null}

        <View style={estilos.bloco}>
          <Text style={[text.overline, estilos.rotulo]} accessibilityRole="header">
            sua despensa
          </Text>
          <Text style={[text.bodyMuted, estilos.explicacao]}>
            os ingredientes que você já usou viram chips aqui, e alimentam o autocompletar do
            registro.
          </Text>
          <View style={estilos.chips}>
            <Chip texto="despensa · etapa 04" />
          </View>
        </View>

        <View style={estilos.bloco}>
          <Text style={[text.overline, estilos.rotulo]} accessibilityRole="header">
            ajustes
          </Text>
          <View style={estilos.lista}>
            <Botao
              titulo="acessibilidade"
              variante="secundaria"
              onPress={() => emConstrucao.anunciar(DESTINOS.ajustesAcessibilidade)}
              accessibilityHint="explica quando os ajustes de acessibilidade ficam disponíveis"
            />
            <Botao
              titulo="retenção de áudio"
              variante="secundaria"
              onPress={() => emConstrucao.anunciar(DESTINOS.retencaoDeAudio)}
              accessibilityHint="explica quando a retenção de áudio fica disponível"
            />
          </View>
        </View>

        {/* Ação destrutiva pede distância: fica no fim, longe das outras. */}
        <View style={estilos.saida}>
          <Botao titulo="sair da conta" variante="fantasma" onPress={encerrarSessao} />
        </View>
      </ScrollView>

      <SheetEmConstrucao destino={emConstrucao.destino} onFechar={emConstrucao.fechar} />
    </Tela>
  );
}

function Numero({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <View style={estilos.numero} accessible accessibilityLabel={`${valor} ${rotulo}`}>
      <Text style={[text.metric, estilos.valor]}>{valor}</Text>
      <Text style={[text.bodyMuted, estilos.legenda]}>{rotulo}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  rolagem: {
    paddingHorizontal: spacing.screenH,
    // Sem título de tela, é este respiro que separa a identidade da barra de status.
    paddingTop: spacing.xl,
    paddingBottom: spacing.scrollBottom,
  },
  identidade: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: color.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iniciais: { ...text.dishTitleList, color: color.inkOnDark, fontSize: 18 },
  dados: { flex: 1, minWidth: 0 },
  email: { marginTop: 3 },
  desde: { marginTop: 2 },
  painel: {
    marginTop: spacing.lg,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.borderHairline,
    borderRadius: radius.summary,
    padding: spacing.lg,
  },
  numeros: { flexDirection: 'row', alignItems: 'flex-end' },
  numero: { flex: 1 },
  valor: { fontSize: 30, lineHeight: 32 },
  legenda: { marginTop: 4, fontSize: 11.5 },
  separador: { width: 1, height: 34, backgroundColor: color.borderHairline },
  gasto: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: color.borderHairline,
  },
  bloco: { marginTop: spacing.xl },
  rotulo: { marginBottom: spacing.sm },
  explicacao: { marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  lista: { gap: spacing.sm },
  saida: { marginTop: spacing.huge, alignItems: 'center' },
});
