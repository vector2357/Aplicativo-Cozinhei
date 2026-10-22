import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Usuario } from '@/types/dominio';

const CHAVE = 'cozinhei:sessao';

/**
 * A sessão guardada, ou `null` quando não há nenhuma. Nunca lança: um valor
 * corrompido vale o mesmo que sessão nenhuma, e travar a abertura do app por
 * causa dele seria pior do que pedir para entrar outra vez.
 */
export async function lerSessao(): Promise<Usuario | null> {
  try {
    const guardado = await AsyncStorage.getItem(CHAVE);
    return guardado ? (JSON.parse(guardado) as Usuario) : null;
  } catch {
    return null;
  }
}

export async function salvarSessao(usuario: Usuario): Promise<void> {
  await AsyncStorage.setItem(CHAVE, JSON.stringify(usuario));
}

export async function limparSessao(): Promise<void> {
  await AsyncStorage.removeItem(CHAVE);
}
