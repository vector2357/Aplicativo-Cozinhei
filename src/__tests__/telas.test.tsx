import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/features/auth/AuthContext';
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
const comSessao = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaProvider initialMetrics={METRICAS}>
    <AuthProvider>{children}</AuthProvider>
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
    await render(<TelaInicio />, { wrapper: comSessao });

    // Resumo do mês.
    expect(screen.getByText('agosto até aqui')).toBeTruthy();
    expect(screen.getByText('6')).toBeTruthy();
    expect(screen.getByText('3,8')).toBeTruthy();
    expect(screen.getByText('massa crua no meio')).toBeTruthy();

    // Continuar de onde parou.
    expect(screen.getByText('continuar de onde parou')).toBeTruthy();
    expect(screen.getByText('Arroz de forno')).toBeTruthy();
    expect(screen.getByText('Bolo de cenoura')).toBeTruthy();

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
    await fireEvent.press(screen.getByRole('button', { name: 'MS' }));
    expect(mockNavegar).toHaveBeenCalledWith('/perfil');
  });

  it('não tem nenhuma superfície âmbar: a única ação âmbar é o + da barra', async () => {
    await render(<TelaInicio />, { wrapper: comSessao });
    expect(temFundo(screen.toJSON(), color.amber)).toBe(false);
  });
});
