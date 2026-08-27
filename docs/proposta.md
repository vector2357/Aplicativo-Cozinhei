# Cozinhei — Proposta e Planejamento
 
**Disciplina:** Tecnologia e Construção de Software 2
**Etapa:** 01 — Proposta e planejamento da aplicação mobile
**Autor:** Victor Hugo Resende Marinho
**Data:** 26/08/2026
 
---
 
## 1. Nome da aplicação
 
**Cozinhei**
 
---
 
## 2. Problema que a aplicação pretende resolver
 
Quem está aprendendo a cozinhar erra, acerta e depois esquece os dois.
 
O aprendizado de cozinha caseira acontece por tentativa e repetição, mas quase ninguém guarda registro dessas tentativas. A pessoa faz um arroz que fica pastoso, promete internamente colocar menos água da próxima vez, e três semanas depois repete exatamente o mesmo erro porque não lembra o que fez diferente. O mesmo vale para os acertos: aquele bolo que ficou perfeito uma vez raramente é reproduzido, porque a quantidade exata e o tempo de forno se perderam.
 
Existem hoje muitos aplicativos de **catálogo de receitas** — eles ensinam como fazer um prato. E existem alguns aplicativos de **diário de refeições** — eles guardam o que você comeu. O que praticamente não existe é a interseção entre os dois: um app que guarde de forma estruturada **as suas próprias execuções**, com o que deu certo, o que deu errado, quanto custou e quanto tempo levou, e que use esse histórico para apontar padrões que a pessoa sozinha não enxerga.
 
Existe ainda um problema secundário, de natureza prática: registrar tudo isso é chato. Cozinhar já é cansativo, e pedir que a pessoa preencha um formulário longo logo depois é o caminho mais rápido para o abandono do app. Esse atrito é tratado como problema de projeto — e é a razão pela qual a IA entra na aplicação.
 
---
 
## 3. Público-alvo
 
O público principal são **pessoas em fase ativa de aprendizado de cozinha**, tipicamente entre 18 e 35 anos: universitários que passaram a morar sozinhos, pessoas que decidiram reduzir o gasto com delivery, e quem cozinha há pouco tempo e quer ganhar consistência.
 
O que caracteriza esse público não é a idade e sim o momento: são pessoas que **repetem pratos deliberadamente para melhorar**. Para elas, o registro tem valor instrumental.
 
Como público secundário existe o cozinheiro caseiro já experiente, que usa o app menos para diagnóstico e mais como caderno de variações ("qual foi a versão do molho que deu certo?") e controle de custo por porção.
 
---
 
## 4. Objetivo principal
 
Permitir que o usuário registre suas próprias execuções de pratos de forma rápida e estruturada, e transformar esse histórico em informação útil sobre a própria evolução — mostrando o que melhorou, o que ainda falha e por quê.
 
Três perguntas devem estar respondidas em poucos toques:
 
1. O que eu já cozinhei?
2. Estou melhorando?
3. Por que isso deu errado?
---
 
## 5. Descrição das principais funcionalidades
 
### 5.1 Registro de execução (núcleo do app)
 
Cada vez que o usuário cozinha, ele cria uma **execução**. Uma execução guarda:
 
- O **prato** ao qual pertence (ex.: "Bolo de cenoura"), o que permite agrupar e comparar tentativas do mesmo prato ao longo do tempo
- **Ingredientes utilizados**, no formato de chips reutilizáveis. Os chips ficam salvos no perfil do usuário e podem ser criados na hora, durante o cadastro
- **Custo total gasto**, com detalhamento opcional por ingrediente
- **Tempo gasto**, digitado manualmente ou medido pelo cronômetro do próprio app durante o preparo
- **Fotos e vídeos** do resultado
- **Avaliação**: nota em estrelas, lista de qualidades, lista de defeitos, comentário em texto e, opcionalmente, um áudio do usuário contando como foi
- **Data**, registrada automaticamente
As qualidades e os defeitos são selecionados a partir de listas fechadas de chips (`salgado demais`, `passou do ponto`, `cru no meio`, `textura boa`, `bem temperado`, etc.). Essa decisão é importante: além de ser muito mais rápido de tocar do que digitar, gera **dado estruturado**, que é o que torna a análise posterior possível. Texto livre continua existindo, mas como complemento.
 
### 5.2 Histórico e agrupamento por prato
 
Todas as execuções ficam no histórico do usuário, ordenadas por data. Elas podem ser filtradas por prato, e a tela de um prato mostra todas as tentativas daquele prato lado a lado — a tentativa 1, a 2, a 3 — com suas notas, custos e defeitos, deixando visível a curva de evolução.
 
### 5.3 Receitas-guia
 
Além das execuções, o usuário pode cadastrar **receitas da internet** para usar como guia prático na hora de cozinhar. Essas receitas aparecem na tela inicial e funcionam como ponto de partida: ao iniciar uma delas, o cronômetro é acionado e a execução já nasce pré-preenchida com o prato e os ingredientes sugeridos.
 
### 5.4 Módulo de IA
 
A IA atua em cinco frentes, todas ancoradas nos dados que o próprio app coleta:
 
| Funcionalidade | O que faz |
|---|---|
| **Cadastro por áudio** | O usuário grava um áudio descrevendo o que fez ("usei tais ingredientes, gastei uns 30 reais, demorei 50 minutos, ficou salgado"). A IA transcreve e distribui as informações nos campos corretos. **Nada é salvo sem confirmação do usuário**, que revisa e edita antes de gravar |
| **Importação de receitas** | A partir de um link, PDF ou imagem, a IA extrai ingredientes, passos, ferramentas e tempo, e monta o cadastro da receita-guia — também sob confirmação humana |
| **Busca semântica** | Permite encontrar execuções por descrição aproximada ("aquele macarrão que deu errado no mês passado"), em vez de exigir o nome exato |
| **Diagnóstico de defeito** | A partir de um defeito relatado, propõe hipótese de causa e correção. Exemplo: "o arroz ficou pastoso" → provável excesso de água ou mexida durante o cozimento, com sugestão de proporção para a próxima tentativa |
| **Relatórios e dashboards** | Compara execuções de um mesmo prato, aponta o que melhorou e o que ainda falha, e gera painéis de evolução (nota ao longo do tempo, defeitos mais frequentes, custo médio por porção, diferença entre tempo estimado e real) |
 
Uma decisão de arquitetura relevante aqui: **os padrões são detectados por consulta ao banco, não pela IA.** Descobrir que "salgado demais" aparece em 7 das últimas 12 execuções é uma agregação SQL. O modelo de linguagem recebe esse fato já pronto e cumpre o papel de interpretá-lo e explicá-lo em linguagem natural. Isso torna a análise determinística, auditável, barata e testável, e mantém a IA na função em que ela é boa — transformar dado em texto e texto em dado.
 
---
 
## 6. Telas previstas
 
O enunciado pede pelo menos quatro. Abaixo estão as onze planejadas, com as cinco principais destacadas.
 
| # | Tela | Função |
|---|---|---|
| 1 | **Login** | Tela onde terá o formulário para login do usuário em sua conta |
| 2 | **Início** | Receitas-guia salvas, resumo do mês e atalho principal para registrar uma execução |
| 3 | **Histórico** | Linha do tempo de todas as execuções, com filtro por prato e período |
| 4 | **Pratos** | Lista dos pratos já feitos, com número de tentativas e nota média |
| 5 | **Prato em detalhe** | Todas as tentativas de um prato, curva de evolução da nota e defeitos recorrentes |
| 6 | **Execução em detalhe** | Ficha completa de uma execução, com mídia, custos, tempo e avaliação |
| 7 | **Nova execução — formulário** | Cadastro manual: prato, chips de ingredientes, custo, tempo, porções e mídia |
| 8 | **Nova execução — áudio** | Gravação do relato e revisão campo a campo do que a IA extraiu, antes de confirmar |
| 9 | **Avaliação** | Estrelas, chips de qualidade e defeito, comentário em texto e áudio opcional |
| 10 | **Cronômetro** | Modo cozinha: tela sempre acesa, números grandes, alto contraste |
| 11 | **Evolução** | Dashboards de nota, defeitos, custo por porção e precisão de tempo |
| 12 | **Perfil** | Despensa de ingredientes salvos como chips, estatísticas gerais e ajustes |
 
---
 
## 7. Fluxo básico de navegação
 
A navegação principal é por abas fixas na parte inferior — **Início, Histórico, Pratos e Perfil** — com um botão de ação central para registrar uma execução. A escolha por navegação inferior é deliberada: o app é usado com uma mão só, muitas vezes com as mãos ocupadas na cozinha.
 
```
                    ┌──────────────────────────────┐
                    │  Abas: Início · Histórico ·  │
                    │        Pratos · Perfil       │
                    └──────────────────────────────┘
 
  INÍCIO ──── abre receita-guia ──> RECEITA-GUIA ──── "começar" ──> CRONÔMETRO
     │                                                                   │
     └──── botão "Cozinhei" ──> COMO REGISTRAR                           │
                                     │                                   │
                     ┌───────────────┼───────────────┐                   │
                     │               │               │                   │
                  ÁUDIO          MANUAL         CRONÔMETRO <─────────────┘
                     │               │               │
                REVISÃO IA           │          (ao finalizar)
                     │               │               │
                     └───────────────┴───────────────┘
                                     │
                              FORMULÁRIO DE EXECUÇÃO
                                     │
                                 AVALIAÇÃO
                                     │
                              EXECUÇÃO SALVA
                                     │
                     ┌───────────────┴───────────────┐
                     │                               │
                 HISTÓRICO                   EXECUÇÃO EM DETALHE
                     │                               │
                  PRATOS                      DIAGNÓSTICO (IA)
                     │
              PRATO EM DETALHE ──────> EVOLUÇÃO (dashboards)
```
 
---
 
## 8. Tecnologia escolhida para o desenvolvimento mobile
 
**React Native com Expo (TypeScript).**
 
A justificativa técnica:
 
- O aplicativo depende fortemente de **recursos nativos de mídia** — câmera, galeria, gravação e reprodução de áudio, e um cronômetro que precisa continuar contando com o app em segundo plano. O ecossistema do Expo cobre todos esses casos com módulos mantidos, evitando a escrita de código nativo
- TypeScript dá **tipagem estática compartilhada** entre app e backend.

---

Flutter foi considerado e é tecnicamente adequado, com desempenho de renderização superior. A decisão pendeu para React Native por permitir compartilhar linguagem e tipos com o backend em TypeScript, reduzindo o custo de manutenção em um projeto que será conduzido apenas por uma pessoa durante o semestre.
 
---
 
## 9. Tecnologia escolhida para o backend
 
Linguagem **TypeScript** por meio do **Supabase**, com **PostgreSQL** como banco relacional, e **Edge Functions** (Deno/TypeScript) para a camada de servidor.
 
A escolha resolve, com um único serviço, quatro necessidades que o projeto tem de qualquer forma:
 
- **Banco relacional.** O modelo do app é relacional (prato → execução → ingredientes, qualidades e defeitos).
- **Autenticação** pronta, sem necessidade de implementar gestão de sessão do zero
- **Storage de objetos** para fotos, vídeos e áudios, com URLs assinadas — algo que o app precisa desde a primeira execução registrada
- **Edge Functions** como intermediárias obrigatórias nas chamadas à IA. Isso mantém as chaves de API fora do aplicativo, permite aplicar limite de uso por usuário e centraliza a validação das respostas
Um ponto decisivo: o Postgres do Supabase suporta a extensão **pgvector**, o que viabiliza a busca semântica sobre o histórico sem introduzir um banco vetorial adicional na arquitetura.
 
---
 
## 10. Comunicação com APIs externas
 
Sim, a aplicação depende de APIs externas — mas de forma **não bloqueante**, o que é uma exigência de projeto: o app precisa continuar funcionando por completo com a IA indisponível.
 
| API | Uso | Se falhar |
|---|---|---|
| **API de LLM** (OpenAI ou equivalente) | Estruturação do áudio em campos, importação de receitas, diagnóstico de defeitos e geração de relatórios | Cadastro manual permanece disponível; relatórios caem para versão puramente estatística, gerada por SQL |
| **API de transcrição de áudio** | Converter o relato falado em texto antes da estruturação | O áudio é salvo mesmo assim, como anexo da execução |
| **Serviço de leitura de página/PDF** | Extrair conteúdo de receitas importadas por link ou arquivo | Cadastro manual da receita-guia |
 
Todas as chamadas passam obrigatoriamente pelas Edge Functions. Nenhuma chave de API fica no aplicativo. As respostas da IA são validadas contra schema no servidor antes de chegarem ao app, e passam ainda por verificações de coerência de domínio (custo negativo, tempo implausível, ingrediente vazio) — porque um JSON bem formatado pode conter valores absurdos.
 
O projeto não depende de nenhuma API paga de catálogo de receitas: o catálogo inicial é pequeno e cadastrado manualmente.
 
---
 
## 11. Forma prevista de armazenamento de dados
 
O armazenamento é organizado em três camadas:
 
**Remoto — PostgreSQL (Supabase).** Modelo relacional simplificado:
 
O campo `embedding` na tabela de execuções é o que sustenta a busca semântica via pgvector.
 
**Local — SQLite (`expo-sqlite`) e armazenamento seguro.** O app mantém cópia local das execuções recentes e das receitas-guia, para funcionar sem conexão. Execuções criadas offline entram em fila e sincronizam quando a rede volta.
 
**Objetos — Supabase Storage.** Fotos, vídeos e áudios, organizados por usuário e execução. Imagens são comprimidas no dispositivo antes do upload, e vídeos têm duração limitada, para conter custo de banda e armazenamento.
 
---
 
## 12. Repositório Git
 
**URL:** https://github.com/vector2357/Aplicativo-Cozinhei
 
**Tag de entrega desta etapa:** `etapa-01`
 
---
 
## 13. Estrutura inicial de diretórios
 
```
cozinhei/
├── README.md
├── app.json
├── package.json
├── tsconfig.json
│
├── docs/
│   ├── proposta.md              # este documento
│   └── telas/                   # protótipos
│
├── src/
│   ├── app/                     # rotas (expo-router)
│   │   ├── (tabs)/
│   │   │   ├── index.tsx        # Início
│   │   │   ├── historico.tsx
│   │   │   ├── pratos.tsx
│   │   │   └── perfil.tsx
│   │   ├── execucao/
│   │   │   ├── nova.tsx
│   │   │   ├── audio.tsx
│   │   │   ├── revisao.tsx
│   │   │   ├── avaliacao.tsx
│   │   │   └── [id].tsx
│   │   ├── prato/[id].tsx
│   │   ├── receita/[id].tsx
│   │   ├── cronometro.tsx
│   │   └── evolucao.tsx
│   │
│   ├── components/
│   │   ├── ui/                  # botão, chip, campo, sheet
│   │   ├── execucao/            # ficha, seletor de ingredientes, estrelas
│   │   └── graficos/
│   │
│   ├── features/                # regras de negócio por domínio
│   │   ├── execucoes/
│   │   ├── pratos/
│   │   ├── ingredientes/
│   │   ├── receitas-guia/
│   │   └── ia/
│   │
│   ├── services/
│   │   ├── supabase.ts
│   │   ├── storage.ts           # mídia
│   │   ├── db-local.ts          # SQLite e fila de sincronização
│   │   └── ia.ts                # chamadas às Edge Functions
│   │
│   ├── hooks/
│   ├── types/                   # tipos compartilhados e schemas de validação
│   ├── theme/                    # cores, tipografia, espaçamento
│   └── utils/
│
├── supabase/
│   ├── migrations/
│   └── functions/
│       ├── transcrever-audio/
│       ├── estruturar-execucao/
│       ├── importar-receita/
│       ├── diagnosticar-defeito/
│       └── gerar-relatorio/
│
└── assets/
    ├── fonts/
    └── images/
```
 
---
 
## Observação final
 
A proposta será revisitada ao longo do semestre. Os pontos com maior chance de ajuste são o escopo do módulo de IA — que pode ser reduzido caso o custo de chamadas se mostre limitante — e o nível de detalhe do registro de custos, que depende de validação com usuários reais. Qualquer alteração será registrada em `/docs` com a devida justificativa.