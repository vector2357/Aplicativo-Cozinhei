# Cozinhei

## Descrição

Cozinhei é um diário pessoal de cozinha para celular. O usuário registra os pratos que ele mesmo preparou — ingredientes, custo, tempo, fotos e avaliação — e o aplicativo usa esse histórico para mostrar sua evolução ao longo do tempo, comparar tentativas de um mesmo prato e diagnosticar os erros que ele mais repete.

O foco não é ensinar receitas, e sim guardar de forma estruturada a prática de quem está aprendendo a cozinhar, transformando esse registro em informação útil sobre o próprio progresso.

## Tecnologias

- **Mobile:** React Native com Expo (TypeScript)
- **Navegação:** Expo Router
- **Backend:** Supabase Edge Functions (TypeScript / Deno)
- **Banco de dados:** PostgreSQL (Supabase), com pgvector para busca semântica
- **Autenticação:** Supabase Auth
- **Armazenamento de mídia:** Supabase Storage
- **Armazenamento local:** SQLite (expo-sqlite) e AsyncStorage
- **APIs externas:** API de LLM para o módulo de IA e API de transcrição de áudio

> O **armazenamento local** está implementado desde a etapa 04: as execuções
> ficam num banco SQLite no aparelho e a sessão em AsyncStorage. As camadas de
> backend, banco remoto, autenticação e mídia seguem previstas para as
> próximas etapas.

## Estado do projeto

| Etapa | Situação | Documento |
| --- | --- | --- |
| 01 — Proposta e planejamento | concluída | [`docs/proposta.md`](docs/proposta.md) |
| 02 — Protótipo de interface | concluída | [`docs/etapa-02.md`](docs/etapa-02.md) |
| 03 — Navegação, UX e acessibilidade | concluída | [`docs/etapa-03.md`](docs/etapa-03.md) |
| 04 — Persistência local de dados | concluída | [`docs/etapa-04.md`](docs/etapa-04.md) |

### Telas implementadas

| Tela | Rota | Como se chega |
| --- | --- | --- |
| Entrar (tela inicial) | `/` | abertura do app |
| Criar conta | `/criar-conta` | seletor no topo da tela de entrar |
| Entrando | `/entrando` | ao enviar o login |
| Início | `/inicio` | aba "início" |
| Histórico | `/historico` | aba "histórico" |
| Pratos | `/pratos` | aba "pratos" |
| Perfil | `/perfil` | aba "perfil" |
| Prato | `/prato/[id]` | tocar um prato na lista de pratos |
| Execução | `/execucao/[id]` | tocar uma ficha no histórico, no início ou num prato |
| Evolução | `/evolucao` | botão "ver sua evolução", no cartão do mês |
| Ficha de execução | `/execucao/ficha` | `+` → "preencher à mão", ou "editar" numa execução |

Mais os bottom sheets de escolha de conta Google e de "como registrar", e a
barra de abas flutuante com botão de ação central. As capturas estão em
[`docs/telas/`](docs/telas/).

Os dados são **persistidos no aparelho**: as execuções ficam numa tabela SQLite
(`expo-sqlite`) e a sessão em AsyncStorage, de modo que tudo continua lá depois
de encerrar e reabrir o aplicativo. As 21 execuções de exemplo passaram a ser a
semente do banco — entram na primeira entrada e dali em diante são criadas,
alteradas e removidas pelo próprio usuário. Uma conta nova começa vazia.

Ainda **não há comunicação com servidor**: nada sai do aparelho. Ver
[`docs/etapa-04.md`](docs/etapa-04.md) para o mecanismo, o esquema das tabelas
e o roteiro de verificação da persistência.

## Como executar

### Pré-requisitos

- Node.js 20 ou superior
- npm 10 ou superior
- Expo Go no celular, ou um emulador Android / simulador iOS

### Passos

```bash
git clone https://github.com/vector2357/Aplicativo-Cozinhei.git
cd Aplicativo-Cozinhei
npm install
npm start
```

O terminal mostra um QR Code: leia com o Expo Go (Android) ou com a câmera
(iOS). Para abrir direto num destino:

```bash
npm run android   # emulador ou aparelho Android
npm run ios       # simulador iOS (requer macOS)
npm run web       # navegador
```

### Verificação

```bash
npm run typecheck                   # TypeScript, modo estrito
npm test                            # 428 testes automatizados, em 21 suítes
npx expo export --platform android  # pega erro de resolução de módulo
```

> O `.npmrc` na raiz fixa `legacy-peer-deps=true`, para resolver um conflito de
> peer dependency entre a versão de `react` fixada pelo Expo SDK 57 e a
> exigida por `react-dom`. Sem ele, `npm install` falha.

## Estrutura

```
src/
├── app/            # rotas (Expo Router)
├── components/     # ui/ · execucao/ · navegacao/ · auth/
├── features/       # regras de negócio: auth/ · execucoes/ · aviso/ · navegacao/
├── hooks/          # carregamento, teclado, foco, movimento, layout
├── theme/          # cor, tipografia, espaçamento
├── types/          # tipos do domínio
├── utils/          # formatação brasileira
└── __tests__/      # testes
```

## Documentação

- Proposta completa do projeto: [`docs/proposta.md`](docs/proposta.md)
- Relatório da etapa 02: [`docs/etapa-02.md`](docs/etapa-02.md)
- Relatório da etapa 03: [`docs/etapa-03.md`](docs/etapa-03.md)
- Relatório da etapa 04: [`docs/etapa-04.md`](docs/etapa-04.md)
