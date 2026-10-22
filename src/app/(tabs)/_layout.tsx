import { Redirect, useRouter } from 'expo-router';
import { TabList, TabSlot, Tabs, TabTrigger } from 'expo-router/ui';
import { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotaoAba } from '@/components/navegacao/BotaoAba';
import { BotaoRegistrar } from '@/components/navegacao/BotaoRegistrar';
import { estilosBarraAbas as estilos } from '@/components/navegacao/estilosBarraAbas';
import { SheetComoRegistrar } from '@/components/navegacao/SheetComoRegistrar';
import { SheetEmConstrucao } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthContext';
import { useReservaDeRodape } from '@/features/aviso/AvisoContext';
import { useEmConstrucao } from '@/hooks/useEmConstrucao';
import { spacing, touch } from '@/theme';

export default function LayoutAbas() {
  const { autenticado } = useAuth();
  const router = useRouter();
  const [sheetRegistrar, setSheetRegistrar] = useState(false);
  const emConstrucao = useEmConstrucao();
  const insets = useSafeAreaInsets();
  // Sobe a barra acima da barra de gestos; em aparelho sem ela, respiro fixo.
  const base = Math.max(insets.bottom, spacing.xl);

  // A barra flutua e não empurra nada: sem a reserva, o aviso cairia sob ela.
  useReservaDeRodape(base + touch.tabBarHeight - Math.max(insets.bottom, spacing.lg));

  if (!autenticado) return <Redirect href="/" />;

  return (
    <Tabs>
      <TabSlot />

      <TabList style={[estilos.barra, { bottom: base }]}>
        <TabTrigger name="inicio" href="/inicio" asChild>
          <BotaoAba rotulo="início" icone="inicio" />
        </TabTrigger>
        <TabTrigger name="historico" href="/historico" asChild>
          <BotaoAba rotulo="histórico" icone="historico" />
        </TabTrigger>

        {/* Não é aba: só reserva o espaço do botão flutuante. */}
        <View style={estilos.vao} />

        <TabTrigger name="pratos" href="/pratos" asChild>
          <BotaoAba rotulo="pratos" icone="pratos" />
        </TabTrigger>
        <TabTrigger name="perfil" href="/perfil" asChild>
          <BotaoAba rotulo="perfil" icone="perfil" />
        </TabTrigger>
      </TabList>

      {/* Depois do TabList na ordem dos filhos, para pintar por cima dele. */}
      <BotaoRegistrar base={base} onPress={() => setSheetRegistrar(true)} />

      <SheetComoRegistrar
        visivel={sheetRegistrar}
        onFechar={() => setSheetRegistrar(false)}
        onPreencherAMao={() => {
          setSheetRegistrar(false);
          router.push('/execucao/ficha');
        }}
        onEscolherCaminho={(destino) => {
          // Um sheet fecha antes do outro abrir: empilhados, prendem o foco.
          setSheetRegistrar(false);
          emConstrucao.anunciar(destino);
        }}
      />

      <SheetEmConstrucao destino={emConstrucao.destino} onFechar={emConstrucao.fechar} />
    </Tabs>
  );
}
