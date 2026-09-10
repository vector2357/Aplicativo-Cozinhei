/**
 * Tela 11 — Como registrar, como bottom sheet.
 *
 * Três caminhos para a mesma coisa: áudio, formulário e cronômetro. Eles
 * existem porque registrar é chato, e o atrito do registro é o caminho mais
 * curto para o abandono do app — cada caminho serve a um momento diferente.
 *
 * Nesta etapa os três estão anunciados mas inativos: o destino de cada um é
 * uma tela da etapa 03. Anunciar e marcar como indisponível é melhor que
 * esconder — o usuário vê o que o app vai fazer.
 */
import { StyleSheet, Text, View } from 'react-native';

import { Botao, BottomSheet } from '@/components/ui';
import { color, radius, spacing, text } from '@/theme';

const CAMINHOS = [
  { titulo: 'gravar um áudio', descricao: 'conte como foi; a ia preenche a ficha para você revisar' },
  { titulo: 'preencher à mão', descricao: 'ingredientes, custo, tempo e porções no formulário' },
  { titulo: 'começar o cronômetro', descricao: 'marque o tempo agora e registre ao terminar' },
] as const;

export function SheetComoRegistrar({
  visivel,
  onFechar,
}: {
  visivel: boolean;
  onFechar: () => void;
}) {
  return (
    <BottomSheet visivel={visivel} onFechar={onFechar} tituloAcessivel="como registrar">
      <Text style={text.sectionTitle}>como você quer registrar?</Text>

      <View style={estilos.lista}>
        {CAMINHOS.map((caminho) => (
          <View
            key={caminho.titulo}
            style={estilos.caminho}
            accessible
            accessibilityLabel={`${caminho.titulo}. ${caminho.descricao}. disponível na próxima etapa`}
          >
            <View style={estilos.caminhoCorpo}>
              <Text style={[text.body, estilos.caminhoTitulo]}>{caminho.titulo}</Text>
              <Text style={[text.bodyMuted, estilos.caminhoDescricao]}>{caminho.descricao}</Text>
            </View>
            <Text style={[text.overline, estilos.selo]}>etapa 03</Text>
          </View>
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
  caminhoCorpo: { flex: 1, minWidth: 0 },
  caminhoTitulo: { fontSize: 14.5 },
  caminhoDescricao: { fontSize: 12.5, lineHeight: 17, marginTop: 3 },
  selo: { color: color.stone },
  fechar: { marginTop: spacing.lg, minHeight: 50, borderRadius: radius.field },
});
