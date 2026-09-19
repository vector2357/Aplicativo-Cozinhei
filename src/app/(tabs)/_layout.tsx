import { TabList, TabSlot, Tabs, TabTrigger } from 'expo-router/ui';
import { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotaoAba } from '@/components/navegacao/BotaoAba';
import { BotaoRegistrar } from '@/components/navegacao/BotaoRegistrar';
import { estilosBarraAbas as estilos } from '@/components/navegacao/estilosBarraAbas';
import { SheetComoRegistrar } from '@/components/navegacao/SheetComoRegistrar';
import { SheetEmConstrucao } from '@/components/ui';
import { useEmConstrucao } from '@/hooks/useEmConstrucao';
import { spacing } from '@/theme';

export default function LayoutAbas() {
  const [sheetRegistrar, setSheetRegistrar] = useState(false);
  const emConstrucao = useEmConstrucao();
  const insets = useSafeAreaInsets();
  // Sobe a barra acima da barra de gestos; em aparelho sem ela, respiro fixo.
  const base = Math.max(insets.bottom, spacing.xl);

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
        onEscolherCaminho={(destino) => {
          // Fecha um sheet antes de abrir o outro: dois modais empilhados
          // deixam o leitor de tela preso no de baixo.
          setSheetRegistrar(false);
          emConstrucao.anunciar(destino);
        }}
      />

      <SheetEmConstrucao destino={emConstrucao.destino} onFechar={emConstrucao.fechar} />
    </Tabs>
  );
}
