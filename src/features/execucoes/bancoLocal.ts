import * as SQLite from 'expo-sqlite';

import type { ChipAvaliacao, Execucao } from '@/types/dominio';

const ARQUIVO_DO_BANCO = 'cozinhei.db';

/** Como uma execução chega do SQLite: coluna por coluna, `chips` em JSON. */
type Linha = {
  id: string;
  prato_id: string;
  prato: string;
  mes: string;
  tentativa: string;
  data: string;
  tempo: string;
  custo: number;
  nota: number;
  chips: string;
};

const ESQUEMA = `
  CREATE TABLE IF NOT EXISTS donos (
    dono TEXT PRIMARY KEY NOT NULL,
    semeado INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS execucoes (
    id TEXT PRIMARY KEY NOT NULL,
    dono TEXT NOT NULL,
    prato_id TEXT NOT NULL,
    prato TEXT NOT NULL,
    mes TEXT NOT NULL,
    tentativa TEXT NOT NULL,
    data TEXT NOT NULL,
    tempo TEXT NOT NULL,
    custo REAL NOT NULL,
    nota REAL NOT NULL,
    chips TEXT NOT NULL,
    criado_em INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS execucoes_por_dono ON execucoes (dono, criado_em DESC);
`;

let banco: SQLite.SQLiteDatabase | null = null;

// Abrir é barato, mas criar o esquema a cada chamada não é: guarda a conexão.
function conexao(): SQLite.SQLiteDatabase {
  if (banco) return banco;
  banco = SQLite.openDatabaseSync(ARQUIVO_DO_BANCO);
  banco.execSync(ESQUEMA);
  return banco;
}

function deLinha(linha: Linha): Execucao {
  return {
    id: linha.id,
    pratoId: linha.prato_id,
    prato: linha.prato,
    mes: linha.mes,
    tentativa: linha.tentativa,
    data: linha.data,
    tempo: linha.tempo,
    custo: linha.custo,
    nota: linha.nota,
    chips: JSON.parse(linha.chips) as ChipAvaliacao[],
  };
}

/** As execuções de um dono, da mais recente para a mais antiga. */
export function lerExecucoes(dono: string): Execucao[] {
  const linhas = conexao().getAllSync<Linha>(
    `SELECT id, prato_id, prato, mes, tentativa, data, tempo, custo, nota, chips
       FROM execucoes WHERE dono = ? ORDER BY criado_em DESC`,
    [dono],
  );
  return linhas.map(deLinha);
}

/** `criadoEm` não é campo do domínio: é só o que ordena a lista. */
export function inserirExecucao(dono: string, execucao: Execucao, criadoEm: number): void {
  conexao().runSync(
    `INSERT INTO execucoes
       (id, dono, prato_id, prato, mes, tentativa, data, tempo, custo, nota, chips, criado_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      execucao.id,
      dono,
      execucao.pratoId,
      execucao.prato,
      execucao.mes,
      execucao.tentativa,
      execucao.data,
      execucao.tempo,
      execucao.custo,
      execucao.nota,
      JSON.stringify(execucao.chips),
      criadoEm,
    ],
  );
}

// Não toca em `criado_em` nem em `prato_id`: editar não remove a execução do
// lugar dela no histórico nem a muda de série de tentativas.
export function atualizarExecucao(dono: string, execucao: Execucao): void {
  conexao().runSync(
    `UPDATE execucoes
        SET prato = ?, tempo = ?, custo = ?, nota = ?, chips = ?
      WHERE id = ? AND dono = ?`,
    [
      execucao.prato,
      execucao.tempo,
      execucao.custo,
      execucao.nota,
      JSON.stringify(execucao.chips),
      execucao.id,
      dono,
    ],
  );
}

export function apagarExecucao(dono: string, id: string): void {
  conexao().runSync('DELETE FROM execucoes WHERE id = ? AND dono = ?', [id, dono]);
}

/** `null` quando o dono nunca foi inicializado — é diferente de não semeado. */
export function donoSemeado(dono: string): boolean | null {
  const linhas = conexao().getAllSync<{ semeado: number }>(
    'SELECT semeado FROM donos WHERE dono = ?',
    [dono],
  );
  return linhas.length ? linhas[0].semeado === 1 : null;
}

export function registrarDono(dono: string, semeado: boolean): void {
  conexao().runSync('INSERT OR IGNORE INTO donos (dono, semeado) VALUES (?, ?)', [
    dono,
    semeado ? 1 : 0,
  ]);
}
