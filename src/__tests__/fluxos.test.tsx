import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

/**
 * Monta o app a partir das rotas reais e devolve o caminho atual.
 *
 * `renderRouter` devolve a própria promessa do render, com `getPathname`
 * pendurado nela; como uma função `async` desembrulha thenables, o método
 * precisa ser repassado à mão ou chega aqui como `undefined`.
 */
async function montarEm(url: string) {
  const promessa = renderRouter('src/app', { initialUrl: url });
  const render = await promessa;
  return {
    caminho: () => promessa.getPathname(),
    desmontar: () => render.unmount(),
  };
}

/** A tela de espera resolve por tempo; o fluxo precisa atravessá-la. */
async function esperarAutenticacao() {
  await act(async () => {
    jest.advanceTimersByTime(2000);
  });
}

describe('fluxo · entrar por e-mail e senha', () => {
  it('leva do login às abas, e o login NÃO fica na pilha', async () => {
    const app = await montarEm('/');
    expect(app.caminho()).toBe('/');

    await fireEvent.changeText(screen.getByLabelText('e-mail'), 'marina@email.com');
    await fireEvent.changeText(screen.getByLabelText('senha'), 'segredo123');
    await fireEvent.press(screen.getByRole('button', { name: 'entrar' }));

    expect(app.caminho()).toBe('/entrando');

    await esperarAutenticacao();
    expect(app.caminho()).toBe('/inicio');

    // O coração do B1: com `push`, o login continuava vivo embaixo das abas e
    // o voltar do Android o trazia de volta com os erros da tentativa
    // anterior. A tela de entrada não pode mais existir na pilha.
    expect(screen.queryByRole('button', { name: 'esqueci minha senha' })).toBeNull();

    app.desmontar();
  });

  it('o formulário inválido não navega para lugar nenhum', async () => {
    const app = await montarEm('/');

    await fireEvent.press(screen.getByRole('button', { name: 'entrar' }));

    expect(app.caminho()).toBe('/');
    expect(screen.getByText('informe seu e-mail')).toBeTruthy();

    app.desmontar();
  });
});

describe('fluxo · criar conta', () => {
  it('atravessa o cadastro até as abas', async () => {
    const app = await montarEm('/criar-conta');

    await fireEvent.changeText(screen.getByLabelText('como te chamamos'), 'Marina Salles');
    await fireEvent.changeText(screen.getByLabelText('e-mail'), 'marina@email.com');
    await fireEvent.changeText(screen.getByLabelText('senha'), 'oitocaracteres');
    await fireEvent.press(
      screen.getByRole('checkbox', {
        name: 'aceito os termos de uso e a política de privacidade',
      }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'criar minha conta' }));

    expect(app.caminho()).toBe('/entrando');

    await esperarAutenticacao();
    expect(app.caminho()).toBe('/inicio');

    app.desmontar();
  });

  it('alternar entre entrar e criar conta não empilha telas', async () => {
    const app = await montarEm('/');

    await fireEvent.press(screen.getByRole('tab', { name: 'criar conta' }));
    expect(app.caminho()).toBe('/criar-conta');

    await fireEvent.press(screen.getByRole('tab', { name: 'entrar' }));
    expect(app.caminho()).toBe('/');

    app.desmontar();
  });
});

describe('fluxo · descer ao segundo nível e voltar', () => {
  it('da tela de início até a evolução, e de volta', async () => {
    const app = await montarEm('/inicio');

    await fireEvent.press(screen.getByRole('button', { name: 'ver sua evolução' }));
    expect(app.caminho()).toBe('/evolucao');
    expect(screen.getByRole('header', { name: 'sua evolução' })).toBeTruthy();

    // A exigência E3 do enunciado: retornar para a tela anterior.
    await fireEvent.press(screen.getByRole('button', { name: 'voltar para início' }));
    expect(app.caminho()).toBe('/inicio');

    app.desmontar();
  });

  it('da ficha de execução à execução em detalhe, e de volta', async () => {
    const app = await montarEm('/inicio');

    await fireEvent.press(screen.getByLabelText(/Arroz de forno, tentativa 02/));
    expect(app.caminho()).toBe('/execucao/e1');
    // O título confirma que se chegou à execução certa.
    expect(await screen.findByRole('header', { name: 'Arroz de forno' })).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'voltar para a lista' }));
    expect(app.caminho()).toBe('/inicio');

    app.desmontar();
  });

  it('cada ficha abre a SUA execução', async () => {
    const app = await montarEm('/inicio');

    await fireEvent.press(screen.getByLabelText(/Bolo de cenoura, tentativa 04/));

    expect(app.caminho()).toBe('/execucao/e2');
    expect(await screen.findByRole('header', { name: 'Bolo de cenoura' })).toBeTruthy();

    app.desmontar();
  });

  /** Deep link direto, sem passar pela lista: o app precisa aguentar. */
  it('abre a execução por link direto, com id válido', async () => {
    const app = await montarEm('/execucao/e2');

    expect(await screen.findByRole('header', { name: 'Bolo de cenoura' })).toBeTruthy();

    app.desmontar();
  });

  it('abre sem quebrar mesmo com id inexistente', async () => {
    const app = await montarEm('/execucao/id-que-nao-existe');

    expect(await screen.findByRole('header', { name: 'execução' })).toBeTruthy();
    expect(app.caminho()).toBe('/execucao/id-que-nao-existe');

    app.desmontar();
  });
});

describe('fluxo · a barra de abas continua inteira', () => {
  it('as quatro abas navegam, e o segundo nível não as quebra', async () => {
    const app = await montarEm('/inicio');

    for (const [rotulo, rota] of [
      ['histórico', '/historico'],
      ['pratos', '/pratos'],
      ['perfil', '/perfil'],
      ['início', '/inicio'],
    ] as const) {
      await fireEvent.press(screen.getByRole('tab', { name: rotulo }));
      expect(app.caminho()).toBe(rota);
    }

    app.desmontar();
  });

  it('o + abre os caminhos de registro, e cada um explica quando chega', async () => {
    const app = await montarEm('/inicio');

    await fireEvent.press(screen.getByRole('button', { name: 'registrar execução' }));
    expect(screen.getByText('como você quer registrar?')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: /gravar um áudio/ }));

    // Um sheet fecha antes de o outro abrir: modais empilhados prendem o foco
    // do leitor de tela no de baixo.
    expect(screen.queryByText('como você quer registrar?')).toBeNull();
    expect(screen.getByText(/chega na etapa 04/)).toBeTruthy();

    app.desmontar();
  });

  it('o avatar da tela de início leva ao perfil', async () => {
    const app = await montarEm('/inicio');

    await fireEvent.press(screen.getByRole('button', { name: 'MS' }));

    expect(app.caminho()).toBe('/perfil');

    app.desmontar();
  });
});

describe('fluxo · nenhum controle fica mudo', () => {
  it('todo controle da tela de início devolve alguma coisa ao toque', async () => {
    const app = await montarEm('/inicio');

    // "+ importar" não navega, mas explica.
    await fireEvent.press(screen.getByRole('button', { name: '+ importar' }));
    expect(screen.getByText('importar receita-guia')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'entendi' }));

    // A receita-guia também.
    await fireEvent.press(screen.getByLabelText(/receita-guia Bolo de cenoura da vó/));
    expect(screen.getByText('receita-guia')).toBeTruthy();

    // Nenhum dos dois navegou: a rota ainda não existe.
    expect(app.caminho()).toBe('/inicio');

    app.desmontar();
  });

  it('"esqueci minha senha" explica em vez de ficar mudo', async () => {
    const app = await montarEm('/');

    await fireEvent.press(screen.getByRole('button', { name: 'esqueci minha senha' }));

    expect(screen.getByText('recuperar senha')).toBeTruthy();
    expect(app.caminho()).toBe('/');

    app.desmontar();
  });
});
