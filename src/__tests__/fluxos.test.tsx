import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { EXECUCOES_RECENTES } from '@/features/execucoes/fixtures';
import { DESTINOS } from '@/features/navegacao/destinos';

/** Monta o app a partir das rotas reais e devolve o caminho atual. */
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

/** Entra no app de verdade e para na rota pedida. */
async function entrarEIrPara(rota: string) {
  const app = await montarEm('/');

  await fireEvent.changeText(screen.getByLabelText('e-mail'), 'marina@email.com');
  await fireEvent.changeText(screen.getByLabelText('senha'), 'segredo123');
  await fireEvent.press(screen.getByRole('button', { name: 'entrar' }));
  await esperarAutenticacao();

  const ABA = { '/historico': 'histórico', '/pratos': 'pratos', '/perfil': 'perfil' } as const;
  const rotulo = ABA[rota as keyof typeof ABA];
  if (rotulo) await fireEvent.press(screen.getByRole('tab', { name: rotulo }));

  return app;
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

    // Com `push`, o login seguia vivo sob as abas e o voltar do Android o ressuscitava.
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

  // O seletor deixou de navegar: entrar e criar conta são o mesmo lugar.
  it('alternar entre entrar e criar conta não mexe na pilha', async () => {
    const app = await montarEm('/');

    await fireEvent.press(screen.getByRole('tab', { name: 'criar conta' }));
    expect(app.caminho()).toBe('/');
    expect(screen.getByRole('button', { name: 'criar minha conta' })).toBeTruthy();

    await fireEvent.press(screen.getByRole('tab', { name: 'entrar' }));
    expect(app.caminho()).toBe('/');
    expect(screen.getByRole('button', { name: 'entrar' })).toBeTruthy();

    app.desmontar();
  });

  it('mas a rota /criar-conta continua existindo, e abre no cadastro', async () => {
    const app = await montarEm('/criar-conta');

    expect(app.caminho()).toBe('/criar-conta');
    expect(screen.getByRole('button', { name: 'criar minha conta' })).toBeTruthy();

    app.desmontar();
  });
});

describe('fluxo · descer ao segundo nível e voltar', () => {
  it('da tela de início até a evolução, e de volta', async () => {
    const app = await entrarEIrPara('/inicio');

    await fireEvent.press(screen.getByRole('button', { name: 'ver sua evolução' }));
    expect(app.caminho()).toBe('/evolucao');
    expect(screen.getByRole('header', { name: 'sua evolução' })).toBeTruthy();

    // A exigência E3 do enunciado: retornar para a tela anterior.
    await fireEvent.press(screen.getByRole('button', { name: 'voltar para início' }));
    expect(app.caminho()).toBe('/inicio');

    app.desmontar();
  });

  it('da ficha de execução à execução em detalhe, e de volta', async () => {
    const app = await entrarEIrPara('/inicio');

    const primeira = EXECUCOES_RECENTES[0];
    await fireEvent.press(
      await screen.findByLabelText(
        new RegExp(`^${primeira.prato}, tentativa ${primeira.tentativa}, ${primeira.data}`),
      ),
    );
    expect(app.caminho()).toBe(`/execucao/${primeira.id}`);
    // O título confirma que se chegou à execução certa.
    expect(await screen.findByRole('header', { name: primeira.prato })).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'voltar para a lista' }));
    expect(app.caminho()).toBe('/inicio');

    app.desmontar();
  });

  it('cada ficha abre a SUA execução', async () => {
    const app = await entrarEIrPara('/inicio');

    const segunda = EXECUCOES_RECENTES[1];
    await fireEvent.press(
      await screen.findByLabelText(
        new RegExp(`^${segunda.prato}, tentativa ${segunda.tentativa}, ${segunda.data}`),
      ),
    );

    expect(app.caminho()).toBe(`/execucao/${segunda.id}`);
    expect(await screen.findByRole('header', { name: segunda.prato })).toBeTruthy();

    app.desmontar();
  });

  /** Deep link direto, sem passar pela lista: o app precisa aguentar. */
  it('abre a execução por link direto, com id válido', async () => {
    const alvo = EXECUCOES_RECENTES[1];
    const app = await montarEm(`/execucao/${alvo.id}`);

    expect(await screen.findByRole('header', { name: alvo.prato })).toBeTruthy();

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
    const app = await entrarEIrPara('/inicio');

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
    const app = await entrarEIrPara('/inicio');

    await fireEvent.press(screen.getByRole('button', { name: 'registrar execução' }));
    expect(screen.getByText('como você quer registrar?')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: /gravar um áudio/ }));

    // Um sheet fecha antes do outro abrir: empilhados, prendem o foco no de baixo.
    expect(screen.queryByText('como você quer registrar?')).toBeNull();
    expect(screen.getByText(/chega na etapa 04/)).toBeTruthy();

    app.desmontar();
  });

  it('o avatar da tela de início leva ao perfil', async () => {
    const app = await entrarEIrPara('/inicio');

    await fireEvent.press(screen.getByRole('button', { name: /^perfil de/ }));

    expect(app.caminho()).toBe('/perfil');

    app.desmontar();
  });
});

describe('fluxo · o aviso de rodapé no app montado', () => {
  /** O provider vive no layout raiz, por fora do Stack. */
  it('o app monta com o provedor de avisos em volta das telas', async () => {
    const app = await entrarEIrPara('/inicio');

    // Se o provider faltasse, a árvore nem chegaria a renderizar a tela.
    expect(screen.getByText('continuar de onde parou')).toBeTruthy();
    expect(app.caminho()).toBe('/inicio');

    app.desmontar();
  });

  it('o mesmo vale nas telas de entrada, que ficam fora das abas', async () => {
    const app = await montarEm('/');

    expect(screen.getByRole('button', { name: 'entrar' })).toBeTruthy();
    expect(app.caminho()).toBe('/');

    app.desmontar();
  });
});

describe('fluxo · nenhum controle fica mudo', () => {
  it('todo controle da tela de início devolve alguma coisa ao toque', async () => {
    const app = await entrarEIrPara('/inicio');

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

describe('fluxo · a sessão protege o que é de dentro', () => {
  /** O app abria `/inicio` por link direto e afirmava estar logado sem nunca ter havido login. */
  it('link direto para uma aba, sem sessão, devolve o login', async () => {
    const app = await montarEm('/inicio');

    expect(app.caminho()).toBe('/');
    expect(screen.getByRole('button', { name: 'entrar' })).toBeTruthy();

    app.desmontar();
  });

  // Uma montagem por teste: repetir deixa resíduo na árvore que `screen` consulta.
  it.each(['/historico', '/pratos', '/perfil'])('o mesmo vale para %s', async (rota) => {
    const app = await montarEm(rota);

    expect(app.caminho()).toBe('/');

    app.desmontar();
  });

  it('com sessão, a aba abre normalmente', async () => {
    const app = await entrarEIrPara('/historico');

    expect(app.caminho()).toBe('/historico');
    expect(await screen.findByRole('header', { name: 'agosto de 2026' })).toBeTruthy();

    app.desmontar();
  });

  it('sair da conta devolve ao login e avisa', async () => {
    const app = await entrarEIrPara('/perfil');

    await fireEvent.press(await screen.findByRole('button', { name: 'sair da conta' }));

    expect(app.caminho()).toBe('/');
    expect(screen.getByText('você saiu da sua conta')).toBeTruthy();

    app.desmontar();
  });
});

describe('fluxo · do histórico ao detalhe e de volta', () => {
  it('abre a execução tocada e volta para o histórico', async () => {
    const app = await entrarEIrPara('/historico');
    const alvo = EXECUCOES_RECENTES[0];

    await fireEvent.press(
      await screen.findByLabelText(new RegExp(`^${alvo.prato}, tentativa ${alvo.tentativa}, ${alvo.data}`)),
    );
    expect(app.caminho()).toBe(`/execucao/${alvo.id}`);
    expect(await screen.findByRole('header', { name: alvo.prato })).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'voltar para a lista' }));
    expect(app.caminho()).toBe('/historico');

    app.desmontar();
  });
});

describe('fluxo · dos pratos à evolução de um prato', () => {
  it('abre o prato, mostra as tentativas e volta', async () => {
    const app = await entrarEIrPara('/pratos');

    // O primeiro da lista é o mais repetido, por ordenação do repositório.
    const cartao = (await screen.findAllByRole('button'))
      .map((no) => no.props.accessibilityLabel as string)
      .find((rotulo) => rotulo?.includes('tentativas,'));
    expect(cartao).toBeTruthy();

    await fireEvent.press(screen.getByLabelText(cartao!));
    expect(app.caminho()).toMatch(/^\/prato\//);
    expect(await screen.findByRole('header', { name: 'todas as tentativas' })).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'voltar para pratos' }));
    expect(app.caminho()).toBe('/pratos');

    app.desmontar();
  });

  it('do prato dá para descer até uma execução — três níveis, e de volta', async () => {
    const app = await entrarEIrPara('/pratos');

    const cartao = (await screen.findAllByRole('button'))
      .map((no) => no.props.accessibilityLabel as string)
      .find((rotulo) => rotulo?.includes('tentativas,'));
    await fireEvent.press(screen.getByLabelText(cartao!));
    await screen.findByRole('header', { name: 'todas as tentativas' });

    // Da tela do prato, entra numa das fichas dele.
    const fichas = screen
      .getAllByRole('button')
      .map((no) => no.props.accessibilityLabel as string)
      .filter((rotulo) => rotulo?.includes(', tentativa '));
    await fireEvent.press(screen.getByLabelText(fichas[0]));

    expect(app.caminho()).toMatch(/^\/execucao\//);

    // E volta pelos dois níveis, um de cada vez.
    await fireEvent.press(screen.getByRole('button', { name: 'voltar para a lista' }));
    expect(app.caminho()).toMatch(/^\/prato\//);

    await fireEvent.press(screen.getByRole('button', { name: 'voltar para pratos' }));
    expect(app.caminho()).toBe('/pratos');

    app.desmontar();
  });
});

describe('fluxo · conta nova encontra o app vazio', () => {
  /** Quem acaba de criar conta não pode ver o histórico de outra pessoa. */
  async function criarContaEEntrar() {
    const app = await montarEm('/criar-conta');

    await fireEvent.changeText(screen.getByLabelText('como te chamamos'), 'Joana Prado');
    await fireEvent.changeText(screen.getByLabelText('e-mail'), 'joana@email.com');
    await fireEvent.changeText(screen.getByLabelText('senha'), 'oitocaracteres');
    await fireEvent.press(
      screen.getByRole('checkbox', {
        name: 'aceito os termos de uso e a política de privacidade',
      }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'criar minha conta' }));
    await esperarAutenticacao();

    return app;
  }

  it('a tela de espera não promete execuções que a conta não tem', async () => {
    const app = await montarEm('/criar-conta');

    await fireEvent.changeText(screen.getByLabelText('como te chamamos'), 'Joana Prado');
    await fireEvent.changeText(screen.getByLabelText('e-mail'), 'joana@email.com');
    await fireEvent.changeText(screen.getByLabelText('senha'), 'oitocaracteres');
    await fireEvent.press(
      screen.getByRole('checkbox', {
        name: 'aceito os termos de uso e a política de privacidade',
      }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'criar minha conta' }));

    expect(screen.getByText('preparando sua primeira ficha.')).toBeTruthy();

    app.desmontar();
  });

  it('o início convida a registrar, em vez de mostrar dados de outra pessoa', async () => {
    const app = await criarContaEEntrar();

    expect(app.caminho()).toBe('/inicio');
    expect(await screen.findByText('sua cozinha começa aqui')).toBeTruthy();
    expect(screen.queryByText('continuar de onde parou')).toBeNull();

    app.desmontar();
  });

  it('o histórico convida a registrar a primeira', async () => {
    const app = await criarContaEEntrar();
    await fireEvent.press(screen.getByRole('tab', { name: 'histórico' }));

    expect(await screen.findByText('nenhuma execução ainda')).toBeTruthy();

    app.desmontar();
  });

  it('os pratos explicam que a curva aparece com a repetição', async () => {
    const app = await criarContaEEntrar();
    await fireEvent.press(screen.getByRole('tab', { name: 'pratos' }));

    expect(await screen.findByText('nenhum prato ainda')).toBeTruthy();

    app.desmontar();
  });

  // O painel de números não aparece para quem não tem números.
  it('o perfil convida ao primeiro registro em vez de mostrar zeros', async () => {
    const app = await criarContaEEntrar();
    await fireEvent.press(screen.getByRole('tab', { name: 'perfil' }));

    expect(await screen.findByText('seus números começam na primeira execução')).toBeTruthy();
    expect(screen.queryByLabelText('0 execuções')).toBeNull();
    expect(screen.getByRole('button', { name: 'como registrar' })).toBeTruthy();

    app.desmontar();
  });

  it('e o convite do perfil tem destino: abre o sheet de como registrar', async () => {
    const app = await criarContaEEntrar();
    await fireEvent.press(screen.getByRole('tab', { name: 'perfil' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'como registrar' }));

    expect(await screen.findByText(DESTINOS.registrarAMao.titulo)).toBeTruthy();

    app.desmontar();
  });
});
