import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Botao, BottomSheet } from '@/components/ui';
import { DESTINOS } from '@/features/navegacao/destinos';
import type { DestinoEmConstrucao } from '@/components/ui';
import { color, interacao, radius, spacing, text } from '@/theme';

// `destino: null` é o caminho que já existe. Os outros dois dependem de áudio e
// de transcrição, e continuam anunciando em que etapa chegam.
const CAMINHOS = [
  { titulo: 'gravar um áudio', descricao: 'conte como foi; a ia preenche a ficha para você revisar', destino: DESTINOS.registrarPorAudio },
  { titulo: 'preencher à mão', descricao: 'prato, tempo, custo e nota no formulário', destino: null },
  { titulo: 'começar o cronômetro', descricao: 'marque o tempo agora e registre ao terminar', destino: DESTINOS.registrarPorCronometro },
] as const;

export function SheetComoRegistrar({
  visivel,
  onFechar,
  onEscolherCaminho,
  onPreencherAMao,
}: {
  visivel: boolean;
  onFechar: () => void;
  /** Recebe o destino do caminho tocado, para que a tela de cima o anuncie. */
  onEscolherCaminho: (destino: DestinoEmConstrucao) => void;
  /** O caminho que leva à ficha de verdade. */
  onPreencherAMao: () => void;
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
            accessibilityHint={
              caminho.destino
                ? `ainda não disponível; explica quando chega na ${caminho.destino.etapa}`
                : 'abre o formulário para registrar a execução'
            }
            onPress={() =>
              caminho.destino ? onEscolherCaminho(caminho.destino) : onPreencherAMao()
            }
            style={({ pressed }) => [
              estilos.caminho,
              caminho.destino ? estilos.inativo : null,
              pressed && estilos.pressionado,
            ]}
          >
            <View style={estilos.caminhoCorpo}>
              <Text
                style={[text.body, estilos.caminhoTitulo, caminho.destino && estilos.textoInativo]}
              >
                {caminho.titulo}
              </Text>
              <Text
                style={[
                  text.bodyMuted,
                  estilos.caminhoDescricao,
                  caminho.destino && estilos.textoInativo,
                ]}
              >
                {caminho.descricao}
              </Text>
            </View>
            {caminho.destino ? (
              <Text style={[text.overline, estilos.textoInativo]}>{caminho.destino.etapa}</Text>
            ) : null}
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
  },
  // Trio inativo próprio, e não `opacity`: a opacidade compõe o texto junto
  // com o fundo e derruba o contraste abaixo do piso de 4,5:1.
  inativo: { backgroundColor: color.inativoFundo, borderColor: color.inativoBorda },
  textoInativo: { color: color.inativoTexto },
  pressionado: { opacity: interacao.opacidadePressionado },
  caminhoCorpo: { flex: 1, minWidth: 0 },
  caminhoTitulo: { fontSize: 14.5 },
  caminhoDescricao: { fontSize: 12.5, lineHeight: 17, marginTop: 3 },
  fechar: { marginTop: spacing.lg, minHeight: 50, borderRadius: radius.field },
});
