import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CabecalhoDeAba, Campo } from '@/components/ui';
import { estilosBarraAbas } from '@/components/navegacao/estilosBarraAbas';
import { BotaoAba } from '@/components/navegacao/BotaoAba';
import { TAMANHO_ICONE_ABA } from '@/components/navegacao/IconeAba';
import { AuthProvider } from '@/features/auth/AuthContext';
import { AvisoProvider } from '@/features/aviso/AvisoContext';
import { shadow, touch } from '@/theme';

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
import TelaPerfil from '@/app/(tabs)/perfil';

const comArea = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaProvider initialMetrics={METRICAS}>{children}</SafeAreaProvider>
);

const comSessao = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaProvider initialMetrics={METRICAS}>
    <AuthProvider>
      <AvisoProvider>{children}</AvisoProvider>
    </AuthProvider>
  </SafeAreaProvider>
);

/** Achata o `style` de um nó, que pode ser objeto ou array aninhado. */
function estiloDe(no: { props: { style?: unknown } }): Record<string, unknown> {
  const plano: Record<string, unknown> = {};
  const empilhar = (valor: unknown) => {
    if (Array.isArray(valor)) valor.forEach(empilhar);
    else if (valor && typeof valor === 'object') Object.assign(plano, valor);
  };
  empilhar(no.props.style);
  return plano;
}

/* ------------------------------------------------------------------ *
 * O olho da senha
 *
 * Esconder a senha sem dar como conferi-la é o que faz alguém errar a
 * própria senha três vezes e não descobrir onde. O controle alterna, e o
 * desenho tem de dizer em qual dos dois estados se está.
 * ------------------------------------------------------------------ */

describe('campo de senha · mostrar e ocultar', () => {
  it('nasce oculto, e o botão oferece mostrar', async () => {
    await render(<Campo rotulo="senha" senha value="segredo" />, { wrapper: comArea });

    expect(screen.getByLabelText('senha').props.secureTextEntry).toBe(true);
    expect(screen.getByRole('button', { name: 'mostrar senha' })).toBeTruthy();
  });

  it('um toque revela, e o botão passa a oferecer ocultar', async () => {
    await render(<Campo rotulo="senha" senha value="segredo" />, { wrapper: comArea });
    await fireEvent.press(screen.getByRole('button', { name: 'mostrar senha' }));

    expect(screen.getByLabelText('senha').props.secureTextEntry).toBe(false);
    expect(screen.getByRole('button', { name: 'ocultar senha' })).toBeTruthy();
  });

  it('o ícone muda junto com o estado', async () => {
    await render(<Campo rotulo="senha" senha value="segredo" />, { wrapper: comArea });
    const escondido = { includeHiddenElements: true } as const;

    expect(screen.getByTestId('icone-olho', escondido)).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'mostrar senha' }));

    expect(screen.getByTestId('icone-olho-fechado', escondido)).toBeTruthy();
  });

  it('o segundo toque esconde de novo', async () => {
    await render(<Campo rotulo="senha" senha value="segredo" />, { wrapper: comArea });
    await fireEvent.press(screen.getByRole('button', { name: 'mostrar senha' }));
    await fireEvent.press(screen.getByRole('button', { name: 'ocultar senha' }));

    expect(screen.getByLabelText('senha').props.secureTextEntry).toBe(true);
  });

  it('o alvo do olho tem os 44pt, mesmo com o ícone medindo menos', async () => {
    await render(<Campo rotulo="senha" senha value="segredo" />, { wrapper: comArea });

    const olho = estiloDe(screen.getByRole('button', { name: 'mostrar senha' }));
    expect(olho.width).toBeGreaterThanOrEqual(touch.minTarget);
    expect(olho.height).toBeGreaterThanOrEqual(touch.minTarget);
  });

  /** Campo comum não ganha olho: só quem esconde algo precisa revelar. */
  it('um campo que não é de senha não tem o botão', async () => {
    await render(<Campo rotulo="e-mail" value="marina@email.com" />, { wrapper: comArea });

    expect(screen.queryByRole('button', { name: /senha/ })).toBeNull();
    expect(screen.getByLabelText('e-mail').props.secureTextEntry).toBeFalsy();
  });

  it('as duas telas de entrada usam o campo de senha, não o campo cru', async () => {
    await render(<TelaEntrar />, { wrapper: comSessao });
    expect(screen.getByRole('button', { name: 'mostrar senha' })).toBeTruthy();
  });

  it('inclusive o cadastro', async () => {
    await render(<TelaCriarConta />, { wrapper: comSessao });
    expect(screen.getByRole('button', { name: 'mostrar senha' })).toBeTruthy();
  });
});

/* ------------------------------------------------------------------ *
 * Os cabeçalhos fixos
 *
 * Eles ficam parados enquanto a lista corre por baixo. Sem sombra e sem
 * respiro, o título e a primeira ficha encostam e viram um bloco só.
 * ------------------------------------------------------------------ */

describe('cabeçalho de aba', () => {
  it('é um cabeçalho de verdade para o leitor de tela', async () => {
    await render(<CabecalhoDeAba titulo="histórico" />, { wrapper: comArea });

    expect(screen.getByRole('header', { name: 'histórico' })).toBeTruthy();
  });

  it('tem sombra e fundo opaco — um não serve sem o outro', async () => {
    await render(<CabecalhoDeAba titulo="histórico" />, { wrapper: comArea });

    const caixa = estiloDe(screen.getByRole('header').parent as never);
    expect(caixa.boxShadow).toEqual(shadow.cabecalho.boxShadow);
    expect(caixa.backgroundColor).toBeDefined();
  });

  /*
    A sombra cai só para baixo. `elevation` é elevação de verdade no Android
    e pinta nos quatro lados — num cabeçalho colado no topo da tela isso vira
    uma faixa escura contra a barra de status.
  */
  it('a sombra não sobe: sem elevation, e o deslocamento cobre o desfoque', () => {
    expect(shadow.cabecalho).not.toHaveProperty('elevation');

    const [sombra] = shadow.cabecalho.boxShadow;
    expect(sombra.offsetY).toBeGreaterThanOrEqual(sombra.blurRadius / 2);
  });

  it('separa o título do conteúdo que rola por baixo', async () => {
    await render(<CabecalhoDeAba titulo="pratos" />, { wrapper: comArea });

    const caixa = estiloDe(screen.getByRole('header').parent as never);
    expect(caixa.paddingBottom as number).toBeGreaterThanOrEqual(14);
  });
});

/* ------------------------------------------------------------------ *
 * A barra de abas depois de crescer
 * ------------------------------------------------------------------ */

describe('barra de abas · legibilidade', () => {
  it('a fatia da aba cabe dentro da barra, com folga', async () => {
    await render(<BotaoAba rotulo="histórico" icone="historico" />, { wrapper: comArea });

    const fatia = estiloDe(screen.getByRole('tab'));
    expect(fatia.height as number).toBeLessThan(touch.tabBarHeight);
  });

  it('o ícone e o rótulo não se encostam', async () => {
    await render(<BotaoAba rotulo="histórico" icone="historico" />, { wrapper: comArea });

    expect(estiloDe(screen.getByRole('tab')).gap as number).toBeGreaterThanOrEqual(6);
  });

  /*
    Crescer a barra não pode comer a folga entre abas nem o alvo mínimo —
    são as duas regras que a onda 4 travou.
  */
  it('crescer a barra não desfez a folga entre alvos vizinhos', () => {
    const vao = (estilosBarraAbas.vao as { width: number }).width;
    expect(vao - touch.fabSize).toBe(touch.deadSpace * 2);
  });

  it('o botão de registrar continua cabendo na barra', () => {
    expect(touch.fabSize).toBeLessThanOrEqual(touch.tabBarHeight);
  });

  it('o ícone da aba cresceu junto com a barra', () => {
    expect(TAMANHO_ICONE_ABA).toBeGreaterThanOrEqual(24);
  });
});

/* ------------------------------------------------------------------ *
 * O perfil sem título repetido
 * ------------------------------------------------------------------ */

describe('perfil · sem título de tela', () => {
  it('não repete a palavra "perfil", que a aba já diz', async () => {
    await render(<TelaPerfil />, { wrapper: comSessao });

    expect(screen.queryByRole('header', { name: 'perfil' })).toBeNull();
  });

  it('e quem identifica a tela é o nome da pessoa', async () => {
    await render(<TelaPerfil />, { wrapper: comSessao });

    expect(await screen.findByText('Marina Salles')).toBeTruthy();
  });
});
