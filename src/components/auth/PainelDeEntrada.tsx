import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { FormularioCriarConta } from './FormularioCriarConta';
import { FormularioEntrar } from './FormularioEntrar';
import { SheetContaGoogle } from './SheetContaGoogle';
import { SeletorSegmentado, SheetEmConstrucao, Tela } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthContext';
import { DESTINOS } from '@/features/navegacao/destinos';
import { useAlturaDoTeclado } from '@/hooks/useAlturaDoTeclado';
import { useEmConstrucao } from '@/hooks/useEmConstrucao';
import { useLayoutResponsivo } from '@/hooks/useLayoutResponsivo';
import { useReduzirMovimento } from '@/hooks/useReduzirMovimento';
import { color, spacing, text } from '@/theme';

export type AbaDeEntrada = 'entrar' | 'criar';

type Props = {
  /** Qual formulário aparece ao abrir. A troca depois é local. */
  abaInicial: AbaDeEntrada;
};

/** Duração da troca de formulário. Igual à da pílula, para andarem juntos. */
const DURACAO_MS = 220;

export function PainelDeEntrada({ abaInicial }: Props) {
  const router = useRouter();
  const { entrarComGoogle } = useAuth();
  const { compacta } = useLayoutResponsivo();
  const reduzirMovimento = useReduzirMovimento();
  const alturaDoTeclado = useAlturaDoTeclado();
  // Com o teclado aberto, o recuo cresce para sobrar o que rolar até a ação.
  const recuoInferior = alturaDoTeclado ? alturaDoTeclado + spacing.lg : spacing.xxl;

  const [aba, setAba] = useState<AbaDeEntrada>(abaInicial);
  const [sheetGoogle, setSheetGoogle] = useState(false);
  const emConstrucao = useEmConstrucao();

  function aoEscolherConta(conta: { nome: string; email: string; iniciais: string }) {
    setSheetGoogle(false);
    entrarComGoogle(conta);
    router.replace('/entrando');
  }

  // Só opacidade: quem desliza é a pílula do seletor, e ela já basta.
  const entrada = reduzirMovimento ? undefined : FadeIn.duration(DURACAO_MS);
  const saida = reduzirMovimento ? undefined : FadeOut.duration(DURACAO_MS / 2);

  return (
    <Tela>
      <ScrollView
        testID="rolagem-do-formulario"
        style={estilos.preenche}
        // Reservado no conteúdo: com `edgeToEdgeEnabled` a janela não encolhe.
        contentContainerStyle={[estilos.conteudo, { paddingBottom: recuoInferior }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={[estilos.cabecalho, compacta && estilos.cabecalhoCompacto]}>
          <Text style={text.brand}>Cozinhei</Text>
          <Text style={[text.overline, estilos.assinatura]}>
            {aba === 'entrar' ? 'seu diário de cozinha' : 'registre a primeira tentativa hoje'}
          </Text>
        </View>

        <SeletorSegmentado
          valor={aba}
          opcoes={[
            { valor: 'entrar', rotulo: 'entrar' },
            { valor: 'criar', rotulo: 'criar conta' },
          ]}
          onChange={setAba}
        />

        {/* `key` por aba: troca a árvore, dá fim à animação e limpa o estado. */}
        <Animated.View
          key={aba}
          entering={entrada}
          exiting={saida}
          style={estilos.formulario}
        >
          {aba === 'entrar' ? (
            <FormularioEntrar
              onGoogle={() => setSheetGoogle(true)}
              onEmConstrucao={emConstrucao.anunciar}
            />
          ) : (
            <FormularioCriarConta onGoogle={() => setSheetGoogle(true)} />
          )}
        </Animated.View>
      </ScrollView>

      <SheetContaGoogle
        visivel={sheetGoogle}
        acao={aba === 'entrar' ? 'entrar' : 'criar conta'}
        onFechar={() => setSheetGoogle(false)}
        onEscolher={aoEscolherConta}
        onOutraConta={() => {
          setSheetGoogle(false);
          emConstrucao.anunciar(DESTINOS.outraConta);
        }}
      />

      <SheetEmConstrucao destino={emConstrucao.destino} onFechar={emConstrucao.fechar} />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  preenche: { flex: 1 },
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenHWide,
    paddingTop: spacing.lg,
  },
  cabecalho: { marginTop: spacing.xl },
  cabecalhoCompacto: { marginTop: spacing.sm },
  assinatura: { marginTop: spacing.sm, color: color.inkFaint },
  /** Ocupa o que sobra, para o espaçador do formulário ter o que dividir. */
  formulario: { flex: 1 },
});
