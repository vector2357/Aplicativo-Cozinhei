import { useWindowDimensions } from 'react-native';

/** Coluna de leitura máxima. Acima disso o conteúdo apenas centraliza. */
export const LARGURA_MAXIMA_CONTEUDO = 520;

/** Abaixo desta altura útil os espaçamentos verticais encolhem. */
const ALTURA_COMPACTA = 720;

export function useLayoutResponsivo() {
  const { width, height } = useWindowDimensions();

  return {
    largura: width,
    altura: height,
    /** Largura da coluna de conteúdo, já limitada. */
    larguraConteudo: Math.min(width, LARGURA_MAXIMA_CONTEUDO),
    /** True em telas curtas (iPhone SE, landscape). */
    compacta: height < ALTURA_COMPACTA,
    /** True quando sobra espaço lateral — tablet ou janela web larga. */
    larga: width > LARGURA_MAXIMA_CONTEUDO,
  };
}
