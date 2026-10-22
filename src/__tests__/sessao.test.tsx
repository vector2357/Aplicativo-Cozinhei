import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import { Pressable, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { AvisoProvider } from '@/features/aviso/AvisoContext';
import { lerSessao, limparSessao, salvarSessao } from '@/features/auth/sessaoArmazenada';
import { USUARIO_EXEMPLO } from '@/features/execucoes/fixtures';

const METRICAS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const comProvedores = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaProvider initialMetrics={METRICAS}>
    <AuthProvider>
      <AvisoProvider>{children}</AvisoProvider>
    </AuthProvider>
  </SafeAreaProvider>
);

/** Expõe o estado do contexto em texto, para o teste poder ler e agir. */
function Sonda() {
  const { autenticado, usuario, sessaoVerificada, autenticar, entrar, sair } = useAuth();

  return (
    <>
      <Text>{sessaoVerificada ? 'sessão verificada' : 'verificando a sessão'}</Text>
      <Text>{autenticado ? `dentro: ${usuario?.email}` : 'fora da conta'}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="entrar e autenticar"
        onPress={() => {
          entrar({ email: 'quem@entrou.com', senha: 'segredo123' });
        }}
      >
        <Text>entrar</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="concluir autenticação"
        onPress={() => {
          autenticar();
        }}
      >
        <Text>autenticar</Text>
      </Pressable>

      <Pressable accessibilityRole="button" accessibilityLabel="sair" onPress={sair}>
        <Text>sair</Text>
      </Pressable>
    </>
  );
}

describe('sessaoArmazenada', () => {
  it('o que foi salvo volta igual na leitura seguinte', async () => {
    await salvarSessao(USUARIO_EXEMPLO);

    await expect(lerSessao()).resolves.toEqual(USUARIO_EXEMPLO);
  });

  it('sem nada guardado devolve null, não um objeto vazio', async () => {
    await expect(lerSessao()).resolves.toBeNull();
  });

  it('limpar apaga a sessão guardada', async () => {
    await salvarSessao(USUARIO_EXEMPLO);
    await limparSessao();

    await expect(lerSessao()).resolves.toBeNull();
  });

  /** Travar a abertura do app por um valor corrompido seria pior que entrar de novo. */
  it('valor corrompido vale o mesmo que sessão nenhuma, sem lançar', async () => {
    await AsyncStorage.setItem('cozinhei:sessao', '{isto não é json');

    await expect(lerSessao()).resolves.toBeNull();
  });
});

describe('AuthContext e a sessão guardada', () => {
  it('sem sessão guardada, o app nasce fora da conta', async () => {
    await render(<Sonda />, { wrapper: comProvedores });

    expect(await screen.findByText('sessão verificada')).toBeTruthy();
    expect(screen.getByText('fora da conta')).toBeTruthy();
  });

  /** É isto que faz reabrir o app cair direto nos dados. */
  it('com sessão guardada, restaura o usuário sem passar pela entrada', async () => {
    await salvarSessao(USUARIO_EXEMPLO);

    await render(<Sonda />, { wrapper: comProvedores });

    expect(await screen.findByText(`dentro: ${USUARIO_EXEMPLO.email}`)).toBeTruthy();
  });

  it('autenticar grava a sessão no disco', async () => {
    await render(<Sonda />, { wrapper: comProvedores });
    await screen.findByText('sessão verificada');

    await fireEvent.press(screen.getByRole('button', { name: 'entrar e autenticar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'concluir autenticação' }));

    // `autenticar` espera o atraso simulado de 1,8 s antes de aplicar a sessão.
    expect(
      await screen.findByText('dentro: quem@entrou.com', {}, { timeout: 5000 }),
    ).toBeTruthy();
    await expect(lerSessao()).resolves.toMatchObject({ email: 'quem@entrou.com' });
  });

  it('sair apaga a sessão guardada, e não só o estado em memória', async () => {
    await salvarSessao(USUARIO_EXEMPLO);
    await render(<Sonda />, { wrapper: comProvedores });
    await screen.findByText(`dentro: ${USUARIO_EXEMPLO.email}`);

    await fireEvent.press(screen.getByRole('button', { name: 'sair' }));

    expect(await screen.findByText('fora da conta')).toBeTruthy();
    await expect(lerSessao()).resolves.toBeNull();
  });
});

/**
 * O comportamento que o enunciado da etapa cobra, no app montado: encerrar e
 * reabrir não devolve a tela de entrada, e os dados do dono estão lá.
 */
describe('reabrir o app com sessão guardada', () => {
  it('abre direto no início, com os dados do dono na tela', async () => {
    await salvarSessao(USUARIO_EXEMPLO);

    const promessa = renderRouter('src/app', { initialUrl: '/' });
    await promessa;

    expect(await screen.findByText('continuar de onde parou')).toBeTruthy();
    expect(promessa.getPathname()).toBe('/inicio');
  });

  it('sem sessão guardada, abre na tela de entrada', async () => {
    const promessa = renderRouter('src/app', { initialUrl: '/' });
    await promessa;

    expect(await screen.findByText('seu diário de cozinha')).toBeTruthy();
    expect(promessa.getPathname()).toBe('/');
  });
});
