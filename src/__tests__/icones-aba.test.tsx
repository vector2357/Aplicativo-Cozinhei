/**
 * Ícones semânticos da barra de abas.
 *
 * O que está sendo protegido aqui são as quatro promessas da proposta de
 * ícones — as que quebram em silêncio se alguém mexer no lugar errado:
 *
 *   1. o ícone muda de CONTORNO para SÓLIDO quando a aba é selecionada,
 *      e a cor acompanha (cinza inativo -> tinta ativa);
 *   2. os quatro ocupam exatamente a MESMA caixa, no mesmo `viewBox`;
 *   3. o ícone não muda de tamanho ao ser tocado;
 *   4. o ícone cabe na aba junto com o rótulo, sem estourar a barra.
 *
 * `render` e `fireEvent` são assíncronos na v14 do testing-library: sem o
 * `await` a árvore ainda não existe quando a consulta roda.
 */
import { render, screen } from '@testing-library/react-native';

import { BotaoAba } from '@/components/navegacao/BotaoAba';
import { IconeAba, NOMES_ICONE_ABA, TAMANHO_ICONE_ABA } from '@/components/navegacao/IconeAba';
import type { NomeIconeAba } from '@/components/navegacao/IconeAba';
import { color, touch } from '@/theme';

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

/**
 * O ícone é escondido do leitor de tela de propósito — quem fala é o rótulo.
 * Por isso a consulta precisa de `includeHiddenElements`: o testing-library
 * ignora subárvores marcadas como inacessíveis, e ignorar é o comportamento
 * certo. O `react-native-svg` deixa medida, cor e traço no elemento raiz.
 */
const svgDe = (nome: NomeIconeAba) =>
  screen.getByTestId(`icone-aba-${nome}`, { includeHiddenElements: true });

/** Medida do ícone: a caixa em pontos mais a grade de desenho. */
function caixaDe(svg: { props: Record<string, unknown> }) {
  const { width, height, minX, minY, vbWidth, vbHeight } = svg.props;
  return `${width}x${height} @ ${minX} ${minY} ${vbWidth} ${vbHeight}`;
}

describe('IconeAba', () => {
  it('existe um desenho para cada uma das quatro abas', async () => {
    expect(NOMES_ICONE_ABA).toEqual(['inicio', 'historico', 'pratos', 'perfil']);

    for (const nome of NOMES_ICONE_ABA) {
      const { unmount } = await render(<IconeAba nome={nome} />);
      expect(svgDe(nome)).toBeTruthy();
      await unmount();
    }
  });

  it('desenha em contorno quando inativo, na cor de aba inativa', async () => {
    for (const nome of NOMES_ICONE_ABA) {
      const { unmount } = await render(<IconeAba nome={nome} ativo={false} />);
      const svg = svgDe(nome);
      // Contorno é a ausência de preenchimento.
      expect(svg.props.fill).toBe('none');
      expect(svg.props.stroke).toBe(color.tabInativa);
      await unmount();
    }
  });

  it('desenha sólido quando ativo, na cor de tinta', async () => {
    for (const nome of NOMES_ICONE_ABA) {
      const { unmount } = await render(<IconeAba nome={nome} ativo />);
      const svg = svgDe(nome);
      expect(svg.props.fill).toBe(color.ink);
      expect(svg.props.stroke).toBe(color.ink);
      await unmount();
    }
  });

  it('não usa âmbar, vinho nem oliva — essas cores têm outro significado', async () => {
    const reservadas = [color.amber, color.wine, color.olive];

    for (const nome of NOMES_ICONE_ABA) {
      for (const ativo of [false, true]) {
        const { unmount } = await render(<IconeAba nome={nome} ativo={ativo} />);
        const svg = svgDe(nome);
        expect(reservadas).not.toContain(svg.props.fill);
        expect(reservadas).not.toContain(svg.props.stroke);
        await unmount();
      }
    }
  });

  it('os quatro ocupam a mesma caixa, na mesma grade', async () => {
    const caixas = new Set<string>();

    for (const nome of NOMES_ICONE_ABA) {
      const { unmount } = await render(<IconeAba nome={nome} />);
      caixas.add(caixaDe(svgDe(nome)));
      await unmount();
    }

    // Um único formato para os quatro: é isso que mantém a simetria da barra.
    expect(caixas.size).toBe(1);
    expect([...caixas][0]).toBe(`${TAMANHO_ICONE_ABA}x${TAMANHO_ICONE_ABA} @ 0 0 24 24`);
  });

  it('não muda de tamanho ao ser selecionado', async () => {
    for (const nome of NOMES_ICONE_ABA) {
      const inativo = await render(<IconeAba nome={nome} ativo={false} />);
      const antes = caixaDe(svgDe(nome));
      await inativo.unmount();

      const ativo = await render(<IconeAba nome={nome} ativo />);
      expect(caixaDe(svgDe(nome))).toBe(antes);
      await ativo.unmount();
    }
  });

  it('aceita outro tamanho sem perder a proporção', async () => {
    await render(<IconeAba nome="perfil" tamanho={40} />);
    const svg = svgDe('perfil');

    expect(svg.props.width).toBe(40);
    expect(svg.props.height).toBe(40);
    // A grade não acompanha o tamanho: é ela que mantém o desenho proporcional.
    expect(svg.props.vbWidth).toBe(24);
    expect(svg.props.vbHeight).toBe(24);
  });

  it('fica invisível para o leitor de tela — quem fala é o rótulo da aba', async () => {
    await render(<IconeAba nome="inicio" />);
    const svg = svgDe('inicio');

    expect(svg.props.accessibilityElementsHidden).toBe(true);
    expect(svg.props.importantForAccessibility).toBe('no-hide-descendants');
  });
});

describe('BotaoAba com ícone', () => {
  it('mostra o ícone pedido junto do rótulo', async () => {
    await render(<BotaoAba rotulo="pratos" icone="pratos" />);

    expect(svgDe('pratos')).toBeTruthy();
    expect(screen.getByText('pratos')).toBeTruthy();
  });

  it('repassa o foco da aba para o estado do ícone', async () => {
    const inativo = await render(<BotaoAba rotulo="perfil" icone="perfil" />);
    expect(svgDe('perfil').props.fill).toBe('none');
    await inativo.unmount();

    await render(<BotaoAba rotulo="perfil" icone="perfil" isFocused />);
    expect(svgDe('perfil').props.fill).toBe(color.ink);
  });

  it('pinta ícone e rótulo com a MESMA cor, nos dois estados', async () => {
    const inativo = await render(<BotaoAba rotulo="início" icone="inicio" />);
    expect(svgDe('inicio').props.stroke).toBe(color.tabInativa);
    expect(estiloDe(screen.getByText('início')).color).toBe(color.tabInativa);
    await inativo.unmount();

    await render(<BotaoAba rotulo="início" icone="inicio" isFocused />);
    expect(svgDe('inicio').props.stroke).toBe(color.ink);
    expect(estiloDe(screen.getByText('início')).color).toBe(color.ink);
  });

  /**
   * A conta que garante que o ícone não empurra o rótulo para fora da barra:
   * 22 (ícone) + 5 (respiro) + 17 (linha do rótulo) = 44pt, dentro dos 56pt
   * da fatia, que por sua vez cabem nos 64pt da barra.
   */
  it('o ícone e o rótulo cabem na altura da aba, e a aba cabe na barra', async () => {
    await render(<BotaoAba rotulo="histórico" icone="historico" />);

    const aba = estiloDe(screen.getByRole('tab', { name: 'histórico' }));
    const alturaAba = aba.height as number;
    const respiro = aba.gap as number;
    const alturaRotulo = estiloDe(screen.getByText('histórico')).lineHeight as number;

    expect(TAMANHO_ICONE_ABA + respiro + alturaRotulo).toBeLessThanOrEqual(alturaAba);
    expect(alturaAba).toBeLessThanOrEqual(touch.tabBarHeight);
    // E o alvo tocável continua acima do piso do projeto.
    expect(alturaAba).toBeGreaterThanOrEqual(touch.minTarget);
  });
});
