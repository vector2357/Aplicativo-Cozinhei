import { useCallback, useState } from 'react';

export type UseErrosFormulario<E extends object> = {
  /** Erros atuais, um por campo. Vazio quando não há nenhum. */
  erros: E;
  /** Aplica o resultado da validação. Chame no envio. */
  definirErros: (novos: E) => void;
  /** Apaga o erro de um campo. Chame quando o usuário mexe nele. */
  limparErro: (campo: keyof E) => void;
  /** Apaga todos. Útil ao trocar de formulário sem desmontar a tela. */
  limparTudo: () => void;
};

export function useErrosFormulario<E extends object>(): UseErrosFormulario<E> {
  const [erros, setErros] = useState<E>({} as E);

  const definirErros = useCallback((novos: E) => setErros(novos), []);

  const limparErro = useCallback((campo: keyof E) => {
    setErros((atuais) => {
      if (!(campo in atuais)) return atuais; // nada a fazer: evita re-render
      const { [campo]: _descartado, ...resto } = atuais;
      return resto as E;
    });
  }, []);

  const limparTudo = useCallback(() => setErros({} as E), []);

  return { erros, definirErros, limparErro, limparTudo };
}
