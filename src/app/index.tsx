import { Redirect } from 'expo-router';

import { PainelDeEntrada } from '@/components/auth/PainelDeEntrada';
import { useAuth } from '@/features/auth/AuthContext';

export default function TelaEntrar() {
  const { autenticado } = useAuth();

  // Sessão restaurada do disco: não há por que pedir a senha de novo. O
  // `replace` do `Redirect` é o que mantém a pilha com uma tela só.
  if (autenticado) return <Redirect href="/inicio" />;

  return <PainelDeEntrada abaInicial="entrar" />;
}
