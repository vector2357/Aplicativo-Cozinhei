import { fireEvent, render, screen } from '@testing-library/react-native';

import { CartaoExecucao } from '@/components/execucao';
import { Botao, Chip, Estrelas, SeletorSegmentado } from '@/components/ui';
import { chipVariant, color, touch } from '@/theme';
import type { Execucao } from '@/types/dominio';

const EXECUCAO: Execucao = {
  id: 'teste',
  pratoId: 'p1',
  prato: 'Bolo de cenoura',
  mes: 'agosto de 2026',
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
    expect(estiloDe(screen.getByText(/massa fofa/)).color).toBe(chipVariant.quality.foreground);
  });

  it('pinta defeito de vinho', async () => {
    await render(<Chip texto="borda seca" tipo="defeito" />);
    expect(estiloDe(screen.getByText(/borda seca/)).color).toBe(chipVariant.defect.foreground);
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
  /*
    `includeHiddenElements` aqui não é detalhe de teste: o conteúdo do cartão
    é invisível para o leitor de tela DE PROPÓSITO, porque o rótulo do cartão
    já diz tudo. Estas consultas olham o que o usuário VÊ; a árvore do leitor
    é assunto do teste logo abaixo.
  */
  const visivel = { includeHiddenElements: true } as const;

  it('na variante ficha mostra a calha da tentativa, custo e chips', async () => {
    await render(<CartaoExecucao execucao={EXECUCAO} variante="ficha" onPress={() => {}} />);
    expect(screen.getByText('04', visivel)).toBeTruthy();
    expect(screen.getByText('tent.', visivel)).toBeTruthy();
    expect(screen.getByText(/19 ago · 1h05 · R\$/, visivel)).toBeTruthy();
    expect(screen.getByText(/massa fofa/, visivel)).toBeTruthy();
    expect(screen.getByText(/borda seca/, visivel)).toBeTruthy();
  });

  it('na variante resumo esconde a calha e os chips', async () => {
    await render(<CartaoExecucao execucao={EXECUCAO} variante="resumo" onPress={() => {}} />);
    expect(screen.queryByText('tent.', visivel)).toBeNull();
    expect(screen.queryByText('massa fofa', visivel)).toBeNull();
    expect(screen.getByText('tentativa 04 · 19 ago', visivel)).toBeTruthy();
  });

  /*
    Medido com `uiautomator` num aparelho real: o chip e as estrelas apareciam
    como nós próprios DENTRO do cartão, e o TalkBack parava três vezes na
    mesma ficha, repetindo "qualidade: massa fofa". O `accessible` do
    `Pressable` resolve isso no iOS e não resolve no Android.
  */
  it('o leitor de tela para UMA vez por ficha, não uma vez por peça', async () => {
    await render(<CartaoExecucao execucao={EXECUCAO} variante="ficha" onPress={() => {}} />);

    // Sem `includeHiddenElements`: é exatamente o que o leitor enxerga.
    expect(screen.queryByText('massa fofa')).toBeNull();
    expect(screen.queryByLabelText('qualidade: massa fofa')).toBeNull();
    expect(screen.queryByLabelText(/^nota 4,5 de 5$/)).toBeNull();

    // E o que sobrou diz tudo o que as peças escondidas mostravam.
    const cartao = screen.getByLabelText(/massa fofa/);
    expect(cartao.props.accessibilityLabel).toContain('nota 4,5 de 5');
    expect(cartao.props.accessibilityLabel).toContain('defeito: borda seca');
  });

  it('é tocável e identifica a execução para o leitor de tela', async () => {
    const aoTocar = jest.fn();
    await render(<CartaoExecucao execucao={EXECUCAO} onPress={aoTocar} />);
    // O rótulo passou a carregar também a nota — sem ela, a lista era
    // percorrida sem se ouvir o dado que ela existe para dar.
    await fireEvent.press(
      screen.getByLabelText('Bolo de cenoura, tentativa 04, 19 ago, nota 4,5 de 5'),
    );
    expect(aoTocar).toHaveBeenCalledTimes(1);
  });
});
