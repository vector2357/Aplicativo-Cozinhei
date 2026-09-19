import { render, screen } from '@testing-library/react-native';
import fs from 'fs';
import path from 'path';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BotaoRegistrar } from '@/components/navegacao/BotaoRegistrar';
import { color, interacao, text } from '@/theme';

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

/**
 * Todo estilo de "pressionado" declarado no código de componente.
 *
 * O estado pressionado do `Pressable` não é observável no renderizador de
 * teste: `props.style` chega já resolvido para o estado solto, e o evento
 * sintético de toque não muda o estado interno do componente. Medir o valor
 * renderizado exigiria o aparelho.
 *
 * O que dá para verificar — e é o que a regra realmente diz — é que nenhum
 * componente ESCREVE o número à mão. A regra do projeto é que valor que não
 * existe em `src/theme` não deveria existir na interface; aqui ela vira
 * teste, lendo a fonte em vez do resultado.
 */
function estilosPressionadoDeclarados(): { arquivo: string; corpo: string }[] {
  const raiz = path.join(__dirname, '..', 'components');
  const encontrados: { arquivo: string; corpo: string }[] = [];

  const percorrer = (diretorio: string) => {
    fs.readdirSync(diretorio, { withFileTypes: true }).forEach((entrada) => {
      const caminho = path.join(diretorio, entrada.name);
      if (entrada.isDirectory()) return percorrer(caminho);
      if (!entrada.name.endsWith('.tsx') && !entrada.name.endsWith('.ts')) return;

      const fonte = fs.readFileSync(caminho, 'utf8');
      // `pressionado: { ... }` dentro de um StyleSheet.create.
      const declaracoes = fonte.matchAll(/pressionado:\s*\{([^}]*)\}/g);
      for (const declaracao of declaracoes) {
        encontrados.push({ arquivo: entrada.name, corpo: declaracao[1] });
      }
    });
  };

  percorrer(raiz);
  return encontrados;
}

describe('X-01 · um só feedback de toque', () => {
  it('existe pelo menos um estilo de pressionado para verificar', () => {
    expect(estilosPressionadoDeclarados().length).toBeGreaterThanOrEqual(5);
  });

  it('nenhum componente escreve a opacidade do toque à mão', () => {
    estilosPressionadoDeclarados().forEach(({ arquivo, corpo }) => {
      const temLiteral = /opacity:\s*\d*\.?\d+\s*[,}]/.test(corpo);
      expect({ arquivo, escreveOpacidadeLiteral: temLiteral }).toEqual({
        arquivo,
        escreveOpacidadeLiteral: false,
      });
    });
  });

  it('todo estilo de pressionado sai do token de interação', () => {
    estilosPressionadoDeclarados().forEach(({ arquivo, corpo }) => {
      expect({ arquivo, usaToken: corpo.includes('interacao.') }).toEqual({
        arquivo,
        usaToken: true,
      });
    });
  });

  it('o token existe e é uma opacidade válida', () => {
    expect(interacao.opacidadePressionado).toBeGreaterThan(0);
    expect(interacao.opacidadePressionado).toBeLessThan(1);
  });

  /**
   * O `+` é a exceção declarada: clarear âmbar tira dele a cor que o
   * identifica como a ação principal, então ele encolhe em vez de esmaecer.
   */
  it('o botão de registrar encolhe em vez de esmaecer', () => {
    const fab = estilosPressionadoDeclarados().find((e) => e.arquivo === 'BotaoRegistrar.tsx');

    expect(fab?.corpo).toContain('scale');
    expect(fab?.corpo).toContain('interacao.escalaPressionado');
    expect(fab?.corpo).not.toContain('opacity');
  });

  it('a escala do toque encolhe, e pouco: sumir seria pior que não responder', () => {
    expect(interacao.escalaPressionado).toBeLessThan(1);
    expect(interacao.escalaPressionado).toBeGreaterThanOrEqual(0.9);
  });
});

describe('A-05 · o anel do botão de registrar', () => {
  it('tem borda escura: âmbar sozinho não se separa do fundo claro', async () => {
    await render(<BotaoRegistrar base={22} onPress={() => {}} />, { wrapper: comArea });

    const estilo = estiloDe(screen.getByRole('button', { name: 'registrar execução' }));
    expect(estilo.backgroundColor).toBe(color.amber);
    expect(estilo.borderColor).toBe(color.ink);
    expect(estilo.borderWidth).toBeGreaterThanOrEqual(1);
  });
});

describe('I-02 · piso de tamanho de texto', () => {
  /**
   * `overline` é o rótulo dos campos de formulário; `dataMeta` carrega as
   * mensagens de erro. Os dois eram os menores textos do app, justamente
   * onde o tamanho mais importa.
   */
  it('nenhum estilo de texto fica abaixo de 11px', () => {
    Object.entries(text).forEach(([nome, estilo]) => {
      expect({ nome, fontSize: estilo.fontSize }).toMatchObject({
        fontSize: expect.any(Number),
      });
      expect(estilo.fontSize).toBeGreaterThanOrEqual(11);
    });
  });

  it('a mensagem de erro e a dica usam pelo menos 12px', () => {
    expect(text.dataMeta.fontSize).toBeGreaterThanOrEqual(12);
  });

  it('o rótulo de campo em caixa alta usa pelo menos 11px', () => {
    expect(text.overline.fontSize).toBeGreaterThanOrEqual(11);
  });
});
