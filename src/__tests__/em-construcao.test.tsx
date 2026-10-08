import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/features/auth/AuthContext';
import { AvisoProvider } from '@/features/aviso/AvisoContext';
import { EXECUCOES_RECENTES } from '@/features/execucoes/fixtures';
import { DESTINOS } from '@/features/navegacao/destinos';

const METRICAS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const mockEmpurrar = jest.fn();
const mockSubstituir = jest.fn();
const mockNavegar = jest.fn();
const mockVoltar = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockEmpurrar,
    replace: mockSubstituir,
    navigate: mockNavegar,
    back: mockVoltar,
  }),
  useLocalSearchParams: () => ({ id: 'e1' }),
  Stack: () => null,
}));

import TelaInicio from '@/app/(tabs)/inicio';
import TelaCriarConta from '@/app/criar-conta';
import TelaEntrar from '@/app/index';

/** A moldura que toda tela encontra em execução: área segura, sessão e o provedor de avisos. */
const comSessao = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaProvider initialMetrics={METRICAS}>
    <AuthProvider>
      <AvisoProvider>{children}</AvisoProvider>
    </AuthProvider>
  </SafeAreaProvider>
);

beforeEach(() => {
  mockEmpurrar.mockClear();
  mockSubstituir.mockClear();
  mockNavegar.mockClear();
  mockVoltar.mockClear();
});

describe('controles sem rota anunciam o destino', () => {
  it('"esqueci minha senha" explica quando a recuperação chega', async () => {
    await render(<TelaEntrar />, { wrapper: comSessao });

    await fireEvent.press(screen.getByRole('button', { name: 'esqueci minha senha' }));

    expect(screen.getByText(DESTINOS.recuperarSenha.titulo)).toBeTruthy();
    expect(screen.getByText(DESTINOS.recuperarSenha.descricao)).toBeTruthy();
    expect(screen.getByText(/chega na etapa 04/)).toBeTruthy();
  });

  it('o aviso fecha no "entendi"', async () => {
    await render(<TelaEntrar />, { wrapper: comSessao });
    await fireEvent.press(screen.getByRole('button', { name: 'esqueci minha senha' }));

    await fireEvent.press(screen.getByRole('button', { name: 'entendi' }));

    expect(screen.queryByText(DESTINOS.recuperarSenha.descricao)).toBeNull();
  });

  it('"usar outra conta" troca o sheet de contas pelo aviso', async () => {
    await render(<TelaEntrar />, { wrapper: comSessao });
    await fireEvent.press(screen.getByRole('button', { name: 'continuar com o Google' }));

    await fireEvent.press(screen.getByLabelText('usar outra conta'));

    // O sheet de contas precisa sair antes: dois modais empilhados prendem o foco do leitor de tela.
    expect(screen.queryByText(/escolha a conta Google/)).toBeNull();
    expect(screen.getByText(DESTINOS.outraConta.titulo)).toBeTruthy();
  });

  it('o mesmo vale na tela de criar conta', async () => {
    await render(<TelaCriarConta />, { wrapper: comSessao });
    await fireEvent.press(screen.getByRole('button', { name: 'criar conta com o Google' }));

    await fireEvent.press(screen.getByLabelText('usar outra conta'));

    expect(screen.getByText(DESTINOS.outraConta.titulo)).toBeTruthy();
  });

  it('"+ importar" anuncia a importação de receita', async () => {
    await render(<TelaInicio />, { wrapper: comSessao });

    await fireEvent.press(screen.getByRole('button', { name: '+ importar' }));

    expect(screen.getByText(DESTINOS.importarReceita.titulo)).toBeTruthy();
  });

  it('o cartão de receita-guia anuncia a tela da receita', async () => {
    await render(<TelaInicio />, { wrapper: comSessao });

    await fireEvent.press(
      screen.getByLabelText(/receita-guia Bolo de cenoura da vó/),
    );

    expect(screen.getByText(DESTINOS.receitaGuia.titulo)).toBeTruthy();
  });

  /** Nenhum desses controles pode navegar: a rota não existe. */
  it('anunciar um destino nunca navega', async () => {
    await render(<TelaInicio />, { wrapper: comSessao });
    await fireEvent.press(screen.getByRole('button', { name: '+ importar' }));

    expect(mockEmpurrar).not.toHaveBeenCalled();
    expect(mockSubstituir).not.toHaveBeenCalled();
  });
});

describe('controles com rota navegam de verdade', () => {
  it('"ver sua evolução" abre a tela de evolução', async () => {
    await render(<TelaInicio />, { wrapper: comSessao });

    await fireEvent.press(screen.getByRole('button', { name: 'ver sua evolução' }));

    expect(mockEmpurrar).toHaveBeenCalledWith('/evolucao');
  });

  it('a ficha de execução abre a execução correspondente', async () => {
    const primeira = EXECUCOES_RECENTES[0];
    await render(<TelaInicio />, { wrapper: comSessao });

    await fireEvent.press(
      await screen.findByLabelText(new RegExp(`^${primeira.prato}, tentativa ${primeira.tentativa}, ${primeira.data}`)),
    );

    // Rota tipada: caminho do arquivo mais o id em `params`.
    expect(mockEmpurrar).toHaveBeenCalledWith({
      pathname: '/execucao/[id]',
      params: { id: primeira.id },
    });
  });

  it('cada ficha leva à SUA execução, não sempre à primeira', async () => {
    const segunda = EXECUCOES_RECENTES[1];
    await render(<TelaInicio />, { wrapper: comSessao });

    await fireEvent.press(
      await screen.findByLabelText(new RegExp(`^${segunda.prato}, tentativa ${segunda.tentativa}, ${segunda.data}`)),
    );

    expect(mockEmpurrar).toHaveBeenCalledWith({
      pathname: '/execucao/[id]',
      params: { id: segunda.id },
    });
  });
});

describe('catálogo de destinos', () => {
  it('todo destino declara título, etapa e o que a tela vai fazer', () => {
    Object.entries(DESTINOS).forEach(([nome, destino]) => {
      expect(destino.titulo.length).toBeGreaterThan(0);
      expect(destino.descricao.length).toBeGreaterThan(0);
      expect(destino.etapa).toMatch(/^etapa \d{2}$/);
      // Caixa baixa em toda a interface, menos nomes próprios.
      expect(destino.titulo[0]).toBe(destino.titulo[0].toLowerCase());
      expect(nome).toBeTruthy();
    });
  });

  /** O recorte da etapa 03 é navegação, UX e acessibilidade. */
  it('nenhum destino promete a etapa 03, que não vai entregá-los', () => {
    Object.values(DESTINOS).forEach((destino) => {
      expect(destino.etapa).not.toBe('etapa 03');
    });
  });
});
