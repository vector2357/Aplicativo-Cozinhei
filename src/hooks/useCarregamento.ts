import { useCallback, useEffect, useState } from 'react';

/** Em que ponto está a busca dos dados de uma tela. */
export type EstadoDoCarregamento = 'carregando' | 'erro' | 'pronto';

export type UseCarregamento<T> = {
  estado: EstadoDoCarregamento;
  /** Os dados, quando `estado` é `pronto`. `null` nos outros casos. */
  dados: T | null;
  /** Tenta de novo. É o que o botão do estado de erro chama. */
  recarregar: () => void;
};

export function useCarregamento<T>(
  buscar: () => Promise<T>,
  dependencias: readonly unknown[] = [],
): UseCarregamento<T> {
  const [estado, setEstado] = useState<EstadoDoCarregamento>('carregando');
  const [dados, setDados] = useState<T | null>(null);
  const [tentativa, setTentativa] = useState(0);

  // `buscar` costuma ser uma função anônima, que muda a cada render; quem
  // controla o efeito são as dependências que a tela declara.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const buscarEstavel = useCallback(buscar, dependencias);

  useEffect(() => {
    let atual = true;
    setEstado('carregando');

    buscarEstavel()
      .then((resultado) => {
        // A tela pode ter saído de cena, ou uma busca mais nova ter começado:
        // aplicar o resultado aqui sobrescreveria dados mais recentes.
        if (!atual) return;
        setDados(resultado);
        setEstado('pronto');
      })
      .catch(() => {
        if (!atual) return;
        setDados(null);
        setEstado('erro');
      });

    return () => {
      atual = false;
    };
  }, [buscarEstavel, tentativa]);

  const recarregar = useCallback(() => setTentativa((n) => n + 1), []);

  return { estado, dados, recarregar };
}
