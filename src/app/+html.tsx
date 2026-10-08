import type { PropsWithChildren } from 'react';

export default function Html({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        {/* Sem o `ScrollViewStyleReset`: ele trava as suítes de rota. */}
      </head>
      <body>{children}</body>
    </html>
  );
}
