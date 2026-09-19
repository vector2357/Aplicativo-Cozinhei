import type { DestinoEmConstrucao } from '@/components/ui/SheetEmConstrucao';

export const DESTINOS = {
  /** Link "esqueci minha senha", na tela de entrar. */
  recuperarSenha: {
    titulo: 'recuperar senha',
    etapa: 'etapa 04',
    descricao:
      'o envio do link de redefinição para o seu e-mail, que depende do servidor de autenticação.',
  },

  /** "usar outra conta", no sheet de escolha de conta Google. */
  outraConta: {
    titulo: 'entrar com outra conta',
    etapa: 'etapa 04',
    descricao:
      'a escolha de uma conta Google que ainda não está neste aparelho, pelo fluxo oficial do provedor.',
  },

  /** "+ importar", no cabeçalho das receitas-guia. */
  importarReceita: {
    titulo: 'importar receita-guia',
    etapa: 'etapa 04',
    descricao:
      'trazer uma receita de link, pdf ou foto e guardar como referência para as suas execuções.',
  },

  /** Toque num cartão do carrossel de receitas-guia. */
  receitaGuia: {
    titulo: 'receita-guia',
    etapa: 'etapa 04',
    descricao:
      'a receita de referência com ingredientes e modo de preparo, e as suas execuções feitas a partir dela.',
  },

  /** "acessibilidade", nos ajustes do perfil. */
  ajustesAcessibilidade: {
    titulo: 'ajustes de acessibilidade',
    etapa: 'etapa 04',
    descricao:
      'aumentar o texto, ligar o alto contraste e reduzir as animações sem depender dos ajustes do aparelho.',
  },

  /** "retenção de áudio", nos ajustes do perfil. */
  retencaoDeAudio: {
    titulo: 'retenção de áudio',
    etapa: 'etapa 04',
    descricao:
      'por quanto tempo os áudios das suas fichas ficam guardados antes de serem apagados.',
  },

  /** Os três caminhos do sheet "como registrar". */
  registrarPorAudio: {
    titulo: 'gravar um áudio',
    etapa: 'etapa 04',
    descricao:
      'você conta como foi, e a ia preenche a ficha para você revisar antes de salvar.',
  },
  registrarAMao: {
    titulo: 'preencher à mão',
    etapa: 'etapa 04',
    descricao: 'ingredientes, custo, tempo e porções no formulário, sem depender da ia.',
  },
  registrarPorCronometro: {
    titulo: 'começar o cronômetro',
    etapa: 'etapa 04',
    descricao: 'marcar o tempo enquanto você cozinha e registrar a execução ao terminar.',
  },
} as const satisfies Record<string, DestinoEmConstrucao>;

export type NomeDestino = keyof typeof DESTINOS;
