import { act, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { useEmConstrucao } from '@/hooks/useEmConstrucao';
import { useErrosFormulario } from '@/hooks/useErrosFormulario';
import type { ErrosCriarConta } from '@/features/auth/validacao';

/** Executa um hook e devolve a referência viva do seu retorno. */
async function executarHook<T>(usar: () => T): Promise<{ atual: () => T }> {
  let ultimo: T;
  function Sonda() {
    ultimo = usar();
    return <Text>sonda</Text>;
  }
  await render(<Sonda />);
  expect(screen.getByText('sonda')).toBeTruthy();
  return { atual: () => ultimo };
}

describe('useErrosFormulario', () => {
  it('nasce sem nenhum erro', async () => {
    const hook = await executarHook(() => useErrosFormulario<ErrosCriarConta>());
    expect(hook.atual().erros).toEqual({});
  });

  it('guarda o resultado da validação', async () => {
    const hook = await executarHook(() => useErrosFormulario<ErrosCriarConta>());
    await act(async () => {
      hook.atual().definirErros({ email: 'informe seu e-mail', senha: 'informe sua senha' });
    });
    expect(hook.atual().erros).toEqual({
      email: 'informe seu e-mail',
      senha: 'informe sua senha',
    });
  });

  /** O ponto do hook: corrigir o e-mail não pode apagar o aviso da senha, que continua errada. */
  it('limpa apenas o campo pedido, preservando os outros', async () => {
    const hook = await executarHook(() => useErrosFormulario<ErrosCriarConta>());
    await act(async () => {
      hook.atual().definirErros({
        nome: 'diga como te chamamos',
        email: 'informe seu e-mail',
        senha: 'informe sua senha',
      });
    });

    await act(async () => hook.atual().limparErro('email'));

    expect(hook.atual().erros).toEqual({
      nome: 'diga como te chamamos',
      senha: 'informe sua senha',
    });
  });

  it('limpar um campo sem erro não muda nada', async () => {
    const hook = await executarHook(() => useErrosFormulario<ErrosCriarConta>());
    await act(async () => hook.atual().definirErros({ senha: 'informe sua senha' }));
    const antes = hook.atual().erros;

    await act(async () => hook.atual().limparErro('email'));

    // Mesma referência: sem erro naquele campo, não há re-render a provocar.
    expect(hook.atual().erros).toBe(antes);
  });

  it('limparTudo esvazia', async () => {
    const hook = await executarHook(() => useErrosFormulario<ErrosCriarConta>());
    await act(async () => hook.atual().definirErros({ nome: 'diga como te chamamos' }));
    await act(async () => hook.atual().limparTudo());
    expect(hook.atual().erros).toEqual({});
  });
});

describe('useEmConstrucao', () => {
  const DESTINO = {
    titulo: 'importar receita-guia',
    etapa: 'etapa 05',
    descricao: 'trazer uma receita de link, pdf ou foto.',
  };

  it('nasce fechado', async () => {
    const hook = await executarHook(() => useEmConstrucao());
    expect(hook.atual().destino).toBeNull();
  });

  it('guarda o destino anunciado', async () => {
    const hook = await executarHook(() => useEmConstrucao());
    await act(async () => hook.atual().anunciar(DESTINO));
    expect(hook.atual().destino).toEqual(DESTINO);
  });

  it('fechar volta a null', async () => {
    const hook = await executarHook(() => useEmConstrucao());
    await act(async () => hook.atual().anunciar(DESTINO));
    await act(async () => hook.atual().fechar());
    expect(hook.atual().destino).toBeNull();
  });

  /** Uma tela tem vários controles órfãos e um sheet só: o último vence. */
  it('anunciar outro destino troca o anterior', async () => {
    const hook = await executarHook(() => useEmConstrucao());
    await act(async () => hook.atual().anunciar(DESTINO));
    await act(async () =>
      hook.atual().anunciar({ titulo: 'receita-guia', etapa: 'etapa 05', descricao: 'outra.' }),
    );
    expect(hook.atual().destino?.titulo).toBe('receita-guia');
  });
});
