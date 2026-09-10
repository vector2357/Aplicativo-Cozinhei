/**
 * Layout raiz.
 *
 * Faz três coisas, nesta ordem: carrega as três famílias tipográficas,
 * segura a splash até elas estarem prontas e envolve o app na sessão.
 *
 * Segurar a splash importa: sem isso a primeira renderização sai na fonte
 * de sistema e "salta" ao trocar, o que é especialmente feio nos números em
 * DM Mono, cuja largura tabular muda o alinhamento inteiro da lista.
 */
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/features/auth/AuthContext';
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
            <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
