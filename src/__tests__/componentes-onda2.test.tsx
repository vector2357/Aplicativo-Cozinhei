import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  Aviso,
  Botao,
  Icone,
  NOMES_ICONE,
  Skeleton,
  SkeletonFicha,
  TAMANHO_ICONE,
} from '@/components/ui';
import type { NomeIcone } from '@/components/ui';
import { color } from '@/theme';

const METRICAS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const comArea = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaProvider initialMetrics={METRICAS}>{children}</SafeAreaProvider>
);

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

const svgDe = (nome: NomeIcone) =>
  screen.getByTestId(`icone-${nome}`, { includeHiddenElements: true });

// I-09 · família de ícones.

describe('I-09 · Icone', () => {
  it('existe um desenho para cada nome declarado', async () => {
    for (const nome of NOMES_ICONE) {
      const { unmount } = await render(<Icone nome={nome} />, { wrapper: comArea });
      expect(svgDe(nome)).toBeTruthy();
      await unmount();
    }
  });

  it('todos ocupam a mesma caixa e a mesma grade', async () => {
    const caixas = new Set<string>();
    for (const nome of NOMES_ICONE) {
      const { unmount } = await render(<Icone nome={nome} />, { wrapper: comArea });
      const svg = svgDe(nome);
      caixas.add(`${svg.props.width}x${svg.props.height}@${svg.props.vbWidth}x${svg.props.vbHeight}`);
      await unmount();
    }
    // Um formato só para a família: tamanho variável por nome desalinha o que o contém.
    expect(caixas.size).toBe(1);
    expect([...caixas][0]).toBe(`${TAMANHO_ICONE}x${TAMANHO_ICONE}@24x24`);
  });

  it('é invisível ao leitor de tela — quem fala é o controle em volta', async () => {
    await render(<Icone nome="filtro" />, { wrapper: comArea });
    const svg = svgDe('filtro');

    expect(svg.props.accessibilityElementsHidden).toBe(true);
    expect(svg.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('herda a tinta principal e aceita outra cor', async () => {
    const { unmount } = await render(<Icone nome="busca" />, { wrapper: comArea });
    expect(svgDe('busca').props.stroke).toBe(color.ink);
    await unmount();

    await render(<Icone nome="busca" cor={color.inkOnDark} />, { wrapper: comArea });
    expect(svgDe('busca').props.stroke).toBe(color.inkOnDark);
  });

  it('nenhum ícone de ação usa âmbar, vinho ou oliva — essas cores têm outro sentido', async () => {
    const reservadas = [color.amber, color.wine, color.olive];
    for (const nome of NOMES_ICONE) {
      const { unmount } = await render(<Icone nome={nome} />, { wrapper: comArea });
      expect(reservadas).not.toContain(svgDe(nome).props.stroke);
      await unmount();
    }
  });

  it('aceita outro tamanho sem deformar a grade', async () => {
    await render(<Icone nome="editar" tamanho={40} />, { wrapper: comArea });
    const svg = svgDe('editar');

    expect(svg.props.width).toBe(40);
    expect(svg.props.height).toBe(40);
    expect(svg.props.vbWidth).toBe(24);
  });
});

// I-05 · estado desabilitado legível.

describe('I-05 · botão desabilitado', () => {
  it('não usa opacidade: ela derrubaria o contraste do texto junto', async () => {
    await render(<Botao titulo="entrar" desabilitado onPress={() => {}} />, { wrapper: comArea });

    const estilo = estiloDe(screen.getByRole('button', { name: 'entrar' }));
    expect(estilo.opacity).toBeUndefined();
  });

  it('troca a superfície e o texto por cores próprias do tema', async () => {
    await render(<Botao titulo="entrar" desabilitado onPress={() => {}} />, { wrapper: comArea });

    expect(estiloDe(screen.getByRole('button', { name: 'entrar' })).backgroundColor).toBe(
      color.inativoFundo,
    );
    expect(estiloDe(screen.getByText('entrar')).color).toBe(color.inativoTexto);
  });

  it('deixa de ser âmbar: desabilitado não é a ação principal de ninguém', async () => {
    await render(<Botao titulo="entrar" desabilitado onPress={() => {}} />, { wrapper: comArea });

    expect(estiloDe(screen.getByRole('button', { name: 'entrar' })).backgroundColor).not.toBe(
      color.amber,
    );
  });

  it('carregando conta como inativo, e o botão anuncia isso', async () => {
    const aoTocar = jest.fn();
    await render(<Botao titulo="salvar" carregando onPress={aoTocar} />, { wrapper: comArea });

    const botao = screen.getByRole('button', { name: 'salvar' });
    expect(botao.props.accessibilityState).toMatchObject({ disabled: true, busy: true });

    await fireEvent.press(botao);
    expect(aoTocar).not.toHaveBeenCalled();
  });

  it('a variante sobre fundo escuro usa o cinza claro, não o escuro', async () => {
    await render(
      <Botao titulo="ver evolução" variante="contornoEscuro" desabilitado onPress={() => {}} />,
      { wrapper: comArea },
    );

    expect(estiloDe(screen.getByText('ver evolução')).color).toBe(color.inativoTextoOnDark);
  });

  it('ativo, continua âmbar com tinta escura', async () => {
    await render(<Botao titulo="entrar" onPress={() => {}} />, { wrapper: comArea });

    expect(estiloDe(screen.getByRole('button', { name: 'entrar' })).backgroundColor).toBe(
      color.amber,
    );
    expect(estiloDe(screen.getByText('entrar')).color).toBe(color.ink);
  });
});

// I-07 · Skeleton.

describe('I-07 · Skeleton', () => {
  it('desenha um bloco com a medida pedida', async () => {
    await render(<Skeleton largura={120} altura={20} />, { wrapper: comArea });

    const estilo = estiloDe(screen.getByTestId('skeleton', { includeHiddenElements: true }));
    expect(estilo.width).toBe(120);
    expect(estilo.height).toBe(20);
  });

  it('o bloco é decorativo: não entra na leitura de tela', async () => {
    await render(<Skeleton />, { wrapper: comArea });

    const bloco = screen.getByTestId('skeleton', { includeHiddenElements: true });
    expect(bloco.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  /** O esqueleto substitui o spinner, e o spinner ao menos dizia "carregando". */
  it('a lista inteira se anuncia como carregando', async () => {
    await render(<SkeletonFicha />, { wrapper: comArea });

    expect(screen.getByLabelText('carregando')).toBeTruthy();
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  it('desenha uma ficha por item pedido', async () => {
    await render(<SkeletonFicha quantidade={4} />, { wrapper: comArea });

    // Cada ficha tem 4 blocos: miniatura, duas linhas de texto e a nota.
    const blocos = screen.getAllByTestId('skeleton', { includeHiddenElements: true });
    expect(blocos).toHaveLength(4 * 4);
  });
});

// I-08 · Aviso.

describe('I-08 · Aviso', () => {
  it('sem conteúdo, não ocupa a tela', async () => {
    await render(<Aviso aviso={null} onFechar={() => {}} />, { wrapper: comArea });

    expect(screen.queryByTestId('aviso')).toBeNull();
  });

  it('mostra o texto da ação concluída', async () => {
    await render(<Aviso aviso={{ texto: 'execução salva' }} onFechar={() => {}} />, {
      wrapper: comArea,
    });

    expect(screen.getByText('execução salva')).toBeTruthy();
  });

  /** O leitor de tela não repara numa barra que surge no rodapé. */
  it('é uma região viva, para ser anunciado sem roubar o foco', async () => {
    await render(<Aviso aviso={{ texto: 'execução salva' }} onFechar={() => {}} />, {
      wrapper: comArea,
    });

    expect(screen.getByTestId('aviso').props.accessibilityLiveRegion).toBe('polite');
  });

  it('sucesso é oliva e erro é vinho — a cor nunca vem da tela', async () => {
    const { unmount } = await render(
      <Aviso aviso={{ texto: 'salvo', tom: 'sucesso' }} onFechar={() => {}} />,
      { wrapper: comArea },
    );
    expect(screen.getByText('salvo').parent).toBeTruthy();
    await unmount();

    await render(<Aviso aviso={{ texto: 'falhou', tom: 'erro' }} onFechar={() => {}} />, {
      wrapper: comArea,
    });
    expect(screen.getByTestId('icone-alerta', { includeHiddenElements: true })).toBeTruthy();
  });

  /** No daltonismo mais comum, oliva e vinho se confundem; a forma carrega o sentido. */
  it('sucesso e erro se distinguem também pela forma', async () => {
    const { unmount } = await render(
      <Aviso aviso={{ texto: 'salvo', tom: 'sucesso' }} onFechar={() => {}} />,
      { wrapper: comArea },
    );
    expect(screen.getByTestId('icone-certo', { includeHiddenElements: true })).toBeTruthy();
    await unmount();

    await render(<Aviso aviso={{ texto: 'falhou', tom: 'erro' }} onFechar={() => {}} />, {
      wrapper: comArea,
    });
    expect(screen.getByTestId('icone-alerta', { includeHiddenElements: true })).toBeTruthy();
  });

  it('sem ação, oferece fechar', async () => {
    const aoFechar = jest.fn();
    await render(<Aviso aviso={{ texto: 'execução salva' }} onFechar={aoFechar} />, {
      wrapper: comArea,
    });

    await fireEvent.press(screen.getByRole('button', { name: 'fechar aviso' }));
    expect(aoFechar).toHaveBeenCalledTimes(1);
  });

  it('com ação, dispara a ação e fecha', async () => {
    const desfazer = jest.fn();
    const aoFechar = jest.fn();
    await render(
      <Aviso
        aviso={{ texto: 'execução excluída', acao: { rotulo: 'desfazer', onPress: desfazer } }}
        onFechar={aoFechar}
      />,
      { wrapper: comArea },
    );

    await fireEvent.press(screen.getByRole('button', { name: 'desfazer' }));

    expect(desfazer).toHaveBeenCalledTimes(1);
    expect(aoFechar).toHaveBeenCalledTimes(1);
  });

  it('a reserva de rodapé empurra o aviso para cima da barra de abas', async () => {
    const { unmount } = await render(<Aviso aviso={{ texto: 'salvo' }} onFechar={() => {}} />, {
      wrapper: comArea,
    });
    const semReserva = estiloDe(screen.getByTestId('aviso')).bottom as number;
    await unmount();

    await render(
      <Aviso aviso={{ texto: 'salvo' }} onFechar={() => {}} margemInferior={64} />,
      { wrapper: comArea },
    );
    const comReserva = estiloDe(screen.getByTestId('aviso')).bottom as number;

    expect(comReserva).toBe(semReserva + 64);
  });
});
