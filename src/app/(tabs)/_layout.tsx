/**
 * Abas do app: início · histórico · (+) · pratos · perfil.
 *
 * Usa a API headless de abas do Expo Router (`expo-router/ui`), e não um
 * navegador de abas pronto: a barra é flutuante, arredondada e tem o botão
 * de registrar sobreposto no centro — nada disso sai de uma barra padrão.
 *
 * A navegação principal fica embaixo por decisão deliberada: o app é usado
 * com uma mão só, muitas vezes com as mãos ocupadas na cozinha.
 *
 * ── A regra que este arquivo precisa respeitar ──────────────────────────
 *
 * O Expo Router descobre as rotas deste navegador VARRENDO a árvore JSX em
 * busca de `<TabTrigger>` (`parseTriggersFromChildren`, em
 * `expo-router/build/ui/Tabs.js`). Essa varredura é rasa: ela só desce por
 * Fragments e pelo próprio `<TabList>`. Qualquer outro elemento entre o
 * `TabList` e um trigger faz o trigger sumir da varredura — e o navegador
 * nasce com ZERO rotas, estourando "Couldn't find any screens for the
 * navigator" ao montar, sem nenhum aviso antes.
 *
 * Por isso:
 *   · `<TabList>` é filho direto de `<Tabs>`;
 *   · os `<TabTrigger>` são filhos diretos de `<TabList>`;
 *   · o `TabList` É a pílula branca — ele renderiza uma `View` e aceita
 *     `style`, então não precisa de nenhuma `View` extra em volta.
 *
 * O `+` e o bottom sheet ficam fora do `TabList`, como irmãos: não são abas,
 * e a varredura ignora quem não é trigger.
 *
 * Cada aba mostra um ícone semântico — casa, linha do tempo, prato, pessoa —
 * em contorno quando inativa e sólido quando selecionada. O desenho e a regra
 * de estado ficam em `BotaoAba` / `IconeAba`; aqui só se diz qual ícone vai em
 * qual aba.
 *
 * Nesta etapa só a aba início está implementada. Histórico, pratos e perfil
 * existem como rotas reais, com um marcador do que virá, para que a
 * navegação inteira possa ser exercitada agora.
 */
import { TabList, TabSlot, Tabs, TabTrigger } from 'expo-router/ui';
import { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotaoAba } from '@/components/navegacao/BotaoAba';
import { BotaoRegistrar } from '@/components/navegacao/BotaoRegistrar';
import { estilosBarraAbas as estilos } from '@/components/navegacao/estilosBarraAbas';
import { SheetComoRegistrar } from '@/components/navegacao/SheetComoRegistrar';
import { spacing } from '@/theme';

export default function LayoutAbas() {
  const [sheetRegistrar, setSheetRegistrar] = useState(false);
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

      <SheetComoRegistrar visivel={sheetRegistrar} onFechar={() => setSheetRegistrar(false)} />
    </Tabs>
  );
}
