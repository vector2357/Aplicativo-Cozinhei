/**
 * Estilos da barra de abas flutuante.
 *
 * Ficam fora do layout porque o layout precisa manter os `<TabTrigger>` como
 * filhos DIRETOS do `<TabList>`. A varredura que o Expo Router faz para
 * descobrir as rotas (`parseTriggersFromChildren`, em `expo-router/build/ui/
 * Tabs.js`) só desce por Fragments e pelo próprio `TabList` — qualquer `View`
 * no meio do caminho faz os triggers ficarem invisíveis e o navegador nascer
 * sem nenhuma rota, em silêncio.
 *
 * Por isso `barra` é aplicado NO `TabList`, que já renderiza uma `View` e
 * aceita `style`. Ele acumula os dois papéis que antes estavam separados —
 * ancorar no rodapé e desenhar a pílula.
 */
import { StyleSheet } from 'react-native';

import { color, radius, shadow, spacing, touch } from '@/theme';

export const estilosBarraAbas = StyleSheet.create({
  /**
   * A pílula branca, ancorada no rodapé. O `bottom` entra em tempo de
   * execução, a partir da área segura do aparelho.
   *
   * Os recuos laterais são simétricos de propósito: é o que faz o vão central
   * da barra coincidir com o centro da tela, onde fica o botão flutuante.
   */
  barra: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    height: touch.tabBarHeight,
    paddingHorizontal: 6,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.borderHairline,
    borderRadius: radius.tabBar,
    ...shadow.tabBar,
  },
  /** Vão central reservado ao botão flutuante. */
  vao: { width: touch.fabSize },
});
