import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/features/auth/AuthContext';
import { AvisoProvider } from '@/features/aviso/AvisoContext';
import { USUARIO_EXEMPLO } from '@/features/execucoes/fixtures';
import * as bancoLocal from '@/features/execucoes/bancoLocal';
import {
  buscarExecucao,
  criarExecucao,
  listarExecucoes,
  listarPratos,
  removerExecucao,
} from '@/features/execucoes/repositorio';

const METRICAS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

/** O dono que as telas usam sob o `AuthProvider` sem sessão aplicada. */
const DONO = USUARIO_EXEMPLO.email;

const mockVoltar = jest.fn();
const mockEmpurrar = jest.fn();
let mockParametrosDaRota: { id?: string } = {};

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

import TelaExecucao from '@/app/execucao/[id]';
import TelaFicha from '@/app/execucao/ficha';

const comSessao = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaProvider initialMetrics={METRICAS}>
    <AuthProvider>
      <AvisoProvider>{children}</AvisoProvider>
    </AuthProvider>
  </SafeAreaProvider>
);

/** Preenche o mínimo que a validação exige. */
async function preencherOMinimo(prato: string, tempo = '70', custo = '13,50') {
  await fireEvent.changeText(screen.getByLabelText('prato'), prato);
  await fireEvent.changeText(screen.getByLabelText('tempo'), tempo);
  await fireEvent.changeText(screen.getByLabelText('custo'), custo);
}

beforeEach(() => {
  mockVoltar.mockClear();
  mockEmpurrar.mockClear();
  mockParametrosDaRota = {};
});

describe('ficha nova', () => {
  it('se identifica como tela e pede o que a execução precisa', async () => {
    await render(<TelaFicha />, { wrapper: comSessao });

    expect(screen.getByRole('header', { name: 'nova execução' })).toBeTruthy();
    expect(screen.getByLabelText('prato')).toBeTruthy();
    expect(screen.getByLabelText('tempo')).toBeTruthy();
    expect(screen.getByLabelText('custo')).toBeTruthy();
    expect(screen.getByRole('header', { name: 'nota' })).toBeTruthy();
    expect(screen.getByLabelText('o que deu certo')).toBeTruthy();
    expect(screen.getByLabelText('o que deu errado')).toBeTruthy();
  });

  /** A tela modal não tem a barra de abas: a ação âmbar pode ser dela. */
  it('a única ação principal é salvar', async () => {
    await render(<TelaFicha />, { wrapper: comSessao });

    expect(screen.getByRole('button', { name: 'salvar execução' })).toBeTruthy();
  });

  it('salvar vazio mostra o que falta, em vez de gravar nada', async () => {
    const antes = await listarExecucoes(DONO);

    await render(<TelaFicha />, { wrapper: comSessao });
    await fireEvent.press(screen.getByRole('button', { name: 'salvar execução' }));

    expect(screen.getByText('diga o que você cozinhou')).toBeTruthy();
    expect(screen.getByText('informe quanto tempo levou')).toBeTruthy();
    expect(screen.getByText('informe quanto gastou')).toBeTruthy();
    await expect(listarExecucoes(DONO)).resolves.toHaveLength(antes.length);
    expect(mockVoltar).not.toHaveBeenCalled();
  });

  it('tempo que não é número é recusado com a razão', async () => {
    await render(<TelaFicha />, { wrapper: comSessao });
    await preencherOMinimo('Quiche', 'uma hora');
    await fireEvent.press(screen.getByRole('button', { name: 'salvar execução' }));

    expect(screen.getByText('use só números, em minutos')).toBeTruthy();
  });

  it('corrigir o campo apaga o erro dele', async () => {
    await render(<TelaFicha />, { wrapper: comSessao });
    await fireEvent.press(screen.getByRole('button', { name: 'salvar execução' }));
    expect(screen.getByText('diga o que você cozinhou')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('prato'), 'Quiche');

    expect(screen.queryByText('diga o que você cozinhou')).toBeNull();
  });

  it('grava a execução, volta e avisa', async () => {
    await render(<TelaFicha />, { wrapper: comSessao });
    await preencherOMinimo('Pavê de chocolate', '35', '22,40');
    await fireEvent.changeText(screen.getByLabelText('o que deu certo'), 'creme firme');
    await fireEvent.press(screen.getByRole('button', { name: 'salvar execução' }));

    const execucoes = await listarExecucoes(DONO);
    const criada = execucoes.find((execucao) => execucao.prato === 'Pavê de chocolate');

    expect(criada).toBeTruthy();
    expect(criada?.tempo).toBe('35 min');
    expect(criada?.custo).toBe(22.4);
    expect(criada?.chips).toEqual([{ texto: 'creme firme', tipo: 'qualidade' }]);
    expect(mockVoltar).toHaveBeenCalled();
    expect(await screen.findByText('execução registrada')).toBeTruthy();
  });

  /** O que importa aqui é a série de tentativas, que é o eixo do produto. */
  it('registrar um prato que já existe soma uma tentativa a ele', async () => {
    const pratosAntes = await listarPratos(DONO);
    const bolo = pratosAntes.find((prato) => prato.nome === 'Bolo de cenoura')!;

    await render(<TelaFicha />, { wrapper: comSessao });
    await preencherOMinimo('bolo de cenoura', '60', '12,00');
    await fireEvent.press(screen.getByRole('button', { name: 'salvar execução' }));

    const depois = await listarPratos(DONO);
    const mesmo = depois.find((prato) => prato.id === bolo.id);

    expect(mesmo?.tentativas).toBe(bolo.tentativas + 1);
    expect(mesmo?.evolucao).toHaveLength(bolo.tentativas + 1);
  });

  it('sair sem ter digitado nada volta direto, sem obstáculo', async () => {
    await render(<TelaFicha />, { wrapper: comSessao });

    await fireEvent.press(screen.getByRole('button', { name: /^voltar para/ }));

    expect(mockVoltar).toHaveBeenCalled();
    expect(screen.queryByText('descartar esta ficha?')).toBeNull();
  });

  it('sair com algo digitado confirma antes de descartar', async () => {
    await render(<TelaFicha />, { wrapper: comSessao });
    await fireEvent.changeText(screen.getByLabelText('prato'), 'Quiche');

    await fireEvent.press(screen.getByRole('button', { name: /^voltar para/ }));

    expect(screen.getByText('descartar esta ficha?')).toBeTruthy();
    expect(mockVoltar).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'descartar e sair' }));
    expect(mockVoltar).toHaveBeenCalled();
  });

  it('cancelar a confirmação mantém a ficha e o que foi digitado', async () => {
    await render(<TelaFicha />, { wrapper: comSessao });
    await fireEvent.changeText(screen.getByLabelText('prato'), 'Quiche');
    await fireEvent.press(screen.getByRole('button', { name: /^voltar para/ }));

    await fireEvent.press(screen.getByRole('button', { name: 'voltar e continuar' }));

    expect(mockVoltar).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue('Quiche')).toBeTruthy();
  });
});

describe('ficha em edição', () => {
  it('abre com os valores da execução já preenchidos', async () => {
    const criada = await criarExecucao(DONO, {
      prato: 'Sopa de abóbora',
      tempoMinutos: 65,
      custo: 14.9,
      nota: 4,
      defeito: 'pouco sal',
    });
    mockParametrosDaRota = { id: criada.id };

    await render(<TelaFicha />, { wrapper: comSessao });

    expect(await screen.findByRole('header', { name: 'editar execução' })).toBeTruthy();
    // "1h05" volta a 65 minutos: o campo é em minutos, não no formato de leitura.
    expect(screen.getByDisplayValue('65')).toBeTruthy();
    expect(screen.getByDisplayValue('14,9')).toBeTruthy();
    expect(screen.getByDisplayValue('pouco sal')).toBeTruthy();
  });

  /** Trocar o prato moveria a execução de série e renumeraria duas sequências. */
  it('mostra o prato como texto, e não como campo editável', async () => {
    const criada = await criarExecucao(DONO, {
      prato: 'Rabanada',
      tempoMinutos: 30,
      custo: 8,
      nota: 3,
    });
    mockParametrosDaRota = { id: criada.id };

    await render(<TelaFicha />, { wrapper: comSessao });
    await screen.findByRole('header', { name: 'editar execução' });

    expect(screen.queryByLabelText('prato')).toBeNull();
    expect(screen.getByText('Rabanada')).toBeTruthy();
  });

  it('salvar altera a execução guardada e avisa', async () => {
    const criada = await criarExecucao(DONO, {
      prato: 'Escondidinho',
      tempoMinutos: 50,
      custo: 26,
      nota: 3,
    });
    mockParametrosDaRota = { id: criada.id };

    await render(<TelaFicha />, { wrapper: comSessao });
    await screen.findByRole('header', { name: 'editar execução' });

    await fireEvent.changeText(screen.getByLabelText('custo'), '31,90');
    await fireEvent.press(screen.getByRole('tab', { name: '5' }));
    await fireEvent.press(screen.getByRole('button', { name: 'salvar alterações' }));

    const lida = await buscarExecucao(criada.id, DONO);

    expect(lida?.custo).toBe(31.9);
    expect(lida?.nota).toBe(5);
    // O que a edição não mexe continua igual.
    expect(lida?.pratoId).toBe(criada.pratoId);
    expect(lida?.tentativa).toBe(criada.tentativa);
    expect(await screen.findByText('ficha atualizada')).toBeTruthy();
  });

  /** O repositório devolve null sem lançar: o `catch` não pegaria isso. */
  it('salvar o que foi removido no meio da edição não anuncia sucesso', async () => {
    const criada = await criarExecucao(DONO, {
      prato: 'Torta capixaba',
      tempoMinutos: 90,
      custo: 60,
      nota: 4,
    });
    mockParametrosDaRota = { id: criada.id };

    await render(<TelaFicha />, { wrapper: comSessao });
    await screen.findByRole('header', { name: 'editar execução' });

    // Sai do banco enquanto a ficha está aberta.
    await removerExecucao(DONO, criada.id);

    await fireEvent.press(screen.getByRole('button', { name: 'salvar alterações' }));

    expect(await screen.findByText('não encontrei esta execução')).toBeTruthy();
    expect(screen.queryByText('ficha atualizada')).toBeNull();
    expect(mockVoltar).not.toHaveBeenCalled();
  });

  it('id que não existe mais explica o que aconteceu, em vez de ficar em branco', async () => {
    mockParametrosDaRota = { id: 'foi-removida' };

    await render(<TelaFicha />, { wrapper: comSessao });

    expect(await screen.findByText('não encontrei esta execução')).toBeTruthy();
  });
});

describe('remover a partir da execução em detalhe', () => {
  it('pede confirmação, e cancelar não remove nada', async () => {
    const criada = await criarExecucao(DONO, {
      prato: 'Cuscuz paulista',
      tempoMinutos: 40,
      custo: 17,
      nota: 4,
    });
    mockParametrosDaRota = { id: criada.id };

    await render(<TelaExecucao />, { wrapper: comSessao });
    await fireEvent.press(await screen.findByRole('button', { name: 'remover execução' }));

    expect(screen.getByText('remover esta execução?')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'voltar e continuar' }));

    await expect(buscarExecucao(criada.id, DONO)).resolves.not.toBeNull();
  });

  it('confirmar apaga a execução, volta e avisa', async () => {
    const criada = await criarExecucao(DONO, {
      prato: 'Empadão de frango',
      tempoMinutos: 75,
      custo: 29,
      nota: 4,
    });
    mockParametrosDaRota = { id: criada.id };

    await render(<TelaExecucao />, { wrapper: comSessao });
    await fireEvent.press(await screen.findByRole('button', { name: 'remover execução' }));
    await fireEvent.press(screen.getByRole('button', { name: 'remover' }));

    await expect(buscarExecucao(criada.id, DONO)).resolves.toBeNull();
    expect(mockVoltar).toHaveBeenCalled();
    expect(await screen.findByText('execução removida')).toBeTruthy();
  });

  /** Primeira etapa em que uma gravação pode falhar de verdade. */
  it('falha ao remover mantém a ficha e diz o que aconteceu', async () => {
    const criada = await criarExecucao(DONO, {
      prato: 'Baião de dois',
      tempoMinutos: 55,
      custo: 23,
      nota: 4,
    });
    mockParametrosDaRota = { id: criada.id };

    const apagar = jest.spyOn(bancoLocal, 'apagarExecucao').mockImplementationOnce(() => {
      throw new Error('disco cheio');
    });

    await render(<TelaExecucao />, { wrapper: comSessao });
    await fireEvent.press(await screen.findByRole('button', { name: 'remover execução' }));
    await fireEvent.press(screen.getByRole('button', { name: 'remover' }));

    expect(await screen.findByText(/não consegui remover/)).toBeTruthy();
    await expect(buscarExecucao(criada.id, DONO)).resolves.not.toBeNull();
    expect(mockVoltar).not.toHaveBeenCalled();

    apagar.mockRestore();
  });

  it('o cabeçalho oferece editar, e leva à ficha daquela execução', async () => {
    const criada = await criarExecucao(DONO, {
      prato: 'Farofa de banana',
      tempoMinutos: 20,
      custo: 9,
      nota: 4,
    });
    mockParametrosDaRota = { id: criada.id };

    await render(<TelaExecucao />, { wrapper: comSessao });
    await fireEvent.press(await screen.findByRole('button', { name: 'editar' }));

    expect(mockEmpurrar).toHaveBeenCalledWith(`/execucao/ficha?id=${criada.id}`);
  });
});

