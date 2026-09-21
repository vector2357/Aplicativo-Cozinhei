import { Botao, Divisor, MarcaGoogle } from '@/components/ui';

type Props = {
  /** Muda entre "continuar com o Google" e "criar conta com o Google". */
  titulo: string;
  onPress: () => void;
};

export function EntradaComGoogle({ titulo, onPress }: Props) {
  return (
    <>
      <Divisor rotulo="ou" />
      <Botao
        titulo={titulo}
        variante="secundaria"
        icone={<MarcaGoogle />}
        onPress={onPress}
        accessibilityHint="abre a lista de contas Google deste aparelho"
      />
    </>
  );
}
