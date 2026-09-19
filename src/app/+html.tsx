import type { PropsWithChildren } from 'react';

export default function Html({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        {/*
          Sem o `ScrollViewStyleReset` de `expo-router/html`: importá-lo aqui
          trava o `renderRouter` das suítes de rota, que varre este diretório.
          O reset só ajusta a rolagem do alvo web, que não é entrega do
          projeto — o motivo deste arquivo existir é o `lang` acima.
        */}
      </head>
      <body>{children}</body>
    </html>
  );
}
