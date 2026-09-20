import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/features/auth/AuthContext';
import { AvisoProvider } from '@/features/aviso/AvisoContext';
import { touch } from '@/theme';

/** O nó devolvido pelas consultas do testing-library. */
type No = ReturnType<typeof screen.getByRole>;

const METRICAS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), navigate: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ id: 'p1' }),
  Redirect: () => null,
  Stack: () => null,
}));

import TelaCriarConta from '@/app/criar-conta';
import TelaEntrar from '@/app/index';
import TelaEvolucao from '@/app/evolucao';
import TelaExecucao from '@/app/execucao/[id]';
import TelaHistorico from '@/app/(tabs)/historico';
import TelaInicio from '@/app/(tabs)/inicio';
import TelaPerfil from '@/app/(tabs)/perfil';
import TelaPrato from '@/app/prato/[id]';
import TelaPratos from '@/app/(tabs)/pratos';

const comSessao = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaProvider initialMetrics={METRICAS}>
    <AuthProvider>
      <AvisoProvider>{children}</AvisoProvider>
    </AuthProvider>
  </SafeAreaProvider>
);

/** As nove telas do app. A varredura roda em todas, não numa amostra. */
const TELAS = [
  { nome: '/', Tela: TelaEntrar },
  { nome: '/criar-conta', Tela: TelaCriarConta },
  { nome: '/inicio', Tela: TelaInicio },
  { nome: '/historico', Tela: TelaHistorico },
  { nome: '/pratos', Tela: TelaPratos },
  { nome: '/perfil', Tela: TelaPerfil },
  { nome: '/prato/[id]', Tela: TelaPrato },
  { nome: '/execucao/[id]', Tela: TelaExecucao },
  { nome: '/evolucao', Tela: TelaEvolucao },
] as const;

/** Papéis que o usuário pode acionar — os que estas duas regras cobrem. */
const PAPEIS_ACIONAVEIS = ['button', 'link', 'tab', 'checkbox', 'switch'];

function estiloAchatado(no: No): Record<string, unknown> {
  const plano: Record<string, unknown> = {};
  const empilhar = (valor: unknown) => {
    if (Array.isArray(valor)) valor.forEach(empilhar);
    else if (valor && typeof valor === 'object') Object.assign(plano, valor);
  };
  empilhar(no.props.style);
  return plano;
}

/**
 * A altura que o dedo alcança: a caixa mais o `hitSlop`.
 *
 * `hitSlop` conta porque é exatamente o recurso que a regra do projeto manda
 * usar quando o visual precisa ser menor que 44pt — "aumente a área, nunca
 * reduza o alvo". Um ícone de 24pt com 12pt de folga em cima e embaixo é um
 * alvo de 48pt, e reprová-lo seria ler a regra ao contrário.
 */
function alturaTocavel(no: No): number | null {
  const estilo = estiloAchatado(no);
  const caixa = (estilo.height ?? estilo.minHeight ?? estilo.paddingVertical) as number | undefined;
  if (typeof caixa !== 'number') return null;

  const folga = no.props.hitSlop;
  if (typeof folga === 'number') return caixa + folga * 2;
  if (folga && typeof folga === 'object') {
    return caixa + ((folga.top as number) ?? 0) + ((folga.bottom as number) ?? 0);
  }
  return caixa;
}

/** Todo nó acionável de uma tela já renderizada. */
function acionaveisNaTela(): No[] {
  return PAPEIS_ACIONAVEIS.flatMap((papel) =>
    screen.queryAllByRole(papel as never, { includeHiddenElements: true }),
  );
}

/** Como o controle aparece numa mensagem de falha, para dar para achá-lo. */
const descrever = (no: No) =>
  no.props.accessibilityLabel ?? no.props.testID ?? `<${no.type.toString()}>`;

/* ------------------------------------------------------------------ *
 * T-03 · nenhum controle sem nome
 *
 * Um `Pressable` sem rótulo é lido pelo TalkBack como "botão" e nada mais.
 * Quem usa leitor de tela fica com um app cheio de botões anônimos, e a
 * única forma de descobrir o que cada um faz é tocar e ver o que acontece —
 * que é justamente o que não se pode pedir a ninguém.
 *
 * A varredura existe porque a revisão manual não escala: são nove telas, e
 * o controle novo que esquecer o rótulo vai entrar numa décima.
 * ------------------------------------------------------------------ */

describe('T-03 · todo controle acionável tem papel e nome', () => {
  it.each(TELAS)('$nome', async ({ Tela }) => {
    await render(<Tela />, { wrapper: comSessao });

    const semNome = acionaveisNaTela().filter((no) => {
      const rotulo = no.props.accessibilityLabel;
      return typeof rotulo !== 'string' || rotulo.trim() === '';
    });

    expect(semNome.map(descrever)).toEqual([]);
  });

  it('e o nome nunca é só um símbolo — ele precisa dizer a ação', async () => {
    await render(<TelaInicio />, { wrapper: comSessao });

    const simbolos = acionaveisNaTela().filter((no) =>
      /^[^\p{L}\p{N}]+$/u.test(String(no.props.accessibilityLabel ?? '')),
    );

    expect(simbolos.map(descrever)).toEqual([]);
  });
});

/* ------------------------------------------------------------------ *
 * T-02 · nenhum alvo abaixo de 44pt
 *
 * Este teste mede o que está DECLARADO no estilo, porque o Jest não roda o
 * motor de layout: um controle que ganha altura do `flex` do pai chega aqui
 * sem altura nenhuma, e é por isso que `alturaTocavel` devolve `null` em vez
 * de zero — reprovar o que não dá para medir só ensinaria a ignorar o teste.
 *
 * A medição real, com o app rodando, é o T-07 (`uiautomator dump`), e está
 * registrada no `RELATORIO-ETAPA-03.md`. Os dois se complementam: este pega
 * a regressão em segundos, o outro prova o número no aparelho.
 * ------------------------------------------------------------------ */

describe('T-02 · nenhum alvo declarado fica abaixo de 44pt', () => {
  it.each(TELAS)('$nome', async ({ Tela }) => {
    await render(<Tela />, { wrapper: comSessao });

    const pequenos = acionaveisNaTela()
      .map((no) => ({ no, altura: alturaTocavel(no) }))
      .filter(({ altura }) => altura !== null && altura < touch.minTarget);

    expect(pequenos.map(({ no, altura }) => `${descrever(no)} (${altura}pt)`)).toEqual([]);
  });

  /*
    O caso que mais escapa é o controle que não parece controle: "esqueci
    minha senha" é desenhado como texto, e por isso ninguém lembra de lhe dar
    altura. Ele é um `Botao` de variante fantasma, e a altura vem de lá.
  */
  it('inclusive no que é desenhado como texto, mas é botão', async () => {
    await render(<TelaEntrar />, { wrapper: comSessao });

    const esqueci = screen.getByRole('button', { name: 'esqueci minha senha' });
    expect(alturaTocavel(esqueci)).toBeGreaterThanOrEqual(touch.minTarget);
  });

  it('e a barra de abas nunca encolhe abaixo do piso', () => {
    expect(touch.tabBarHeight).toBeGreaterThanOrEqual(touch.minTarget);
    expect(touch.fabSize).toBeGreaterThanOrEqual(touch.minTarget);
    expect(touch.field).toBeGreaterThanOrEqual(touch.minTarget);
    expect(touch.primaryAction).toBeGreaterThanOrEqual(touch.minTarget);
  });
});

/* ------------------------------------------------------------------ *
 * A contagem existe para o teste não passar por vazio: uma tela que
 * deixasse de renderizar seus controles passaria nas duas varreduras
 * acima sem reclamar de nada.
 * ------------------------------------------------------------------ */

describe('a varredura realmente encontra controles', () => {
  it.each(TELAS)('$nome tem pelo menos um controle acionável', async ({ Tela }) => {
    await render(<Tela />, { wrapper: comSessao });

    expect(acionaveisNaTela().length).toBeGreaterThan(0);
  });
});
