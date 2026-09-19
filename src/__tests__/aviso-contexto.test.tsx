import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Pressable, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AvisoProvider, useAviso, useReservaDeRodape } from '@/features/aviso/AvisoContext';

const METRICAS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const comProvider = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaProvider initialMetrics={METRICAS}>
    <AvisoProvider>{children}</AvisoProvider>
  </SafeAreaProvider>
);

/** Tela de mentira que dispara avisos, como uma tela real faria. */
function TelaFalsa({ reserva }: { reserva?: number }) {
  const aviso = useAviso();
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="salvar"
        onPress={() => aviso.mostrar({ texto: 'execução salva', tom: 'sucesso' })}
      >
        <Text>salvar</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="falhar"
        onPress={() => aviso.mostrar({ texto: 'não consegui salvar', tom: 'erro' })}
      >
        <Text>falhar</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="esconder"
        onPress={aviso.esconder}
      >
        <Text>esconder</Text>
      </Pressable>
      {reserva !== undefined ? <ComReserva altura={reserva} /> : null}
    </>
  );
}

function ComReserva({ altura }: { altura: number }) {
  useReservaDeRodape(altura);
  return null;
}

beforeEach(() => {
  // O aviso sai de cena por tempo; sem relógio falso o teste teria de esperar
  // de verdade. `doNotFake: ['setImmediate']` vem do jest.config e é o que
  // mantém o `act` assíncrono funcionando.
  jest.useFakeTimers();
  jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

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

describe('AvisoProvider', () => {
  it('qualquer tela dentro dele consegue avisar', async () => {
    await render(<TelaFalsa />, { wrapper: comProvider });

    await fireEvent.press(screen.getByRole('button', { name: 'salvar' }));

    expect(screen.getByText('execução salva')).toBeTruthy();
  });

  it('o aviso some sozinho depois de alguns segundos', async () => {
    await render(<TelaFalsa />, { wrapper: comProvider });
    await fireEvent.press(screen.getByRole('button', { name: 'salvar' }));
    expect(screen.getByText('execução salva')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('execução salva')).toBeNull();
  });

  it('esconder tira o aviso antes da hora', async () => {
    await render(<TelaFalsa />, { wrapper: comProvider });
    await fireEvent.press(screen.getByRole('button', { name: 'salvar' }));

    await fireEvent.press(screen.getByRole('button', { name: 'esconder' }));

    expect(screen.queryByText('execução salva')).toBeNull();
  });

  /** Dois avisos empilhados esconderiam um ao outro; o novo substitui. */
  it('um aviso novo substitui o que estava na tela', async () => {
    await render(<TelaFalsa />, { wrapper: comProvider });

    await fireEvent.press(screen.getByRole('button', { name: 'salvar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'falhar' }));

    expect(screen.queryByText('execução salva')).toBeNull();
    expect(screen.getByText('não consegui salvar')).toBeTruthy();
  });

  it('o relógio do novo aviso recomeça, em vez de herdar o do anterior', async () => {
    await render(<TelaFalsa />, { wrapper: comProvider });

    await fireEvent.press(screen.getByRole('button', { name: 'salvar' }));
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    await fireEvent.press(screen.getByRole('button', { name: 'falhar' }));

    // Passaram 3s do primeiro; o segundo precisa dos seus 4s completos.
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.getByText('não consegui salvar')).toBeTruthy();
  });

  /**
   * Feedback que só existe na tela não existe para quem não a vê. A barra
   * aparece no rodapé, longe do foco do leitor — sem o anúncio, seria silêncio.
   */
  it('anuncia o texto ao leitor de tela', async () => {
    await render(<TelaFalsa />, { wrapper: comProvider });

    await fireEvent.press(screen.getByRole('button', { name: 'salvar' }));

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('execução salva');
  });

  it('a reserva de rodapé sobe o aviso acima do que já ocupa o rodapé', async () => {
    const { unmount } = await render(<TelaFalsa reserva={90} />, { wrapper: comProvider });
    await fireEvent.press(screen.getByRole('button', { name: 'salvar' }));
    const comReserva = estiloDe(screen.getByTestId('aviso')).bottom as number;
    await unmount();

    // Tela sem barra de abas: nada a reservar.
    await render(<TelaFalsa />, { wrapper: comProvider });
    await fireEvent.press(screen.getByRole('button', { name: 'salvar' }));
    const semReserva = estiloDe(screen.getByTestId('aviso')).bottom as number;

    expect(comReserva).toBe(semReserva + 90);
  });

  it('usar o hook fora do provider falha com mensagem clara', async () => {
    // O erro do React é ruidoso; aqui só interessa a mensagem do projeto.
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(render(<TelaFalsa />)).rejects.toThrow(
      'useAviso precisa estar dentro de <AvisoProvider>',
    );
  });
});
