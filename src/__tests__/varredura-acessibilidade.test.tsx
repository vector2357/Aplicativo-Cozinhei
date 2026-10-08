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

/** A altura que o dedo alcança: a caixa mais o `hitSlop`. */
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

// T-03 · nenhum controle sem nome: sem rótulo, o TalkBack lê só "botão".

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

// T-02 · nenhum alvo abaixo de 44pt, medido pelo que o estilo declara.

describe('T-02 · nenhum alvo declarado fica abaixo de 44pt', () => {
  it.each(TELAS)('$nome', async ({ Tela }) => {
    await render(<Tela />, { wrapper: comSessao });

    const pequenos = acionaveisNaTela()
      .map((no) => ({ no, altura: alturaTocavel(no) }))
      .filter(({ altura }) => altura !== null && altura < touch.minTarget);

    expect(pequenos.map(({ no, altura }) => `${descrever(no)} (${altura}pt)`)).toEqual([]);
  });

  // O caso que mais escapa é o controle que não parece controle.
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

// A contagem existe para o teste não passar por vazio.

describe('a varredura realmente encontra controles', () => {
  it.each(TELAS)('$nome tem pelo menos um controle acionável', async ({ Tela }) => {
    await render(<Tela />, { wrapper: comSessao });

    expect(acionaveisNaTela().length).toBeGreaterThan(0);
  });
});
