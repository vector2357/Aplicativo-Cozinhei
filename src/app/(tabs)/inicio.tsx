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
import { DESTINOS } from '@/features/navegacao/destinos';
import { useCarregamento } from '@/hooks/useCarregamento';
import { useEmConstrucao } from '@/hooks/useEmConstrucao';
import { color, spacing, text, touch } from '@/theme';
import { dataPorExtenso } from '@/utils/formato';

export default function TelaInicio() {
  const router = useRouter();
  const usuario = useUsuario();
  const dono = useDonoDosDados();
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
    [dono],
  );

  const semNada = estado === 'pronto' && dados?.recentes.length === 0;

  return (
    <Tela edges={['top']}>
      <ScrollView contentContainerStyle={estilos.rolagem} showsVerticalScrollIndicator={false}>
        <View style={estilos.margem}>
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
              descricao="seus registros continuam salvos. pode ser a conexão."
              acao={{ rotulo: 'tentar de novo', onPress: recarregar }}
            />
          ) : null}

          {/*
            Conta nova não tem resumo, nem recentes, nem guias. Mostrar o
            cartão do mês com zeros seria pior que não mostrar: ele existe
            para responder "estou melhorando?", e não há o que responder.
          */}
          {semNada ? (
            <EstadoVazio
              titulo="sua cozinha começa aqui"
              descricao="registre a primeira execução e o app passa a mostrar sua evolução, o que deu certo e o que mais volta a dar errado."
              acao={{
                rotulo: 'como registrar',
                onPress: () => emConstrucao.anunciar(DESTINOS.registrarAMao),
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

        {/*
          O carrossel sangra até a borda da tela: fica FORA da View de margem
          e repõe o recuo no `contentContainerStyle`. Um cartão cortado na
          margem é o que sinaliza que há mais conteúdo à direita.
        */}
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
