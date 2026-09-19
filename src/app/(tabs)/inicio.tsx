import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CartaoExecucao, CartaoReceitaGuia, CartaoResumoMes } from '@/components/execucao';
import { Botao, SheetEmConstrucao, Tela } from '@/components/ui';
import { useUsuario } from '@/features/auth/AuthContext';
import {
  EXECUCOES_RECENTES,
  RECEITAS_GUIA,
  RESUMO_AGOSTO,
} from '@/features/execucoes/fixtures';
import { DESTINOS } from '@/features/navegacao/destinos';
import { useEmConstrucao } from '@/hooks/useEmConstrucao';
import { color, spacing, text, touch } from '@/theme';
import { dataPorExtenso } from '@/utils/formato';

export default function TelaInicio() {
  const router = useRouter();
  const usuario = useUsuario();
  const emConstrucao = useEmConstrucao();
  const hoje = useMemo(() => dataPorExtenso(new Date()), []);
  // Só o primeiro nome no cumprimento — "oi, Marina Salles" soa a cadastro.
  const primeiroNome = usuario.nome.split(' ')[0];

  return (
    <Tela edges={['top']}>
      <ScrollView contentContainerStyle={estilos.rolagem} showsVerticalScrollIndicator={false}>
        <View style={estilos.margem}>
          <View style={estilos.cabecalho}>
            <View style={estilos.saudacao}>
              <Text style={[text.overline, estilos.data]}>{hoje}</Text>
              <Text style={[text.screenTitleLarge, estilos.oi]}>oi, {primeiroNome}</Text>
            </View>
            <Botao
              titulo={usuario.iniciais}
              variante="secundaria"
              onPress={() => router.navigate('/perfil')}
              style={estilos.avatar}
              accessibilityHint="abre seu perfil"
            />
          </View>

          <View style={estilos.resumo}>
            <CartaoResumoMes
              resumo={RESUMO_AGOSTO}
              onVerEvolucao={() => router.push('/evolucao')}
            />
          </View>

          <Text style={[text.sectionTitle, estilos.secao]}>continuar de onde parou</Text>
          <View style={estilos.listaRecentes}>
            {EXECUCOES_RECENTES.map((execucao) => (
              <CartaoExecucao
                key={execucao.id}
                execucao={execucao}
                onPress={() =>
                  // Rota tipada: o caminho é o do ARQUIVO e o id vai em
                  // `params`. Interpolar a string perde a verificação de tipo.
                  router.push({ pathname: '/execucao/[id]', params: { id: execucao.id } })
                }
              />
            ))}
          </View>

          <View style={estilos.cabecalhoSecao}>
            <Text style={text.sectionTitle}>suas receitas-guia</Text>
            <Botao
              titulo="+ importar"
              variante="fantasma"
              onPress={() => emConstrucao.anunciar(DESTINOS.importarReceita)}
              style={estilos.importar}
              accessibilityHint="explica quando a importação de receitas fica disponível"
            />
          </View>
        </View>

        {/*
          O carrossel sangra até a borda da tela: fica FORA da View de margem
          e repõe o recuo no `contentContainerStyle`. Um cartão cortado na
          margem é o que sinaliza que há mais conteúdo à direita.
        */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={estilos.carrossel}
        >
          {RECEITAS_GUIA.map((receita) => (
            <CartaoReceitaGuia
              key={receita.id}
              receita={receita}
              onPress={() => emConstrucao.anunciar(DESTINOS.receitaGuia)}
            />
          ))}
        </ScrollView>
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
    borderColor: 'rgba(18,33,28,0.12)',
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
