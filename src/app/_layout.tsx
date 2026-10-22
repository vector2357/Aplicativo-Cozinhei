import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { AvisoProvider } from '@/features/aviso/AvisoContext';
import { color, fontAssets } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Em web e em recarga rápida a splash pode já ter sumido. Não é erro.
});

export default function LayoutRaiz() {
  const [fontesProntas, erroFontes] = useFonts(fontAssets);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          {/* Fora do Stack, para o aviso sobreviver à troca de tela. */}
          <AvisoProvider>
            <Rotas fontesProntas={fontesProntas || Boolean(erroFontes)} />
          </AvisoProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Mora dentro do `AuthProvider` porque depende dele: a sessão guardada é lida
 * do disco, e montar as rotas antes da resposta mostraria a tela de entrada por
 * cima de uma sessão que existe.
 */
function Rotas({ fontesProntas }: { fontesProntas: boolean }) {
  const { sessaoVerificada } = useAuth();
  const pronto = fontesProntas && sessaoVerificada;

  useEffect(() => {
    if (pronto) SplashScreen.hideAsync().catch(() => {});
  }, [pronto]);

  // Mantém a splash em vez de piscar conteúdo.
  if (!pronto) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: color.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="criar-conta" />
      {/* Sem gesto de voltar: cancelar é a única saída da autenticação. */}
      <Stack.Screen name="entrando" options={{ gestureEnabled: false }} />
      {/* Raiz depois do login: o voltar do sistema sai do app. */}
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      {/* Segundo nível: o movimento diz que se entrou num nível. */}
      <Stack.Screen name="evolucao" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="execucao/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="prato/[id]" options={{ animation: 'slide_from_right' }} />
      {/* Criação em modal, e sem gesto: sair daqui passa pela confirmação. */}
      <Stack.Screen
        name="execucao/ficha"
        options={{ presentation: 'modal', animation: 'slide_from_bottom', gestureEnabled: false }}
      />
    </Stack>
  );
}
