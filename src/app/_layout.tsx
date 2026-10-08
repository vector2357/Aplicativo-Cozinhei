import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/features/auth/AuthContext';
import { AvisoProvider } from '@/features/aviso/AvisoContext';
import { color, fontAssets } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Em web e em recarga rápida a splash pode já ter sumido. Não é erro.
});

export default function LayoutRaiz() {
  const [fontesProntas, erroFontes] = useFonts(fontAssets);

  useEffect(() => {
    if (fontesProntas || erroFontes) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontesProntas, erroFontes]);

  // Sem fontes e sem erro ainda: mantém a splash em vez de piscar conteúdo.
  if (!fontesProntas && !erroFontes) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          {/* Fora do Stack, para o aviso sobreviver à troca de tela. */}
          <AvisoProvider>
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
            </Stack>
          </AvisoProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
