import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { color } from '@/theme';

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

/** As quatro abas, na ordem em que aparecem na barra, com seu ícone. */
const ABAS = [
  { rotulo: 'início', rota: '/inicio', icone: 'inicio' },
  { rotulo: 'histórico', rota: '/historico', icone: 'historico' },
  { rotulo: 'pratos', rota: '/pratos', icone: 'pratos' },
  { rotulo: 'perfil', rota: '/perfil', icone: 'perfil' },
] as const;

/**
 * O ícone é escondido do leitor de tela de propósito, então a consulta
 * precisa de `includeHiddenElements`. `fill` diz o estado: `none` é contorno,
 * a cor de tinta é sólido.
 */
const iconeDe = (nome: string) =>
  screen.getByTestId(`icone-aba-${nome}`, { includeHiddenElements: true });

/**
 * Monta o app inteiro a partir das rotas reais e espera a renderização.
 *
 * `renderRouter` não aguarda o `render`, que é assíncrono na v14 do
 * testing-library: ele devolve a própria promessa, com `getPathname` e
 * companhia pendurados nela. Como uma função `async` desembrulha qualquer
 * thenable que retorne, os métodos precisam ser repassados à mão — senão
 * chegam aqui como `undefined`.
 */
async function montarEm(url: string) {
  const promessa = renderRouter('src/app', { initialUrl: url });
  const render = await promessa;
  return {
    /** Caminho em que o roteador está agora. */
    caminho: () => promessa.getPathname(),
    desmontar: () => render.unmount(),
  };
}

/**
 * Monta o app JÁ DENTRO da sessão, numa rota de aba.
 *
 * As abas passaram a ser protegidas: sem sessão, o layout devolve
 * `<Redirect href="/" />` e a barra nem chega a montar. Testá-las exige
 * entrar de verdade — que é também o único caminho que o usuário tem.
 */
async function montarLogadoEm(rota: string) {
  const roteador = await montarEm('/');

  await fireEvent.changeText(screen.getByLabelText('e-mail'), 'marina@email.com');
  await fireEvent.changeText(screen.getByLabelText('senha'), 'segredo123');
  await fireEvent.press(screen.getByRole('button', { name: 'entrar' }));

  // A tela de espera resolve por tempo.
  await act(async () => {
    jest.advanceTimersByTime(2000);
  });

  if (roteador.caminho() !== rota) {
    await fireEvent.press(screen.getByRole('tab', { name: ROTULO_DA_ROTA[rota] }));
  }

  return roteador;
}

/** Qual aba leva a cada rota protegida. */
const ROTULO_DA_ROTA: Record<string, string> = {
  '/inicio': 'início',
  '/historico': 'histórico',
  '/pratos': 'pratos',
  '/perfil': 'perfil',
};

describe('navegador de abas', () => {
  it('monta com as quatro rotas registradas', async () => {
    // A regressão original: se os triggers não forem encontrados, este render
    // lança "Couldn't find any screens for the navigator".
    await montarLogadoEm('/inicio');

    for (const aba of ABAS) {
      expect(screen.getByRole('tab', { name: aba.rotulo })).toBeTruthy();
    }
  });

  it('abre em /inicio com a aba início selecionada', async () => {
    const roteador = await montarLogadoEm('/inicio');

    expect(roteador.caminho()).toBe('/inicio');
    expect(screen.getByRole('tab', { name: 'início' }).props.accessibilityState).toMatchObject({
      selected: true,
    });
    // E o conteúdo da tela, não só a aba.
    expect(screen.getByText('continuar de onde parou')).toBeTruthy();
  });

  it.each(ABAS.filter((a) => a.rota !== '/inicio'))(
    'a aba $rotulo navega para $rota',
    async ({ rotulo, rota }) => {
      const roteador = await montarLogadoEm('/inicio');

      await fireEvent.press(screen.getByRole('tab', { name: rotulo }));

      expect(roteador.caminho()).toBe(rota);
      expect(screen.getByRole('tab', { name: rotulo }).props.accessibilityState).toMatchObject({
        selected: true,
      });
    },
  );

  it('cada rota de aba monta direto, sem passar pelo início', async () => {
    for (const aba of ABAS) {
      const roteador = await montarLogadoEm(aba.rota);
      expect(roteador.caminho()).toBe(aba.rota);
      await roteador.desmontar();
    }
  });

  /**
   * Regressão: o `<TabTrigger>` injeta um `style` próprio com
   * `flexDirection: 'row'` e `justifyContent: 'space-between'`. Quando esse
   * estilo vem depois do nosso no array, ele vence — o ícone vai para a borda
   * esquerda da fatia, o rótulo para a direita, e cada rótulo passa a encostar
   * no ícone da aba seguinte. A barra fica esmagada, sem respiro entre abas.
   */
  it('empilha ícone e rótulo, sem deixar o estilo do TabTrigger vencer', async () => {
    await montarLogadoEm('/inicio');

    for (const aba of ABAS) {
      const estilo = estiloDe(screen.getByRole('tab', { name: aba.rotulo }));
      expect(estilo.flexDirection).toBe('column');
      expect(estilo.justifyContent).toBe('center');
      expect(estilo.alignItems).toBe('center');
      // Cada aba ocupa exatamente um quarto do que sobra da barra.
      expect(estilo.flex).toBe(1);
    }
  });

  /** O rótulo não pode assumir a largura natural e invadir a aba vizinha. */
  it('prende o rótulo à largura da própria aba', async () => {
    await montarLogadoEm('/inicio');

    for (const aba of ABAS) {
      const estilo = estiloDe(screen.getByText(aba.rotulo));
      expect(estilo.alignSelf).toBe('stretch');
      expect(estilo.textAlign).toBe('center');
    }
    // O mais longo é o que transbordaria primeiro.
    expect(screen.getByText('histórico').props.numberOfLines).toBe(1);
  });

  it('mostra os quatro ícones semânticos, um por aba', async () => {
    await montarLogadoEm('/inicio');

    for (const aba of ABAS) {
      expect(iconeDe(aba.icone)).toBeTruthy();
    }
  });

  /**
   * A promessa central da proposta de ícones: só a aba em que o usuário está
   * aparece sólida. Se duas ficassem sólidas — ou nenhuma — o ícone deixaria
   * de dizer onde ele está.
   */
  it.each(ABAS)('em $rota só o ícone de $rotulo fica sólido', async ({ rota, icone }) => {
    await montarLogadoEm(rota);

    for (const aba of ABAS) {
      const preenchimento = iconeDe(aba.icone).props.fill;
      if (aba.icone === icone) expect(preenchimento).toBe(color.ink);
      else expect(preenchimento).toBe('none');
    }
  });

  it('ao trocar de aba, o ícone antigo volta ao contorno e o novo fica sólido', async () => {
    await montarLogadoEm('/inicio');
    expect(iconeDe('inicio').props.fill).toBe(color.ink);
    expect(iconeDe('pratos').props.fill).toBe('none');

    await fireEvent.press(screen.getByRole('tab', { name: 'pratos' }));

    expect(iconeDe('inicio').props.fill).toBe('none');
    expect(iconeDe('pratos').props.fill).toBe(color.ink);
  });

  it('os quatro ícones da barra têm a mesma medida, sólidos ou não', async () => {
    await montarLogadoEm('/inicio');

    const medidas = new Set(
      ABAS.map((aba) => {
        const { width, height, vbWidth, vbHeight } = iconeDe(aba.icone).props;
        return `${width}x${height}@${vbWidth}x${vbHeight}`;
      }),
    );

    expect(medidas.size).toBe(1);
  });

  it('o botão + não é uma aba e abre as três formas de registrar', async () => {
    await montarLogadoEm('/inicio');

    const registrar = screen.getByLabelText('registrar execução');
    // É ação, não aba: não pode aparecer como tab na barra.
    expect(registrar.props.accessibilityRole).toBe('button');

    await fireEvent.press(registrar);

    expect(screen.getByText('como você quer registrar?')).toBeTruthy();
    expect(screen.getByText('gravar um áudio')).toBeTruthy();
    expect(screen.getByText('preencher à mão')).toBeTruthy();
    expect(screen.getByText('começar o cronômetro')).toBeTruthy();
  });
});

describe('fluxo de entrada até as abas', () => {
  it('a rota raiz é a tela de login, fora do navegador de abas', async () => {
    const roteador = await montarEm('/');

    expect(roteador.caminho()).toBe('/');
    expect(screen.getByText('seu diário de cozinha')).toBeTruthy();
    // A barra de abas não existe antes de entrar.
    expect(screen.queryByRole('tab', { name: 'pratos' })).toBeNull();
  });
});
