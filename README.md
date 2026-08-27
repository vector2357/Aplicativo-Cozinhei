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
## Proposta
 
A proposta completa do projeto está em [`/docs/proposta.md`](docs/proposta.md).
 