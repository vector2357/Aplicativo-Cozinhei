import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Botao, BottomSheet } from '@/components/ui';
import { DESTINOS } from '@/features/navegacao/destinos';
import type { DestinoEmConstrucao } from '@/components/ui';
import { color, interacao, radius, spacing, text } from '@/theme';

const CAMINHOS = [
  { titulo: 'gravar um áudio', descricao: 'conte como foi; a ia preenche a ficha para você revisar', destino: DESTINOS.registrarPorAudio },
  { titulo: 'preencher à mão', descricao: 'ingredientes, custo, tempo e porções no formulário', destino: DESTINOS.registrarAMao },
  { titulo: 'começar o cronômetro', descricao: 'marque o tempo agora e registre ao terminar', destino: DESTINOS.registrarPorCronometro },
] as const;

export function SheetComoRegistrar({
  visivel,
  onFechar,
  onEscolherCaminho,
}: {
  visivel: boolean;
  onFechar: () => void;
  /** Recebe o destino do caminho tocado, para que a tela de cima o anuncie. */
  onEscolherCaminho: (destino: DestinoEmConstrucao) => void;
}) {
  return (
    <BottomSheet visivel={visivel} onFechar={onFechar} tituloAcessivel="como registrar">
      <Text style={text.sectionTitle}>como você quer registrar?</Text>

      <View style={estilos.lista}>
        {CAMINHOS.map((caminho) => (
          <Pressable
            key={caminho.titulo}
            accessibilityRole="button"
            accessibilityLabel={`${caminho.titulo}. ${caminho.descricao}`}
            accessibilityHint={`ainda não disponível; explica quando chega na ${caminho.destino.etapa}`}
            onPress={() => onEscolherCaminho(caminho.destino)}
            style={({ pressed }) => [estilos.caminho, pressed && estilos.pressionado]}
          >
            <View style={estilos.caminhoCorpo}>
              <Text style={[text.body, estilos.caminhoTitulo]}>{caminho.titulo}</Text>
              <Text style={[text.bodyMuted, estilos.caminhoDescricao]}>{caminho.descricao}</Text>
            </View>
            <Text style={text.overline}>{caminho.destino.etapa}</Text>
          </Pressable>
        ))}
      </View>

      <Botao
        titulo="fechar"
        variante="secundaria"
        onPress={onFechar}
        style={estilos.fechar}
      />
    </BottomSheet>
  );
}

const estilos = StyleSheet.create({
  lista: { gap: 9, marginTop: spacing.lg },
  caminho: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.borderHairline,
    borderRadius: radius.card,
    // Inativo nesta etapa; o esmaecido comunica isso sem esconder.
    opacity: 0.72,
  },
  // Sobre o item já esmaecido, o toque precisa de uma queda perceptível.
  pressionado: { opacity: interacao.opacidadePressionado * 0.72 },
  caminhoCorpo: { flex: 1, minWidth: 0 },
  caminhoTitulo: { fontSize: 14.5 },
  caminhoDescricao: { fontSize: 12.5, lineHeight: 17, marginTop: 3 },
  fechar: { marginTop: spacing.lg, minHeight: 50, borderRadius: radius.field },
});
