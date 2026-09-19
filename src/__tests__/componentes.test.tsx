import { fireEvent, render, screen } from '@testing-library/react-native';

import { CartaoExecucao } from '@/components/execucao';
import { Botao, Chip, Estrelas, SeletorSegmentado } from '@/components/ui';
import { chipVariant, color, touch } from '@/theme';
import type { Execucao } from '@/types/dominio';

const EXECUCAO: Execucao = {
  id: 'teste',
  prato: 'Bolo de cenoura',
  tentativa: '04',
  data: '19 ago',
  tempo: '1h05',
  custo: 12.8,
  nota: 4.5,
  chips: [
    { texto: 'massa fofa', tipo: 'qualidade' },
    { texto: 'borda seca', tipo: 'defeito' },
  ],
};

/** Achata o style de um elemento, que pode ser objeto ou array aninhado. */
function estiloDe(elemento: { props: { style?: unknown } }): Record<string, unknown> {
  const plano: Record<string, unknown> = {};
  const empilhar = (valor: unknown) => {
    if (Array.isArray(valor)) valor.forEach(empilhar);
    else if (valor && typeof valor === 'object') Object.assign(plano, valor);
  };
  empilhar(elemento.props.style);
  return plano;
}

describe('Botao', () => {
  it('dispara o onPress', async () => {
    const aoTocar = jest.fn();
    await render(<Botao titulo="entrar" onPress={aoTocar} />);
    await fireEvent.press(screen.getByRole('button', { name: 'entrar' }));
    expect(aoTocar).toHaveBeenCalledTimes(1);
  });

  it('não dispara quando carregando', async () => {
    const aoTocar = jest.fn();
    await render(<Botao titulo="entrar" onPress={aoTocar} carregando />);
    await fireEvent.press(screen.getByRole('button', { name: 'entrar' }));
    expect(aoTocar).not.toHaveBeenCalled();
  });

  it('usa âmbar com tinta escura na variante principal', async () => {
    await render(<Botao titulo="entrar" onPress={() => {}} />);
    const estilo = estiloDe(screen.getByRole('button', { name: 'entrar' }));
    expect(estilo.backgroundColor).toBe(color.amber);
    // Texto sobre âmbar é sempre tinta escura, nunca branco.
    expect(estiloDe(screen.getByText('entrar')).color).toBe(color.ink);
  });

  it('respeita o piso de 44pt de alvo tocável em todas as variantes', async () => {
    for (const variante of ['principal', 'secundaria', 'fantasma', 'contornoEscuro'] as const) {
      const { unmount } = await render(
        <Botao titulo="acao" variante={variante} onPress={() => {}} />,
      );
      const altura = estiloDe(screen.getByRole('button', { name: 'acao' })).minHeight;
      expect(altura as number).toBeGreaterThanOrEqual(touch.minTarget);
      await unmount();
    }
  });
});

describe('Chip', () => {
  it('pinta qualidade de oliva', async () => {
    await render(<Chip texto="massa fofa" tipo="qualidade" />);
    expect(estiloDe(screen.getByText('massa fofa')).color).toBe(chipVariant.quality.foreground);
  });

  it('pinta defeito de vinho', async () => {
    await render(<Chip texto="borda seca" tipo="defeito" />);
    expect(estiloDe(screen.getByText('borda seca')).color).toBe(chipVariant.defect.foreground);
  });

  it('anuncia que um defeito acionável abre o diagnóstico', async () => {
    await render(<Chip texto="borda seca" tipo="defeito" onPress={() => {}} />);
    expect(screen.getByLabelText('defeito borda seca. abre o diagnóstico')).toBeTruthy();
  });

  it('sem onPress não é um botão', async () => {
    await render(<Chip texto="massa fofa" tipo="qualidade" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('Estrelas', () => {
  it('mostra a nota em padrão brasileiro e a anuncia por extenso', async () => {
    await render(<Estrelas nota={4.5} />);
    expect(screen.getByText('4,5')).toBeTruthy();
    expect(screen.getByLabelText('nota 4,5 de 5')).toBeTruthy();
  });
});

describe('SeletorSegmentado', () => {
  it('marca a opção ativa e avisa a troca', async () => {
    const aoTrocar = jest.fn();
    await render(
      <SeletorSegmentado
        valor="entrar"
        opcoes={[
          { valor: 'entrar', rotulo: 'entrar' },
          { valor: 'criar', rotulo: 'criar conta' },
        ]}
        onChange={aoTrocar}
      />,
    );
    expect(screen.getByRole('tab', { name: 'entrar' }).props.accessibilityState).toMatchObject({
      selected: true,
    });
    await fireEvent.press(screen.getByRole('tab', { name: 'criar conta' }));
    expect(aoTrocar).toHaveBeenCalledWith('criar');
  });
});

describe('CartaoExecucao', () => {
  it('na variante ficha mostra a calha da tentativa, custo e chips', async () => {
    await render(<CartaoExecucao execucao={EXECUCAO} variante="ficha" onPress={() => {}} />);
    expect(screen.getByText('04')).toBeTruthy();
    expect(screen.getByText('tent.')).toBeTruthy();
    expect(screen.getByText(/19 ago · 1h05 · R\$/)).toBeTruthy();
    expect(screen.getByText('massa fofa')).toBeTruthy();
    expect(screen.getByText('borda seca')).toBeTruthy();
  });

  it('na variante resumo esconde a calha e os chips', async () => {
    await render(<CartaoExecucao execucao={EXECUCAO} variante="resumo" onPress={() => {}} />);
    expect(screen.queryByText('tent.')).toBeNull();
    expect(screen.queryByText('massa fofa')).toBeNull();
    expect(screen.getByText('tentativa 04 · 19 ago')).toBeTruthy();
  });

  it('é tocável e identifica a execução para o leitor de tela', async () => {
    const aoTocar = jest.fn();
    await render(<CartaoExecucao execucao={EXECUCAO} onPress={aoTocar} />);
    await fireEvent.press(screen.getByLabelText('Bolo de cenoura, tentativa 04, 19 ago'));
    expect(aoTocar).toHaveBeenCalledTimes(1);
  });
});
