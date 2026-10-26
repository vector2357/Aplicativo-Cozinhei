import { supabase } from '@/services/supabase';
import type { ChipAvaliacao, Execucao } from '@/types/dominio';

const TABELA = 'execucoes';

/** As colunas lidas, na ordem do tipo do domínio. `usuario_id` nunca sai daqui. */
const COLUNAS = 'id, prato_id, prato, mes, tentativa, data, tempo, custo, nota, chips';

/** Como uma execução chega do PostgREST: `chips` já desserializado, de `jsonb`. */
type Linha = {
  id: string;
  prato_id: string;
  prato: string;
  mes: string;
  tentativa: string;
  data: string;
  tempo: string;
  custo: number | string;
  nota: number | string;
  chips: ChipAvaliacao[] | string;
};

function deLinha(linha: Linha): Execucao {
  return {
    id: linha.id,
    pratoId: linha.prato_id,
    prato: linha.prato,
    mes: linha.mes,
    tentativa: linha.tentativa,
    data: linha.data,
    tempo: linha.tempo,
    // `numeric` do Postgres pode chegar como texto, dependendo da precisão —
    // e `"12.80" * 1` é 12.8, mas `"12.80" + 1` é "12.801". Converter aqui é
    // o que impede o erro de aparecer só no total do perfil.
    custo: Number(linha.custo),
    nota: Number(linha.nota),
    chips: typeof linha.chips === 'string' ? (JSON.parse(linha.chips) as ChipAvaliacao[]) : linha.chips,
  };
}

/**
 * Transforma a falha do PostgREST em exceção. Sem isto o erro viria como um
 * campo do retorno e seguiria em silêncio: as telas mostrariam lista vazia em
 * vez do estado de erro, que é o pior resultado possível — parece perda de
 * dados.
 */
function erroSeHouver(erro: { message: string } | null, operacao: string): void {
  if (erro) throw new Error(`${operacao} falhou no servidor: ${erro.message}`);
}

/**
 * As execuções do usuário autenticado, da mais recente para a mais antiga.
 *
 * Não há `where` por dono: quem filtra é a política de RLS, no banco. É mais
 * forte do que o filtro local — um cliente adulterado não a contorna.
 */
export async function lerExecucoes(_dono: string): Promise<Execucao[]> {
  const { data, error } = await supabase()
    .from(TABELA)
    .select(COLUNAS)
    .order('criado_em', { ascending: false });

  erroSeHouver(error, 'a leitura das execuções');
  return (data as Linha[] | null)?.map(deLinha) ?? [];
}

/** `usuario_id` não é enviado: o default da coluna o resolve pelo token. */
export async function inserirExecucao(
  _dono: string,
  execucao: Execucao,
  criadoEm: number,
): Promise<void> {
  const { error } = await supabase()
    .from(TABELA)
    .insert({
      id: execucao.id,
      prato_id: execucao.pratoId,
      prato: execucao.prato,
      mes: execucao.mes,
      tentativa: execucao.tentativa,
      data: execucao.data,
      tempo: execucao.tempo,
      custo: execucao.custo,
      nota: execucao.nota,
      chips: execucao.chips,
      criado_em: criadoEm,
    });

  erroSeHouver(error, 'a gravação da execução');
}

// As mesmas cinco colunas do `UPDATE` local, e pela mesma razão: editar não
// muda a execução de série de tentativas nem o lugar dela no histórico.
export async function atualizarExecucao(_dono: string, execucao: Execucao): Promise<void> {
  const { error } = await supabase()
    .from(TABELA)
    .update({
      prato: execucao.prato,
      tempo: execucao.tempo,
      custo: execucao.custo,
      nota: execucao.nota,
      chips: execucao.chips,
    })
    .eq('id', execucao.id);

  erroSeHouver(error, 'a alteração da execução');
}

export async function apagarExecucao(_dono: string, id: string): Promise<void> {
  const { error } = await supabase().from(TABELA).delete().eq('id', id);
  erroSeHouver(error, 'a remoção da execução');
}
