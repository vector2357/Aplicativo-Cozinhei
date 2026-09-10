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

> As camadas de backend, banco, autenticação e armazenamento estão previstas
> para as próximas etapas. A etapa atual implementa apenas a camada visual.

## Estado do projeto

| Etapa | Situação | Documento |
| --- | --- | --- |
| 01 — Proposta e planejamento | concluída | [`docs/proposta.md`](docs/proposta.md) |
| 02 — Protótipo de interface | concluída | [`docs/etapa-02.md`](docs/etapa-02.md) |

### Telas implementadas

| Tela | Rota |
| --- | --- |
| Entrar (tela inicial) | `/` |
| Criar conta | `/criar-conta` |
| Entrando | `/entrando` |
| Início | `/inicio` |

Mais os bottom sheets de escolha de conta Google e de "como registrar", e a
barra de abas flutuante com botão de ação central.

Nesta etapa **não há persistência de dados nem comunicação com servidor**: os
dados exibidos vêm de um conjunto fixo de exemplo, conforme o enunciado.

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
npm run typecheck   # TypeScript, modo estrito
npm test            # 43 testes automatizados
```

> O `.npmrc` na raiz fixa `legacy-peer-deps=true`, para resolver um conflito de
> peer dependency entre a versão de `react` fixada pelo Expo SDK 57 e a
> exigida por `react-dom`. Sem ele, `npm install` falha.

## Estrutura

```
src/
├── app/            # rotas (Expo Router)
├── components/     # ui/ · execucao/ · navegacao/ · auth/
├── features/       # regras de negócio: auth/ · execucoes/
├── hooks/          # layout responsivo
├── theme/          # cor, tipografia, espaçamento
├── types/          # tipos do domínio
├── utils/          # formatação brasileira
└── __tests__/      # testes
```

## Documentação

- Proposta completa do projeto: [`docs/proposta.md`](docs/proposta.md)
- Relatório da etapa 02: [`docs/etapa-02.md`](docs/etapa-02.md)
