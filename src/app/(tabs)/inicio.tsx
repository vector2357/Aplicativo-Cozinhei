import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CartaoExecucao, CartaoReceitaGuia, CartaoResumoMes } from '@/components/execucao';
import {
  Botao,
  EstadoErro,
  EstadoVazio,
  SheetEmConstrucao,
  SkeletonFicha,
  Tela,
} from '@/components/ui';
import { useUsuario } from '@/features/auth/AuthContext';
import {
  listarExecucoesRecentes,
  listarReceitasGuia,
  obterResumoDoMes,
} from '@/features/execucoes/repositorio';
import { useDonoDosDados } from '@/features/execucoes/useDonoDosDados';
import { useVersaoDosDados } from '@/features/execucoes/versaoDosDados';
import { DESTINOS } from '@/features/navegacao/destinos';
import { useCarregamento } from '@/hooks/useCarregamento';
import { useEmConstrucao } from '@/hooks/useEmConstrucao';
import { color, spacing, text, touch } from '@/theme';
import { dataPorExtenso } from '@/utils/formato';

export default function TelaInicio() {
  const router = useRouter();
  const usuario = useUsuario();
  const dono = useDonoDosDados();
  // Nas dependências da busca, faz a tela reler depois de uma mutação.
  const versao = useVersaoDosDados();
  const emConstrucao = useEmConstrucao();
  const hoje = useMemo(() => dataPorExtenso(new Date()), []);
  // Só o primeiro nome no cumprimento — "oi, Marina Salles" soa a cadastro.
  const primeiroNome = usuario.nome.split(' ')[0];

  const { estado, dados, recarregar } = useCarregamento(
    async () => ({
      resumo: await obterResumoDoMes(dono),
      recentes: await listarExecucoesRecentes(dono),
      guias: await listarReceitasGuia(dono),
    }),
    [dono, versao],
  );

  const semNada = estado === 'pronto' && dados?.recentes.length === 0;

  return (
    <Tela edges={['top']}>
      <ScrollView
        contentContainerStyle={[estilos.rolagem, semNada && estilos.rolagemVazia]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[estilos.margem, semNada && estilos.margemVazia]}>
          <View style={estilos.cabecalho}>
            <View style={estilos.saudacao}>
              <Text style={[text.overline, estilos.data]}>{hoje}</Text>
              <Text style={[text.screenTitleLarge, estilos.oi]} accessibilityRole="header">
                oi, {primeiroNome}
              </Text>
            </View>
            <Botao
              titulo={usuario.iniciais}
              variante="secundaria"
              onPress={() => router.navigate('/perfil')}
              style={estilos.avatar}
              accessibilityLabel={`perfil de ${usuario.nome}`}
              accessibilityHint="abre seu perfil"
            />
          </View>

          {estado === 'carregando' ? (
            <View style={estilos.resumo}>
              <SkeletonFicha quantidade={2} />
            </View>
          ) : null}

          {estado === 'erro' ? (
            <EstadoErro
              titulo="não consegui trazer sua cozinha"
              descricao="seus registros continuam salvos. pode ser o armazenamento do aparelho."
              acao={{ rotulo: 'tentar de novo', onPress: recarregar }}
            />
          ) : null}

          {/* O cartão do mês com zeros seria pior que cartão nenhum. */}
          {semNada ? (
            <EstadoVazio
              titulo="sua cozinha começa aqui"
              descricao="registre a primeira execução e o app passa a mostrar sua evolução, o que deu certo e o que mais volta a dar errado."
              acao={{
                rotulo: 'registrar a primeira',
                onPress: () => router.push('/execucao/ficha'),
              }}
            />
          ) : null}

          {estado === 'pronto' && dados && !semNada ? (
            <>
              <View style={estilos.resumo}>
                <CartaoResumoMes
                  resumo={dados.resumo}
                  onVerEvolucao={() => router.push('/evolucao')}
                />
              </View>

              <Text style={[text.sectionTitle, estilos.secao]} accessibilityRole="header">
                continuar de onde parou
              </Text>
              <View style={estilos.listaRecentes}>
                {dados.recentes.map((execucao) => (
                  <CartaoExecucao
                    key={execucao.id}
                    execucao={execucao}
                    onPress={() =>
                      router.push({ pathname: '/execucao/[id]', params: { id: execucao.id } })
                    }
                  />
                ))}
              </View>

              <View style={estilos.cabecalhoSecao}>
                <Text style={text.sectionTitle} accessibilityRole="header">
                  suas receitas-guia
                </Text>
                <Botao
                  titulo="+ importar"
                  variante="fantasma"
                  onPress={() => emConstrucao.anunciar(DESTINOS.importarReceita)}
                  style={estilos.importar}
                  accessibilityHint="explica quando a importação de receitas fica disponível"
                />
              </View>
            </>
          ) : null}
        </View>

        {/* Sangra até a borda: cartão cortado é o que sinaliza mais conteúdo. */}
        {estado === 'pronto' && dados && !semNada ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={estilos.carrossel}
          >
            {dados.guias.map((receita) => (
              <CartaoReceitaGuia
                key={receita.id}
                receita={receita}
                onPress={() => emConstrucao.anunciar(DESTINOS.receitaGuia)}
              />
            ))}
          </ScrollView>
        ) : null}
      </ScrollView>

      <SheetEmConstrucao destino={emConstrucao.destino} onFechar={emConstrucao.fechar} />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  rolagem: { paddingTop: spacing.xs, paddingBottom: spacing.scrollBottom },
  // `flexGrow` é o que dá altura ao convite para ele se centralizar.
  rolagemVazia: { flexGrow: 1 },
  /** O `flexGrow` acima só chega ao convite se a margem também crescer. */
  margemVazia: { flex: 1 },
  margem: { paddingHorizontal: spacing.screenH },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  saudacao: { flex: 1, minWidth: 0 },
  data: { letterSpacing: 1.2 },
  oi: { marginTop: 6 },
  avatar: {
    width: touch.minTarget,
    height: touch.minTarget,
    minHeight: touch.minTarget,
    borderRadius: 14,
    borderColor: color.borderStrong,
    backgroundColor: color.surface,
    paddingHorizontal: 0,
  },
  resumo: { marginTop: spacing.xl },
  secao: { marginTop: spacing.xxl, marginBottom: spacing.md },
  listaRecentes: { gap: spacing.sm },
  cabecalhoSecao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  importar: { marginRight: -8 },
  carrossel: { gap: spacing.sm, paddingHorizontal: spacing.screenH, paddingBottom: 4 },
});
