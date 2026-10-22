import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/features/auth/AuthContext';
import { AvisoProvider } from '@/features/aviso/AvisoContext';
import { EXECUCOES, USUARIO_EXEMPLO } from '@/features/execucoes/fixtures';
import { listarPratos } from '@/features/execucoes/repositorio';

/** O mesmo dono que as telas usam sob o `AuthProvider` sem sessão. */
const DONO = USUARIO_EXEMPLO.email;

const METRICAS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const mockEmpurrar = jest.fn();
const mockVoltar = jest.fn();
let mockParametrosDaRota: { id: string } = { id: 'p1' };

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockEmpurrar,
    replace: jest.fn(),
    navigate: jest.fn(),
    back: mockVoltar,
  }),
  useLocalSearchParams: () => mockParametrosDaRota,
  Redirect: () => null,
  Stack: () => null,
}));

import TelaEvolucao from '@/app/evolucao';
import TelaExecucao from '@/app/execucao/[id]';
import TelaHistorico from '@/app/(tabs)/historico';
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

beforeEach(() => {
  mockEmpurrar.mockClear();
  mockVoltar.mockClear();
  mockParametrosDaRota = { id: 'p1' };
});

describe('histórico', () => {
  it('se identifica como tela', async () => {
    await render(<TelaHistorico />, { wrapper: comSessao });

    expect(screen.getByRole('header', { name: 'histórico' })).toBeTruthy();
  });

  /** O mês é cabeçalho para o leitor de tela poder saltar período a período. */
  it('agrupa as execuções por mês, com o mês como cabeçalho', async () => {
    await render(<TelaHistorico />, { wrapper: comSessao });

    expect(await screen.findByRole('header', { name: 'agosto de 2026' })).toBeTruthy();
    expect(screen.getByRole('header', { name: 'julho de 2026' })).toBeTruthy();
  });

  it('mostra todas as execuções, não só as recentes', async () => {
    await render(<TelaHistorico />, { wrapper: comSessao });
    await screen.findByRole('header', { name: 'agosto de 2026' });

    const maisAntiga = EXECUCOES[EXECUCOES.length - 1];
    expect(
      screen.getByLabelText(
        new RegExp(`^${maisAntiga.prato}, tentativa ${maisAntiga.tentativa}, ${maisAntiga.data}`),
      ),
    ).toBeTruthy();
  });

  it('tocar numa ficha abre aquela execução', async () => {
    await render(<TelaHistorico />, { wrapper: comSessao });
    const alvo = EXECUCOES[0];

    await fireEvent.press(
      await screen.findByLabelText(new RegExp(`^${alvo.prato}, tentativa ${alvo.tentativa}, ${alvo.data}`)),
    );

    expect(mockEmpurrar).toHaveBeenCalledWith({
      pathname: '/execucao/[id]',
      params: { id: alvo.id },
    });
  });
});

describe('pratos', () => {
  it('separa o que está sendo repetido do que é primeira vez', async () => {
    await render(<TelaPratos />, { wrapper: comSessao });

    expect(await screen.findByRole('header', { name: 'você está repetindo' })).toBeTruthy();
    expect(screen.getByRole('header', { name: 'ainda na primeira vez' })).toBeTruthy();
  });

  it('o cartão do prato diz tudo num rótulo só', async () => {
    const pratos = await listarPratos(DONO);
    const bolo = pratos.find((prato) => prato.nome === 'Bolo de cenoura')!;
    await render(<TelaPratos />, { wrapper: comSessao });

    const cartao = await screen.findByLabelText(new RegExp(`^${bolo.nome}, ${bolo.tentativas} tentativas`));

    expect(cartao).toBeTruthy();
  });

  it('tocar num prato abre aquele prato', async () => {
    const pratos = await listarPratos(DONO);
    const primeiro = pratos[0];
    await render(<TelaPratos />, { wrapper: comSessao });

    await fireEvent.press(await screen.findByLabelText(new RegExp(`^${primeiro.nome},`)));

    expect(mockEmpurrar).toHaveBeenCalledWith({
      pathname: '/prato/[id]',
      params: { id: primeiro.id },
    });
  });
});

describe('prato em detalhe', () => {
  it('usa o nome do prato como título e tem voltar', async () => {
    await render(<TelaPrato />, { wrapper: comSessao });

    expect(await screen.findByRole('header', { name: 'Bolo de cenoura' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'voltar para pratos' })).toBeTruthy();
  });

  it('mostra a tira de evolução, que é a resposta a "estou melhorando?"', async () => {
    await render(<TelaPrato />, { wrapper: comSessao });

    // Duas tiras: a do painel e a do próprio cabeçalho de evolução.
    expect((await screen.findAllByTestId('tira-de-evolucao')).length).toBeGreaterThan(0);
  });

  it('lista todas as tentativas daquele prato', async () => {
    await render(<TelaPrato />, { wrapper: comSessao });

    expect(await screen.findByRole('header', { name: 'todas as tentativas' })).toBeTruthy();
    const doBolo = EXECUCOES.filter((execucao) => execucao.pratoId === 'p1');
    doBolo.forEach((execucao) => {
      expect(
        screen.getByLabelText(
          new RegExp(`^${execucao.prato}, tentativa ${execucao.tentativa}, ${execucao.data}`),
        ),
      ).toBeTruthy();
    });
  });

  it('mostra o defeito que mais volta', async () => {
    await render(<TelaPrato />, { wrapper: comSessao });

    expect(await screen.findByRole('header', { name: 'o que mais volta' })).toBeTruthy();
    // Aparece no painel e também nas fichas que o registraram.
    expect(screen.getAllByText(/massa crua no meio/).length).toBeGreaterThan(0);
  });

  it('com id desconhecido, explica e oferece voltar', async () => {
    mockParametrosDaRota = { id: 'nao-existe' };
    await render(<TelaPrato />, { wrapper: comSessao });

    expect(await screen.findByText('não encontrei este prato')).toBeTruthy();
    // Rótulo diferente do voltar do cabeçalho, de propósito.
    await fireEvent.press(screen.getByRole('button', { name: 'ver todos os pratos' }));
    expect(mockVoltar).toHaveBeenCalled();
  });
});

describe('execução em detalhe', () => {
  beforeEach(() => {
    mockParametrosDaRota = { id: EXECUCOES[0].id };
  });

  it('mostra a calha da tentativa, o elemento-assinatura do produto', async () => {
    const alvo = EXECUCOES[0];
    await render(<TelaExecucao />, { wrapper: comSessao });

    expect(
      await screen.findByLabelText(new RegExp(`^tentativa ${alvo.tentativa}, ${alvo.prato}`)),
    ).toBeTruthy();
  });

  it('separa o que deu certo do que deu errado', async () => {
    // A primeira execução só tem qualidades; esta tem os dois.
    mockParametrosDaRota = { id: 'e2' };
    await render(<TelaExecucao />, { wrapper: comSessao });

    expect(await screen.findByRole('header', { name: 'o que deu certo' })).toBeTruthy();
    expect(screen.getByRole('header', { name: 'o que deu errado' })).toBeTruthy();
  });

  it('mostra tempo e custo formatados em português', async () => {
    mockParametrosDaRota = { id: 'e2' };
    await render(<TelaExecucao />, { wrapper: comSessao });

    expect(await screen.findByLabelText('tempo: 55 min')).toBeTruthy();
    expect(screen.getByLabelText(/custo: R\$\s?18,40/)).toBeTruthy();
  });
});

describe('evolução', () => {
  it('mostra os números gerais e a curva por prato', async () => {
    await render(<TelaEvolucao />, { wrapper: comSessao });

    expect(await screen.findByLabelText(`${EXECUCOES.length} execuções`)).toBeTruthy();
    expect(screen.getByRole('header', { name: 'a curva de cada prato repetido' })).toBeTruthy();
  });

  it('lista os defeitos que mais voltam', async () => {
    await render(<TelaEvolucao />, { wrapper: comSessao });

    expect(await screen.findByRole('header', { name: 'os defeitos que mais voltam' })).toBeTruthy();
  });

  it('tem voltar', async () => {
    await render(<TelaEvolucao />, { wrapper: comSessao });

    await fireEvent.press(screen.getByRole('button', { name: 'voltar para início' }));

    expect(mockVoltar).toHaveBeenCalled();
  });
});

describe('perfil', () => {
  it('mostra quem está logado', async () => {
    await render(<TelaPerfil />, { wrapper: comSessao });

    // Do fixture, não escrito à mão: renomear a usuária de exemplo já quebrou
    // esta asserção uma vez.
    expect(
      screen.getByLabelText(
        new RegExp(`${USUARIO_EXEMPLO.nome}, ${USUARIO_EXEMPLO.email}`),
      ),
    ).toBeTruthy();
  });

  it('mostra os números da conta', async () => {
    await render(<TelaPerfil />, { wrapper: comSessao });

    expect(await screen.findByLabelText(`${EXECUCOES.length} execuções`)).toBeTruthy();
  });

  /** Sair é destrutivo para a sessão. */
  it('oferece sair da conta, e avisa que saiu', async () => {
    await render(<TelaPerfil />, { wrapper: comSessao });

    await fireEvent.press(screen.getByRole('button', { name: 'sair da conta' }));

    expect(screen.getByText('você saiu da sua conta')).toBeTruthy();
  });

  it('os ajustes anunciam quando chegam, em vez de ficarem mudos', async () => {
    await render(<TelaPerfil />, { wrapper: comSessao });

    await fireEvent.press(screen.getByRole('button', { name: 'acessibilidade' }));

    expect(screen.getByText('ajustes de acessibilidade')).toBeTruthy();
  });
});
