# Cozinhei

## Descrição

Cozinhei é um diário pessoal de cozinha para celular. O usuário registra os pratos que ele mesmo preparou — ingredientes, custo, tempo, fotos e avaliação — e o aplicativo usa esse histórico para mostrar sua evolução ao longo do tempo, comparar tentativas de um mesmo prato e diagnosticar os erros que ele mais repete.

O foco não é ensinar receitas, e sim guardar de forma estruturada a prática de quem está aprendendo a cozinhar, transformando esse registro em informação útil sobre o próprio progresso.

## Tecnologias

- **Mobile:** React Native com Expo (TypeScript)
- **Navegação:** Expo Router
- **Backend:** Supabase (PostgreSQL + Auth), com Edge Functions previstas para o módulo de IA
- **Banco de dados:** PostgreSQL (Supabase), com pgvector para busca semântica
- **Autenticação:** Supabase Auth
- **Armazenamento de mídia:** Supabase Storage
- **Armazenamento local:** SQLite (expo-sqlite) e AsyncStorage
- **APIs externas:** API de LLM para o módulo de IA e API de transcrição de áudio

> O **armazenamento local** está implementado desde a etapa 04, e o **backend**
> desde a etapa 05: a conta é verificada pelo Supabase Auth e as execuções vivem
> numa tabela PostgreSQL, com isolamento por conta garantido por políticas de
> RLS. Sem credenciais configuradas, a aplicação executa em **modo local**,
> contra o SQLite do aparelho. O armazenamento de mídia, a busca semântica e as
> Edge Functions do módulo de IA seguem previstos para as próximas etapas.

## Estado do projeto

| Etapa | Situação | Documento |
| --- | --- | --- |
| 01 — Proposta e planejamento | concluída | [`docs/proposta.md`](docs/proposta.md) |
| 02 — Protótipo de interface | concluída | [`docs/etapa-02.md`](docs/etapa-02.md) |
| 03 — Navegação, UX e acessibilidade | concluída | [`docs/etapa-03.md`](docs/etapa-03.md) |
| 04 — Persistência local de dados | concluída | [`docs/etapa-04.md`](docs/etapa-04.md) |
| 05 — Primeira versão funcional com backend | concluída | [`docs/etapa-05.md`](docs/etapa-05.md) |

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

Desde a etapa 05 há **backend**: a conta é criada e verificada pelo Supabase
Auth, e as execuções são gravadas numa tabela PostgreSQL, onde políticas de RLS
impedem que uma conta alcance os dados de outra. O fluxo completo de negócio
entregue é o ciclo `criar → visualizar → alterar → excluir` de uma execução.

A aplicação funciona nos dois modos, por decisão de projeto: **conectado**
quando há credenciais em `.env`, e **local** quando não há — e aí tudo responde
contra o SQLite, como na etapa 04. Ver
[`docs/etapa-04.md`](docs/etapa-04.md) para o esquema local e
[`docs/etapa-05.md`](docs/etapa-05.md) para o backend, o fluxo e o roteiro de
verificação.

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

Isso basta para executar em **modo local**. Para o backend, copie `.env.example`
para `.env` e preencha as duas variáveis do seu projeto no Supabase — o passo a
passo, incluindo a migração do banco, está em
[`docs/etapa-05.md`](docs/etapa-05.md) seção 7.

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
npm test                            # 477 testes automatizados, em 23 suítes
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
├── services/       # o cliente do backend
├── hooks/          # carregamento, teclado, foco, movimento, layout
├── theme/          # cor, tipografia, espaçamento
├── types/          # tipos do domínio
├── utils/          # formatação brasileira
└── __tests__/      # testes

supabase/
└── migrations/     # o esquema do banco remoto, para rodar no painel
```

## Documentação

- Proposta completa do projeto: [`docs/proposta.md`](docs/proposta.md)
- Relatório da etapa 02: [`docs/etapa-02.md`](docs/etapa-02.md)
- Relatório da etapa 03: [`docs/etapa-03.md`](docs/etapa-03.md)
- Relatório da etapa 04: [`docs/etapa-04.md`](docs/etapa-04.md)
- Relatório da etapa 05: [`docs/etapa-05.md`](docs/etapa-05.md)
