import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const METRICAS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

// Prefixo `mock` obrigatório: a fábrica de `jest.mock` é içada para antes do módulo.
const mockVoltar = jest.fn();
const mockEmpurrar = jest.fn();
let mockParametrosDaRota: { id: string } = { id: 'e1' };

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockEmpurrar,
    replace: jest.fn(),
    navigate: jest.fn(),
    back: mockVoltar,
  }),
  useLocalSearchParams: () => mockParametrosDaRota,
  Stack: () => null,
}));

import TelaExecucao from '@/app/execucao/[id]';
import TelaEvolucao from '@/app/evolucao';
import { CabecalhoTela } from '@/components/ui';
import { AuthProvider } from '@/features/auth/AuthContext';
import { AvisoProvider } from '@/features/aviso/AvisoContext';
import { EXECUCOES } from '@/features/execucoes/fixtures';

const comArea = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaProvider initialMetrics={METRICAS}>{children}</SafeAreaProvider>
);

/** A moldura completa: área segura, sessão e avisos, como o app monta. */
const comSessao = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaProvider initialMetrics={METRICAS}>
    <AuthProvider>
      <AvisoProvider>{children}</AvisoProvider>
    </AuthProvider>
  </SafeAreaProvider>
);

beforeEach(() => {
  mockVoltar.mockClear();
  mockEmpurrar.mockClear();
  mockParametrosDaRota = { id: 'e1' };
});

describe('CabecalhoTela', () => {
  it('o título é um cabeçalho para o leitor de tela', async () => {
    await render(<CabecalhoTela titulo="sua evolução" origem="início" />, { wrapper: comArea });

    // Sem o papel declarado, o leitor perde o atalho de navegar por cabeçalhos.
    expect(screen.getByRole('header', { name: 'sua evolução' })).toBeTruthy();
  });

  it('o voltar diz para onde leva, não só "voltar"', async () => {
    await render(<CabecalhoTela titulo="sua evolução" origem="início" />, { wrapper: comArea });

    expect(screen.getByRole('button', { name: 'voltar para início' })).toBeTruthy();
  });

  it('sem origem conhecida, o rótulo cai para "voltar"', async () => {
    await render(<CabecalhoTela titulo="execução" />, { wrapper: comArea });

    expect(screen.getByRole('button', { name: 'voltar' })).toBeTruthy();
  });

  it('tocar no voltar desfaz a navegação', async () => {
    await render(<CabecalhoTela titulo="sua evolução" origem="início" />, { wrapper: comArea });

    await fireEvent.press(screen.getByRole('button', { name: 'voltar para início' }));

    expect(mockVoltar).toHaveBeenCalledTimes(1);
  });

  it('o alvo do voltar respeita o piso de 44pt', async () => {
    await render(<CabecalhoTela titulo="sua evolução" origem="início" />, { wrapper: comArea });

    const botao = screen.getByRole('button', { name: 'voltar para início' });
    const estilo = Object.assign({}, ...[botao.props.style].flat(2).filter(Boolean));
    expect(estilo.width).toBeGreaterThanOrEqual(44);
    expect(estilo.height).toBeGreaterThanOrEqual(44);
  });

  it('a seta é desenho: quem fala é o rótulo do botão', async () => {
    await render(<CabecalhoTela titulo="sua evolução" origem="início" />, { wrapper: comArea });

    // Escondido da árvore de acessibilidade, por isso `includeHiddenElements`.
    const seta = screen.getByTestId('icone-voltar', { includeHiddenElements: true });
    expect(seta.props.accessibilityElementsHidden).toBe(true);
    expect(seta.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('aceita uma ação à direita do título', async () => {
    await render(
      <CabecalhoTela titulo="histórico" origem="início" acao={<Text>filtrar</Text>} />,
      { wrapper: comArea },
    );

    expect(screen.getByText('filtrar')).toBeTruthy();
  });
});

describe('/evolucao', () => {
  it('se identifica e mostra os números da evolução', async () => {
    await render(<TelaEvolucao />, { wrapper: comSessao });

    expect(screen.getByRole('header', { name: 'sua evolução' })).toBeTruthy();
    expect(await screen.findByText('a curva de cada prato repetido')).toBeTruthy();
  });

  it('tem voltar — é alcançada por push, não é aba', async () => {
    await render(<TelaEvolucao />, { wrapper: comSessao });

    await fireEvent.press(screen.getByRole('button', { name: 'voltar para início' }));

    expect(mockVoltar).toHaveBeenCalled();
  });
});

describe('/execucao/[id]', () => {
  it('usa o nome do prato como título, confirmando onde se chegou', async () => {
    await render(<TelaExecucao />, { wrapper: comSessao });

    // Do próprio conjunto: qual prato é o primeiro muda quando os dados de exemplo crescem.
    expect(await screen.findByRole('header', { name: EXECUCOES[0].prato })).toBeTruthy();
  });

  it('busca a execução do id que a rota entregou', async () => {
    const outra = EXECUCOES[2];
    mockParametrosDaRota = { id: outra.id };
    await render(<TelaExecucao />, { wrapper: comSessao });

    expect(await screen.findByRole('header', { name: outra.prato })).toBeTruthy();
  });

  /** Deep link com id inválido não pode quebrar a tela. */
  it('com id desconhecido, explica que não encontrou e oferece voltar', async () => {
    mockParametrosDaRota = { id: 'nao-existe' };
    await render(<TelaExecucao />, { wrapper: comSessao });

    expect(await screen.findByText('não encontrei esta execução')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'voltar' })).toBeTruthy();
  });

  it('tem voltar', async () => {
    await render(<TelaExecucao />, { wrapper: comSessao });

    await fireEvent.press(await screen.findByRole('button', { name: 'voltar para a lista' }));

    expect(mockVoltar).toHaveBeenCalled();
  });
});
