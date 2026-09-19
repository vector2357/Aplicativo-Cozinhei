import { act, fireEvent, render, screen } from '@testing-library/react-native';
import fs from 'fs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/features/auth/AuthContext';
import { AvisoProvider } from '@/features/aviso/AvisoContext';
import { EXECUCOES, EXECUCOES_RECENTES, MES_CORRENTE } from '@/features/execucoes/fixtures';

/** As execuções do mês corrente, que o cartão de resumo conta. */
const EXECUCOES_DE_AGOSTO = EXECUCOES.filter((execucao) => execucao.mes === MES_CORRENTE);
import { color } from '@/theme';

/**
 * Medidas de área segura fixas. Fora do aparelho não há valor real, e sem
 * elas qualquer componente que chame `useSafeAreaInsets` — o BottomSheet, a
 * moldura de tela — quebra na renderização.
 */
const METRICAS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

// O Jest exige que variáveis usadas dentro da fábrica de `jest.mock` tenham
// o prefixo `mock`: a fábrica é içada para antes das declarações do módulo.
const mockEmpurrar = jest.fn();
const mockSubstituir = jest.fn();
const mockNavegar = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockEmpurrar,
    replace: mockSubstituir,
    navigate: mockNavegar,
  }),
  Stack: () => null,
}));

import TelaInicio from '@/app/(tabs)/inicio';
import TelaCriarConta from '@/app/criar-conta';
import TelaEntrando from '@/app/entrando';
import TelaEntrar from '@/app/index';

/** Toda tela precisa da área segura e da sessão em volta. */
/**
 * A moldura que toda tela encontra em execução: área segura, sessão e o
 * provedor de avisos. Renderizar uma tela sem ela é testar algo que o app
 * nunca monta.
 */
const comSessao = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaProvider initialMetrics={METRICAS}>
    <AuthProvider>
      <AvisoProvider>{children}</AvisoProvider>
    </AuthProvider>
  </SafeAreaProvider>
);

/** Achata o style de um nó, que pode ser objeto ou array aninhado. */
function estiloDe(no: { props?: { style?: unknown } }): Record<string, unknown> {
  const plano: Record<string, unknown> = {};
  const empilhar = (valor: unknown) => {
    if (Array.isArray(valor)) valor.forEach(empilhar);
    else if (valor && typeof valor === 'object') Object.assign(plano, valor);
  };
  empilhar(no.props?.style);
  return plano;
}

/** Percorre a árvore renderizada procurando um fundo desta cor. */
function temFundo(no: unknown, cor: string): boolean {
  if (!no || typeof no !== 'object') return false;
  const alvo = no as { props?: { style?: unknown }; children?: unknown[] };
  if (estiloDe(alvo).backgroundColor === cor) return true;
  return (alvo.children ?? []).some((filho) => temFundo(filho, cor));
}

beforeEach(() => {
  mockEmpurrar.mockClear();
  mockSubstituir.mockClear();
  mockNavegar.mockClear();
});

describe('01 · Entrar (tela inicial)', () => {
  it('mostra marca, campos e as duas formas de entrar', async () => {
    await render(<TelaEntrar />, { wrapper: comSessao });
    expect(screen.getByText('Cozinhei')).toBeTruthy();
    expect(screen.getByText('seu diário de cozinha')).toBeTruthy();
    expect(screen.getByLabelText('e-mail')).toBeTruthy();
    expect(screen.getByLabelText('senha')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'entrar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'continuar com o Google' })).toBeTruthy();
  });

  it('bloqueia a entrada e mostra os erros com o formulário vazio', async () => {
    await render(<TelaEntrar />, { wrapper: comSessao });
    await fireEvent.press(screen.getByRole('button', { name: 'entrar' }));
    expect(screen.getByText('informe seu e-mail')).toBeTruthy();
    expect(screen.getByText('informe sua senha')).toBeTruthy();
    expect(mockEmpurrar).not.toHaveBeenCalled();
  });

  it('avança para "entrando" com e-mail e senha válidos', async () => {
    await render(<TelaEntrar />, { wrapper: comSessao });
    await fireEvent.changeText(screen.getByLabelText('e-mail'), 'marina@email.com');
    await fireEvent.changeText(screen.getByLabelText('senha'), 'segredo123');
    await fireEvent.press(screen.getByRole('button', { name: 'entrar' }));
    expect(mockSubstituir).toHaveBeenCalledWith('/entrando');
  });

  /**
   * Com `push`, o login continuava vivo embaixo das abas e o botão de voltar
   * do Android o trazia de volta, ainda com os erros da tentativa anterior.
   * `replace` troca a tela em vez de empilhar.
   */
  it('SUBSTITUI a tela ao entrar, para o voltar do sistema não ressuscitar o login', async () => {
    await render(<TelaEntrar />, { wrapper: comSessao });
    await fireEvent.changeText(screen.getByLabelText('e-mail'), 'marina@email.com');
    await fireEvent.changeText(screen.getByLabelText('senha'), 'segredo123');
    await fireEvent.press(screen.getByRole('button', { name: 'entrar' }));
    expect(mockEmpurrar).not.toHaveBeenCalled();
  });

  /**
   * Vinho significa "algo deu errado" em todo o app. Mantê-lo num campo que o
   * usuário já corrigiu gasta o significado da cor — e era o que acontecia,
   * porque a validação só rodava no envio.
   */
  it('o erro do campo some quando o usuário o corrige', async () => {
    await render(<TelaEntrar />, { wrapper: comSessao });
    await fireEvent.press(screen.getByRole('button', { name: 'entrar' }));
    expect(screen.getByText('informe seu e-mail')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('e-mail'), 'marina@email.com');

    expect(screen.queryByText('informe seu e-mail')).toBeNull();
  });

  it('corrigir um campo não apaga o erro do outro, que continua errado', async () => {
    await render(<TelaEntrar />, { wrapper: comSessao });
    await fireEvent.press(screen.getByRole('button', { name: 'entrar' }));

    await fireEvent.changeText(screen.getByLabelText('e-mail'), 'marina@email.com');

    // A senha segue vazia: esconder o aviso dela seria mentir.
    expect(screen.getByText('informe sua senha')).toBeTruthy();
  });

  it('o segmento "criar conta" leva ao cadastro', async () => {
    await render(<TelaEntrar />, { wrapper: comSessao });
    await fireEvent.press(screen.getByRole('tab', { name: 'criar conta' }));
    expect(mockSubstituir).toHaveBeenCalledWith('/criar-conta');
  });

  it('o botão do Google abre o sheet de contas, que entra ao escolher', async () => {
    await render(<TelaEntrar />, { wrapper: comSessao });
    await fireEvent.press(screen.getByRole('button', { name: 'continuar com o Google' }));
    expect(screen.getByText(/escolha a conta Google/)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Marina Salles, marina.salles@gmail.com'));
    expect(mockSubstituir).toHaveBeenCalledWith('/entrando');
    expect(mockEmpurrar).not.toHaveBeenCalled();
  });
});

describe('02 · Criar conta', () => {
  it('pede nome, e-mail, senha e o aceite dos termos', async () => {
    await render(<TelaCriarConta />, { wrapper: comSessao });
    expect(screen.getByLabelText('como te chamamos')).toBeTruthy();
    expect(screen.getByLabelText('e-mail')).toBeTruthy();
    expect(screen.getByLabelText('senha')).toBeTruthy();
    expect(screen.getByText('use 8 caracteres ou mais')).toBeTruthy();
    expect(
      screen.getByRole('checkbox', {
        name: 'aceito os termos de uso e a política de privacidade',
      }),
    ).toBeTruthy();
  });

  it('recusa senha curta e termos não aceitos', async () => {
    await render(<TelaCriarConta />, { wrapper: comSessao });
    await fireEvent.changeText(screen.getByLabelText('como te chamamos'), 'Marina');
    await fireEvent.changeText(screen.getByLabelText('e-mail'), 'marina@email.com');
    await fireEvent.changeText(screen.getByLabelText('senha'), 'curta');
    await fireEvent.press(screen.getByRole('button', { name: 'criar minha conta' }));

    expect(screen.getByText('é preciso aceitar os termos para criar a conta')).toBeTruthy();
    expect(mockEmpurrar).not.toHaveBeenCalled();
  });

  it('cria a conta quando tudo está válido', async () => {
    await render(<TelaCriarConta />, { wrapper: comSessao });
    await fireEvent.changeText(screen.getByLabelText('como te chamamos'), 'Marina Salles');
    await fireEvent.changeText(screen.getByLabelText('e-mail'), 'marina@email.com');
    await fireEvent.changeText(screen.getByLabelText('senha'), 'oitocaracteres');
    await fireEvent.press(
      screen.getByRole('checkbox', {
        name: 'aceito os termos de uso e a política de privacidade',
      }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'criar minha conta' }));
    expect(mockSubstituir).toHaveBeenCalledWith('/entrando');
    expect(mockEmpurrar).not.toHaveBeenCalled();
  });

  it('o erro da senha curta some ao digitar uma senha maior', async () => {
    await render(<TelaCriarConta />, { wrapper: comSessao });
    await fireEvent.changeText(screen.getByLabelText('senha'), 'curta');
    await fireEvent.press(screen.getByRole('button', { name: 'criar minha conta' }));
    expect(screen.getByText('use 8 caracteres ou mais')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('senha'), 'oitocaracteres');

    // A dica do campo tem o mesmo texto da mensagem de erro; o que precisa
    // sumir é a marcação de erro, então conta-se quantas vezes ele aparece.
    expect(screen.queryAllByText('use 8 caracteres ou mais')).toHaveLength(1);
  });

  it('aceitar os termos apaga o aviso de que eles eram obrigatórios', async () => {
    await render(<TelaCriarConta />, { wrapper: comSessao });
    await fireEvent.press(screen.getByRole('button', { name: 'criar minha conta' }));
    expect(screen.getByText('é preciso aceitar os termos para criar a conta')).toBeTruthy();

    await fireEvent.press(
      screen.getByRole('checkbox', {
        name: 'aceito os termos de uso e a política de privacidade',
      }),
    );

    expect(screen.queryByText('é preciso aceitar os termos para criar a conta')).toBeNull();
  });

  it('o segmento "entrar" volta ao login', async () => {
    await render(<TelaCriarConta />, { wrapper: comSessao });
    await fireEvent.press(screen.getByRole('tab', { name: 'entrar' }));
    expect(mockSubstituir).toHaveBeenCalledWith('/');
  });
});

describe('04 · Entrando', () => {
  // Timers falsos no bloco inteiro: a tela dispara um atraso de autenticação
  // de verdade, que sem isso fica pendente e trava a limpeza entre testes.
  // `setImmediate` precisa continuar real — é nele que o `act` assíncrono do
  // testing-library se apoia para esvaziar a fila de renderização.
  beforeEach(() => jest.useFakeTimers({ doNotFake: ['setImmediate'] }));
  afterEach(() => jest.useRealTimers());

  it('explica a espera e oferece cancelar', async () => {
    await render(<TelaEntrando />, { wrapper: comSessao });
    expect(screen.getByText('preparando sua cozinha')).toBeTruthy();
    expect(screen.getByText(/21 execuções/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'cancelar' })).toBeTruthy();
  });

  it('cancelar devolve ao login', async () => {
    await render(<TelaEntrando />, { wrapper: comSessao });
    await fireEvent.press(screen.getByRole('button', { name: 'cancelar' }));
    expect(mockSubstituir).toHaveBeenCalledWith('/');
  });

  /**
   * Voltar ao login sem dizer nada deixa a dúvida de ter tocado no lugar
   * certo. O aviso é o retorno da ação — e, como vive no layout raiz, ele
   * sobrevive à troca de tela que o próprio cancelar provoca.
   */
  it('cancelar avisa que a entrada foi cancelada', async () => {
    await render(<TelaEntrando />, { wrapper: comSessao });

    await fireEvent.press(screen.getByRole('button', { name: 'cancelar' }));

    expect(screen.getByText('entrada cancelada')).toBeTruthy();
  });

  it('ao terminar de autenticar, segue para o início', async () => {
    await render(<TelaEntrando />, { wrapper: comSessao });
    // Antes do atraso terminar ninguém navega — a espera é real.
    expect(mockSubstituir).not.toHaveBeenCalled();
    await act(() => jest.advanceTimersByTimeAsync(2500));
    expect(mockSubstituir).toHaveBeenCalledWith('/inicio');
  });

  it('cancelado, não navega para o início mesmo quando a promessa resolve', async () => {
    await render(<TelaEntrando />, { wrapper: comSessao });
    await fireEvent.press(screen.getByRole('button', { name: 'cancelar' }));
    await act(() => jest.advanceTimersByTimeAsync(2500));
    expect(mockSubstituir).toHaveBeenCalledTimes(1);
    expect(mockSubstituir).toHaveBeenCalledWith('/');
  });
});

describe('05 · Início', () => {
  it('mostra o resumo do mês, os recentes e as receitas-guia', async () => {
    // A tela busca os dados pelo repositório, que é assíncrono de propósito:
    // as asserções esperam o conteúdo chegar em vez de assumir o 1º render.
    await render(<TelaInicio />, { wrapper: comSessao });

    // Resumo do mês. Os números são contados a partir das execuções, não
    // escritos à mão — por isso vêm dos fixtures, e não literais aqui.
    expect(await screen.findByText('agosto até aqui')).toBeTruthy();
    expect(screen.getByText(String(EXECUCOES_DE_AGOSTO.length))).toBeTruthy();
    expect(screen.getByText('massa crua no meio')).toBeTruthy();

    // Continuar de onde parou.
    expect(screen.getByText('continuar de onde parou')).toBeTruthy();
    EXECUCOES_RECENTES.forEach((execucao) => {
      expect(
        screen.getByLabelText(
          new RegExp(`^${execucao.prato}, tentativa ${execucao.tentativa}, ${execucao.data}`),
        ),
      ).toBeTruthy();
    });

    // Receitas-guia.
    expect(screen.getByText('suas receitas-guia')).toBeTruthy();
    expect(screen.getByText('Bolo de cenoura da vó')).toBeTruthy();
    expect(screen.getByText('Pão de queijo mineiro')).toBeTruthy();
  });


  it('cumprimenta o usuário pelo primeiro nome', async () => {
    await render(<TelaInicio />, { wrapper: comSessao });
    expect(screen.getByText('oi, Marina')).toBeTruthy();
  });

  it('o avatar leva ao perfil', async () => {
    await render(<TelaInicio />, { wrapper: comSessao });
    await fireEvent.press(screen.getByRole('button', { name: /^perfil de/ }));
    expect(mockNavegar).toHaveBeenCalledWith('/perfil');
  });

  it('não tem nenhuma superfície âmbar: a única ação âmbar é o + da barra', async () => {
    await render(<TelaInicio />, { wrapper: comSessao });
    expect(temFundo(screen.toJSON(), color.amber)).toBe(false);
  });
});

describe('D-03 · o teclado não pode cobrir a ação principal', () => {
  /**
   * O defeito: `edgeToEdgeEnabled` no `app.json` faz o Android NÃO
   * redimensionar a janela quando o teclado sobe, então o
   * `KeyboardAvoidingView` não tinha o que encolher. Somado ao `flexGrow: 1`
   * do conteúdo, o `ScrollView` ficava sem excesso e a ação principal era
   * inalcançável — nem rolando.
   *
   * A correção reserva a altura do teclado no próprio conteúdo.
   */

  /** O recuo inferior do conteúdo rolável da tela. */
  function recuoDaRolagem(): number {
    const rolagem = screen.getByTestId('rolagem-do-formulario');
    const plano: Record<string, unknown> = {};
    const empilhar = (valor: unknown) => {
      if (Array.isArray(valor)) valor.forEach(empilhar);
      else if (valor && typeof valor === 'object') Object.assign(plano, valor);
    };
    empilhar(rolagem.props.contentContainerStyle);
    return plano.paddingBottom as number;
  }

  it('a rolagem do formulário reserva espaço no rodapé', async () => {
    await render(<TelaCriarConta />, { wrapper: comSessao });

    expect(recuoDaRolagem()).toBeGreaterThan(0);
  });

  it('arrastar a lista dispensa o teclado — o gesto que o usuário já faz', async () => {
    await render(<TelaCriarConta />, { wrapper: comSessao });

    expect(screen.getByTestId('rolagem-do-formulario').props.keyboardDismissMode).toBe('on-drag');
  });

  it('o toque chega ao botão mesmo com o teclado aberto', async () => {
    await render(<TelaCriarConta />, { wrapper: comSessao });

    expect(
      screen.getByTestId('rolagem-do-formulario').props.keyboardShouldPersistTaps,
    ).toBe('handled');
  });

  it('a mesma reserva existe na tela de entrar', async () => {
    await render(<TelaEntrar />, { wrapper: comSessao });

    expect(recuoDaRolagem()).toBeGreaterThan(0);
    expect(screen.getByTestId('rolagem-do-formulario').props.keyboardDismissMode).toBe('on-drag');
  });

  /**
   * O `KeyboardAvoidingView` saiu de cena: ele dependia de a janela encolher,
   * e com `edgeToEdgeEnabled` ela não encolhe. Deixá-lo daria a impressão de
   * que o problema está tratado.
   */
  it('não há mais KeyboardAvoidingView nas telas de formulário', () => {
    const fonte = [
      fs.readFileSync('src/app/criar-conta.tsx', 'utf8'),
      fs.readFileSync('src/app/index.tsx', 'utf8'),
    ];

    // O nome ainda aparece no comentário que explica POR QUE ele saiu — o que
    // não pode voltar é o import e o elemento.
    fonte.forEach((arquivo) => {
      expect(arquivo).not.toMatch(/import\s*\{[^}]*KeyboardAvoidingView/);
      expect(arquivo).not.toContain('<KeyboardAvoidingView');
    });
  });
});
