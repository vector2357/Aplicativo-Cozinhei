import { render, screen } from '@testing-library/react-native';
import { readFileSync } from 'node:fs';
import { PixelRatio } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CartaoExecucao } from '@/components/execucao';
import { estilosBarraAbas, folgaEntreAbas } from '@/components/navegacao/estilosBarraAbas';
import { BotaoAba } from '@/components/navegacao/BotaoAba';
import { Estrelas } from '@/components/ui';
import { EXECUCOES, USUARIO_EXEMPLO } from '@/features/execucoes/fixtures';
import {
  buscarExecucao,
  garantirDadosDoDono,
  listarExecucoesDoPrato,
  listarExecucoes,
  obterEstatisticas,
} from '@/features/execucoes/repositorio';
import { escalaDeFonte, touch } from '@/theme';

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

// A-07 · a fonte do sistema pode crescer, o layout não pode quebrar.

describe('A-07 · ampliação da fonte do sistema', () => {
  it('o rótulo da calha tem teto: ele mora numa caixa de largura fixa', async () => {
    await render(<CartaoExecucao execucao={EXECUCOES[0]} variante="ficha" onPress={() => {}} />, { wrapper: comArea });

    const rotulo = screen.getByText('tent.', { includeHiddenElements: true });
    expect(rotulo.props.maxFontSizeMultiplier).toBe(escalaDeFonte.emCaixaFixa);
  });

  it('o número da tentativa usa o mesmo teto do rótulo ao lado dele', async () => {
    await render(<CartaoExecucao execucao={EXECUCOES[0]} variante="ficha" onPress={() => {}} />, { wrapper: comArea });

    const numero = screen.getByText(/^\d{2}$/, { includeHiddenElements: true });
    expect(numero.props.maxFontSizeMultiplier).toBe(escalaDeFonte.emCaixaFixa);
  });

  it('o rótulo da aba tem o teto mais apertado: quatro precisam caber lado a lado', async () => {
    await render(<BotaoAba rotulo="histórico" icone="historico" />, { wrapper: comArea });

    expect(screen.getByText('histórico').props.maxFontSizeMultiplier).toBe(escalaDeFonte.emAba);
  });

  it('o teto da aba é menor que o da calha — a fatia da aba é mais estreita', () => {
    expect(escalaDeFonte.emAba).toBeLessThan(escalaDeFonte.emCaixaFixa);
  });

  // Defeito que só o emulador pegou: a 200%, "TENT." quebrava dentro da calha.
  describe('a calha cresce junto com a fonte, em vez de espremer o rótulo', () => {
    const larguraDaCalha = async () => {
      await render(<CartaoExecucao execucao={EXECUCOES[0]} variante="ficha" onPress={() => {}} />, {
        wrapper: comArea,
      });
      const rotulo = screen.getByText('tent.', { includeHiddenElements: true });
      return (estiloDe(rotulo.parent as never).width ?? 0) as number;
    };

    // `jest.restoreAllMocks()` derrubaria a suíte: restaura os mocks do preset também.
    let espiao: jest.SpyInstance<number, []> | undefined;
    const comEscalaDeFonte = (valor: number) => {
      espiao = jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(valor);
    };
    afterEach(() => espiao?.mockRestore());

    it('com a fonte no padrão, a calha tem a largura de projeto', async () => {
      comEscalaDeFonte(1);
      expect(await larguraDaCalha()).toBe(46);
    });

    it('com a fonte do sistema em 200%, a calha acompanha', async () => {
      comEscalaDeFonte(2);
      expect(await larguraDaCalha()).toBeGreaterThan(46);
    });

    it('a calha para de crescer no mesmo teto que segura o texto', async () => {
      comEscalaDeFonte(3);
      expect(await larguraDaCalha()).toBe(46 * escalaDeFonte.emCaixaFixa);
    });

    it('o rótulo nunca quebra linha, aconteça o que acontecer', async () => {
      comEscalaDeFonte(2);
      await render(<CartaoExecucao execucao={EXECUCOES[0]} variante="ficha" onPress={() => {}} />, {
        wrapper: comArea,
      });

      expect(
        screen.getByText('tent.', { includeHiddenElements: true }).props.numberOfLines,
      ).toBe(1);
    });

    it('com a fonte grande a miniatura sai da ficha', async () => {
      comEscalaDeFonte(2);
      await render(<CartaoExecucao execucao={EXECUCOES[0]} variante="ficha" onPress={() => {}} />, {
        wrapper: comArea,
      });

      expect(screen.queryByTestId('midia-placeholder', { includeHiddenElements: true })).toBeNull();
    });

    it('com a fonte no padrão a miniatura continua onde sempre esteve', async () => {
      comEscalaDeFonte(1);
      await render(<CartaoExecucao execucao={EXECUCOES[0]} variante="ficha" onPress={() => {}} />, {
        wrapper: comArea,
      });

      expect(
        screen.getByTestId('midia-placeholder', { includeHiddenElements: true }),
      ).toBeTruthy();
    });

    it('com a fonte grande, o nome do prato ganha uma segunda linha', async () => {
      comEscalaDeFonte(2);
      await render(<CartaoExecucao execucao={EXECUCOES[0]} variante="ficha" onPress={() => {}} />, {
        wrapper: comArea,
      });

      expect(
        screen.getByText(EXECUCOES[0].prato, { includeHiddenElements: true }).props.numberOfLines,
      ).toBe(2);
    });
  });

  // O teto é exceção: texto corrido precisa crescer para quem enxerga pouco.
  it('o texto do corpo da ficha NÃO tem teto — ele pode crescer à vontade', async () => {
    await render(<CartaoExecucao execucao={EXECUCOES[0]} variante="ficha" onPress={() => {}} />, { wrapper: comArea });

    const nome = screen.getByText(EXECUCOES[0].prato, { includeHiddenElements: true });
    expect(nome.props.maxFontSizeMultiplier).toBeUndefined();
  });
});

// A-16 · vão morto entre alvos vizinhos.

describe('A-16 · alvos vizinhos não podem se encostar', () => {
  it('cada aba reserva meia folga de cada lado', async () => {
    await render(<BotaoAba rotulo="pratos" icone="pratos" />, { wrapper: comArea });

    const fatia = estiloDe(screen.getByRole('tab'));
    expect(fatia.marginHorizontal).toBe(folgaEntreAbas(METRICAS.frame.width));
  });

  it('num aparelho comum, duas abas vizinhas somam o vão morto inteiro', () => {
    expect(folgaEntreAbas(390) * 2).toBe(touch.deadSpace);
    expect(folgaEntreAbas(360) * 2).toBe(touch.deadSpace);
  });

  it('o vão central separa o botão de registrar das abas dos dois lados', () => {
    const vao = estilosBarraAbas.vao as { width: number };
    expect(vao.width - touch.fabSize).toBe(touch.deadSpace * 2);
  });

  // O alvo de 44pt é piso da WCAG; o vão morto é recomendação da Aula 10.
  it.each([308, 320, 360, 375, 390, 412, 430])(
    'em %ipt de largura a fatia da aba continua acima do alvo mínimo',
    (largura) => {
      const barra = estilosBarraAbas.barra as {
        left: number;
        right: number;
        paddingHorizontal: number;
        borderWidth: number;
      };
      const vao = (estilosBarraAbas.vao as { width: number }).width;

      // A conta desconta TUDO o que a barra come — inclusive a borda.
      const util =
        largura - barra.left - barra.right - barra.borderWidth * 2 - barra.paddingHorizontal * 2 - vao;
      const fatia = util / 4 - folgaEntreAbas(largura) * 2;

      expect(fatia).toBeGreaterThanOrEqual(touch.minTarget);
    },
  );

  it('num aparelho estreito a folga encolhe em vez de comer o alvo', () => {
    expect(folgaEntreAbas(320)).toBeLessThan(touch.deadSpace / 2);
    expect(folgaEntreAbas(320)).toBeGreaterThanOrEqual(0);
  });
});

// A-18 · o idioma é declarado.

describe('A-18 · o leitor de tela precisa saber que o texto é português', () => {
  const appJson = JSON.parse(readFileSync('app.json', 'utf8')) as {
    expo: { ios: { infoPlist?: Record<string, unknown> } };
  };

  it('o iOS declara pt-BR como região de desenvolvimento', () => {
    expect(appJson.expo.ios.infoPlist?.CFBundleDevelopmentRegion).toBe('pt-BR');
  });

  it('o iOS lista pt-BR entre as localizações do pacote', () => {
    expect(appJson.expo.ios.infoPlist?.CFBundleLocalizations).toContain('pt-BR');
  });

  it('o alvo web declara o idioma no elemento raiz', () => {
    const html = readFileSync('src/app/+html.tsx', 'utf8');
    expect(html).toMatch(/<html lang="pt-BR">/);
  });
});

// A-14 · as estrelas se anunciam uma vez, como número.

describe('A-14 · estrelas', () => {
  it('os glifos saem da árvore: quem diz a nota é o rótulo do grupo', async () => {
    await render(<Estrelas nota={4.5} />, { wrapper: comArea });

    const grupo = screen.getByLabelText('nota 4,5 de 5');
    expect(grupo.props.accessible).toBe(true);

    const glifos = screen.getByText(/[★☆]/, { includeHiddenElements: true });
    expect(glifos.props.importantForAccessibility).toBe('no-hide-descendants');
  });
});

// D5 · nenhuma função do repositório entrega dados de outro dono.

describe('a porta de dados respeita o dono em TODAS as funções', () => {
  const DONO = USUARIO_EXEMPLO.email;
  const OUTRA_CONTA = 'acessibilidade-outra@exemplo.com';

  beforeAll(async () => {
    await garantirDadosDoDono(OUTRA_CONTA, false);
  });

  it('buscar uma execução por id não atravessa contas', async () => {
    const daMarina = await buscarExecucao(EXECUCOES[0].id, DONO);
    expect(daMarina).not.toBeNull();

    expect(await buscarExecucao(EXECUCOES[0].id, OUTRA_CONTA)).toBeNull();
  });

  it('listar as execuções de um prato não atravessa contas', async () => {
    const pratoId = EXECUCOES[0].pratoId;

    expect((await listarExecucoesDoPrato(pratoId, DONO)).length).toBeGreaterThan(0);
    expect(await listarExecucoesDoPrato(pratoId, OUTRA_CONTA)).toHaveLength(0);
  });

  /** Sem padrão: o dono é obrigatório justamente para não haver conta implícita. */
  it('conta sem dados devolve vazio em vez dos dados de alguém', async () => {
    expect(await listarExecucoes(OUTRA_CONTA)).toHaveLength(0);
    expect(await obterEstatisticas(OUTRA_CONTA)).toEqual({
      execucoes: 0,
      pratos: 0,
      notaMedia: 0,
      custoTotal: 0,
    });
  });
});
