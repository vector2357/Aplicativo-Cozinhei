import {
  MINIMO_SENHA,
  semErros,
  validarCriarConta,
  validarEntrar,
} from '@/features/auth/validacao';

describe('validarEntrar', () => {
  it('aceita e-mail e senha preenchidos', () => {
    expect(semErros(validarEntrar({ email: 'marina@email.com', senha: 'segredo' }))).toBe(true);
  });

  it('cobra os campos vazios', () => {
    const erros = validarEntrar({ email: '', senha: '' });
    expect(erros.email).toBe('informe seu e-mail');
    expect(erros.senha).toBe('informe sua senha');
  });

  it('recusa e-mail incompleto', () => {
    expect(validarEntrar({ email: 'marina@', senha: 'x' }).email).toBeDefined();
  });
});

describe('validarCriarConta', () => {
  const valido = {
    nome: 'Marina',
    email: 'marina@email.com',
    senha: 'oitocaracteres',
    termos: true,
  };

  it('aceita o cadastro completo', () => {
    expect(semErros(validarCriarConta(valido))).toBe(true);
  });

  it('exige o nome', () => {
    expect(validarCriarConta({ ...valido, nome: '  ' }).nome).toBe('diga como te chamamos');
  });

  it(`exige senha com ${MINIMO_SENHA} caracteres`, () => {
    expect(validarCriarConta({ ...valido, senha: 'curta' }).senha).toBe(
      `use ${MINIMO_SENHA} caracteres ou mais`,
    );
  });

  it('exige o aceite dos termos', () => {
    expect(validarCriarConta({ ...valido, termos: false }).termos).toBeDefined();
  });
});
