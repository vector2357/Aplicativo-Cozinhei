import * as local from '@/features/execucoes/bancoLocal';
import * as remoto from '@/features/execucoes/bancoRemoto';
import { modoConectado } from '@/services/supabase';
import type { Execucao } from '@/types/dominio';

/**
 * As quatro operações de dados, na forma que o repositório consome. Assíncronas
 * nas duas pontas: o SQLite é síncrono, mas expor isso obrigaria o repositório
 * a conhecer qual fonte está ativa — e é justamente o que esta camada esconde.
 */
export type FonteDeDados = {
  lerExecucoes: (dono: string) => Promise<Execucao[]>;
  inserirExecucao: (dono: string, execucao: Execucao, criadoEm: number) => Promise<void>;
  atualizarExecucao: (dono: string, execucao: Execucao) => Promise<void>;
  apagarExecucao: (dono: string, id: string) => Promise<void>;
};

// A semente e o registro de dono ficam de fora de propósito: são conceito do
// modo local, e no servidor uma conta nova começa vazia de verdade. Quem decide
// isso é o repositório, que pergunta `modoConectado()` antes de semear.
const daqui: FonteDeDados = {
  lerExecucoes: async (dono) => local.lerExecucoes(dono),
  inserirExecucao: async (dono, execucao, criadoEm) =>
    local.inserirExecucao(dono, execucao, criadoEm),
  atualizarExecucao: async (dono, execucao) => local.atualizarExecucao(dono, execucao),
  apagarExecucao: async (dono, id) => local.apagarExecucao(dono, id),
};

/**
 * Qual banco responde agora. Resolvido a cada chamada, e não uma vez no topo do
 * módulo: assim um teste pode trocar de modo entre casos sem recarregar nada.
 *
 * Não há espelho nem fila: no modo conectado o servidor é a fonte da verdade, e
 * o SQLite volta a ser a fonte quando não há backend configurado. A cópia local
 * das execuções remotas, com fila para o que foi criado sem rede, está prevista
 * em `docs/proposta.md` §11 e é trabalho de etapa posterior.
 */
export function fonte(): FonteDeDados {
  return modoConectado() ? remoto : daqui;
}
