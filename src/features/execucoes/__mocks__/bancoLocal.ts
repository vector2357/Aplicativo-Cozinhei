import type { Execucao } from '@/types/dominio';

type Guardada = { dono: string; criadoEm: number; execucao: Execucao };

const execucoes: Guardada[] = [];
const donos = new Map<string, boolean>();

export function lerExecucoes(dono: string): Execucao[] {
  return execucoes
    .filter((linha) => linha.dono === dono)
    .sort((a, b) => b.criadoEm - a.criadoEm)
    .map((linha) => ({ ...linha.execucao, chips: [...linha.execucao.chips] }));
}

export function inserirExecucao(dono: string, execucao: Execucao, criadoEm: number): void {
  execucoes.push({ dono, criadoEm, execucao: { ...execucao, chips: [...execucao.chips] } });
}

export function atualizarExecucao(dono: string, execucao: Execucao): void {
  const guardada = execucoes.find(
    (linha) => linha.dono === dono && linha.execucao.id === execucao.id,
  );
  if (!guardada) return;
  // Espelha o UPDATE do banco: as cinco colunas que ele mexe, e só elas.
  guardada.execucao = {
    ...guardada.execucao,
    prato: execucao.prato,
    tempo: execucao.tempo,
    custo: execucao.custo,
    nota: execucao.nota,
    chips: [...execucao.chips],
  };
}

export function apagarExecucao(dono: string, id: string): void {
  const indice = execucoes.findIndex((linha) => linha.dono === dono && linha.execucao.id === id);
  if (indice >= 0) execucoes.splice(indice, 1);
}

export function donoSemeado(dono: string): boolean | null {
  return donos.has(dono) ? (donos.get(dono) as boolean) : null;
}

export function registrarDono(dono: string, semeado: boolean): void {
  if (!donos.has(dono)) donos.set(dono, semeado);
}
