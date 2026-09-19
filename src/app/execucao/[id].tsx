import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { TelaEmConstrucao } from '@/components/ui';
import { buscarExecucao } from '@/features/execucoes/repositorio';
import type { Execucao } from '@/types/dominio';

export default function TelaExecucao() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [execucao, setExecucao] = useState<Execucao | null>(null);

  useEffect(() => {
    // A busca é assíncrona desde já porque na etapa 04 ela vai à rede; o
    // guarda evita aplicar o resultado numa tela que o usuário já deixou.
    let montada = true;
    buscarExecucao(id).then((encontrada) => {
      if (montada) setExecucao(encontrada);
    });
    return () => {
      montada = false;
    };
  }, [id]);

  return (
    <TelaEmConstrucao
      titulo={execucao ? execucao.prato : 'execução'}
      origem="a lista"
      etapa="etapa 03"
      descricao={
        execucao
          ? `a ficha completa da tentativa ${execucao.tentativa}: ingredientes, custo, tempo, fotos e o que deu certo e errado.`
          : 'a ficha completa da execução: ingredientes, custo, tempo, fotos e o que deu certo e errado.'
      }
    />
  );
}
