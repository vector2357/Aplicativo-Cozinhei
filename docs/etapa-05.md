# Etapa 05 — Primeira versão funcional com backend

Até a etapa 04 o Cozinhei era um aplicativo completo e isolado: as execuções
viviam num banco SQLite dentro do aparelho e a sessão era simulada. Esta etapa
acrescenta a divisão de responsabilidades entre frontend e backend. A conta do
usuário passa a ser verificada por um serviço de autenticação real, e as
execuções passam a ser criadas, lidas, alteradas e removidas num banco
PostgreSQL, com o isolamento entre contas garantido pelo próprio banco.

O backend escolhido é o **Supabase** — PostgreSQL com autenticação e API de
dados —, que já era a tecnologia prevista desde a etapa 01
(`docs/proposta.md`, seções 9 e 11).

O ponto de ligação já existia. A etapa 03 concentrou todo o acesso a dados em
`src/features/execucoes/repositorio.ts`, e a etapa 04 o colocou sobre uma
camada de acesso trocável. Por isso **nenhuma das doze telas precisou ser
reescrita**: o repositório passou a escolher entre dois bancos, e as telas
continuaram consumindo os mesmos tipos.

---

## 1. Fluxo completo de negócio implementado

O fluxo entregue é o **ciclo de vida de uma execução**, no formato
`criar → visualizar → alterar → excluir`, com cada operação indo ao servidor.
Ele é precedido pelo fluxo de conta, que é o que dá identidade aos dados.

| # | Etapa do fluxo | Tela | O que acontece no backend |
| --- | --- | --- | --- |
| 1 | **Criar conta** ou **entrar** | `/criar-conta`, `/` | o serviço de autenticação valida as credenciais e devolve um token de sessão |
| 2 | **Criar** a execução | `/execucao/ficha` | `INSERT` na tabela `execucoes`, com o dono preenchido pelo servidor |
| 3 | **Visualizar** no histórico e em detalhe | `/historico`, `/execucao/[id]` | `SELECT` das execuções da conta, ordenadas |
| 4 | **Alterar** tempo, custo, nota e chips | `/execucao/ficha?id=…` | `UPDATE` da linha |
| 5 | **Excluir**, com confirmação | `/execucao/[id]` | `DELETE` da linha |
| 6 | **Sair da conta** | `/perfil` | a sessão é encerrada no servidor |

A operação se conclui de ponta a ponta: o que foi criado no passo 2 aparece no
passo 3, sobrevive ao encerramento do aplicativo e desaparece de verdade no
passo 5 — inclusive para o mesmo usuário em outro aparelho, porque o dado não
está mais só no telefone.

### Os dois modos de operação

A aplicação funciona nos dois estados, e isso é decisão de projeto, não
acidente:

| Modo | Quando | Onde os dados ficam |
| --- | --- | --- |
| **Conectado** | há credenciais do backend em `.env` | PostgreSQL, com autenticação real |
| **Local** | não há credenciais | SQLite do aparelho, como na etapa 04 |

Quem decide é `modoConectado()`
(`src/services/supabase.ts`, linha 17). Sem isso, clonar o repositório sem
credencial nenhuma resultaria num aplicativo que não abre — e a persistência
local entregue na etapa 04 deixaria de ser demonstrável.

## 2. Passo a passo para executar o fluxo

Pré-requisito: as credenciais configuradas conforme a seção 7.

1. **Criar conta.** Na tela inicial, toque em "criar uma conta". Informe nome,
   e-mail, uma senha de 8 caracteres ou mais, aceite os termos e confirme. O
   aplicativo vai para a tela de espera e, com a conta criada, entra no início.
2. **Confirmar que a conta é nova.** O histórico, os pratos e o perfil aparecem
   nos estados vazios. Uma conta de servidor nasce sem dado nenhum.
3. **Criar.** Toque no `+` da barra de abas → "preencher à mão". Preencha
   *Bolo de cenoura*, 70 minutos, R$ 13,50, nota 4 e "massa fofa" em o que deu
   certo. Toque em "salvar execução".
4. **Visualizar.** A barra de confirmação anuncia "execução registrada". Abra a
   aba **histórico**: a ficha está lá, no mês corrente, com **tentativa 01**.
   Toque nela para ver a ficha completa.
5. **Alterar.** Na ficha, toque em "editar", mude a nota para 5 e salve. A
   confirmação diz "ficha atualizada" e o detalhe passa a mostrar 5 estrelas.
6. **Excluir.** Na ficha, toque em "remover execução" e confirme no sheet. A
   confirmação diz "execução removida" e ela sai do histórico.
7. **Verificar que o dado é do servidor.** Encerre a aplicação pelo
   multitarefa, reabra, e ela volta direto à conta — a sessão foi restaurada do
   token. Registre uma execução, depois saia da conta e entre de novo: a
   execução continua lá.
8. **Verificar o isolamento.** Saia da conta e crie uma segunda conta, com
   outro e-mail. Histórico, pratos e perfil aparecem vazios: os dados da
   primeira conta não são visíveis.

## 3. Funcionalidades integradas nesta etapa

O que cada etapa anterior entregou, agora funcionando sobre o backend:

| Origem | Funcionalidade | Como passou a funcionar |
| --- | --- | --- |
| Etapa 02 | telas de entrada e criação de conta | os formulários passaram a alimentar uma autenticação real; a senha digitada vai ao servidor em vez de ser descartada |
| Etapa 02 | tela de espera (`/entrando`) | deixou de ser um atraso simulado: cobre a ida real ao servidor, e **ganhou estado de erro** |
| Etapa 03 | navegação, abas e segundo nível | sem alteração — é a prova de que a camada de dados estava no lugar certo |
| Etapa 03 | os três estados de cada tela (vazio, carregando, erro) | o estado de erro passou a ter uma segunda causa real: a falha do servidor |
| Etapa 04 | a ficha de execução, que cria e edita | passou a gravar no PostgreSQL |
| Etapa 04 | as derivações (pratos, tentativas, evolução, estatísticas) | continuam calculadas no aplicativo, agora sobre as linhas que vêm do servidor |
| Etapa 04 | persistência local em SQLite | continua inteira, e é o que responde quando não há backend configurado |
| Etapa 04 | sessão persistida | passou a ser o token do serviço de autenticação, com renovação automática |

### Os arquivos que nasceram nesta etapa

| Arquivo | Papel |
| --- | --- |
| `src/services/supabase.ts` | o cliente do backend e a decisão entre os dois modos |
| `src/features/execucoes/bancoRemoto.ts` | as quatro operações de dados contra o PostgreSQL |
| `src/features/execucoes/fonteDeDados.ts` | qual banco responde agora — local ou remoto |
| `src/features/auth/autenticacaoRemota.ts` | criar conta, entrar, sair, restaurar sessão, e a tradução das falhas |
| `supabase/migrations/0001_execucoes.sql` | a tabela, o índice e as políticas de segurança |
| `.env.example` | o modelo das variáveis de ambiente |

E duas suítes de teste: `src/__tests__/backend.test.ts` e
`src/__tests__/fluxo-backend.test.tsx`.

### A divisão de responsabilidades

| Responsabilidade | Onde fica | Por quê |
| --- | --- | --- |
| Identidade e sessão | **backend** | senha nunca é comparada no aplicativo; o token é emitido e renovado pelo servidor |
| Autoridade sobre os dados | **backend** | a tabela e as políticas decidem quem lê e escreve o quê |
| Isolamento entre contas | **backend** | políticas de RLS, não um filtro do cliente |
| Validação de formulário | **frontend** | resposta imediata, sem ida à rede para dizer que um campo está vazio |
| Derivação (pratos, médias, evolução) | **frontend** | são agregações de leitura sobre dados já trazidos |
| Formatação brasileira | **frontend** | é apresentação |
| Navegação e estados de tela | **frontend** | é interface |

## 4. Tratamento de entradas inválidas

Três camadas, e a de fora nunca confia na de dentro.

**No formulário, antes de qualquer rede.** A validação de entrada
(`src/features/auth/validacao.ts`) e a da ficha
(`src/features/execucoes/validacao.ts`, linha 11) barram o envio e marcam o
campo:

| Campo | Regra | Mensagem |
| --- | --- | --- |
| e-mail | obrigatório | "informe seu e-mail" |
| e-mail | com formato de e-mail | "esse e-mail não parece completo" |
| senha | obrigatória | "informe sua senha" |
| senha | no cadastro, 8 caracteres ou mais | "use 8 caracteres ou mais" |
| nome | obrigatório no cadastro | "diga como te chamamos" |
| termos | aceite obrigatório | "é preciso aceitar os termos para criar a conta" |
| prato | obrigatório | "diga o que você cozinhou" |
| tempo | número, maior que zero, com teto de 24 h | "mais de um dia de forno? confira o número" |
| custo | número, não negativo | "use só números, em reais" |

O mínimo de senha do aplicativo (8) é mais rígido que o do servidor (6), de
propósito: a regra mais exigente é a que o usuário encontra primeiro, e sem ida
à rede.

Um formulário inválido **não chega a falar com o servidor** — há teste para
isso. O erro aparece colado ao campo, e desaparece quando o campo é corrigido.

**Na resposta do servidor.** O que só o servidor sabe vira mensagem em
português, em caixa baixa, pela tradução em `autenticacaoRemota.ts`:

| Situação | Mensagem ao usuário |
| --- | --- |
| senha ou e-mail que não combinam | "e-mail ou senha incorretos." |
| e-mail já cadastrado | "este e-mail já tem uma conta. tente entrar." |
| senha recusada pelo servidor | "a senha precisa de pelo menos 6 caracteres." |
| conta pendente de confirmação | "confirme seu e-mail antes de entrar." |
| servidor inalcançável | "não consegui falar com o servidor. verifique sua conexão." |
| cadastro por e-mail desligado no projeto | "o cadastro por e-mail está desligado no servidor." |
| projeto não aceitando contas novas | "o servidor não está aceitando contas novas agora." |
| excesso de tentativas | "muitas tentativas. espere um instante e tente de novo." |

Nenhuma mensagem do servidor chega ao usuário em inglês, e nenhuma expõe
detalhe interno — há teste que verifica as duas coisas.

As duas últimas linhas da tabela são falhas de **configuração**, não de quem
digitou. Elas têm entrada própria porque a frase genérica ("tente de novo")
convidaria a insistir num caminho que nunca funcionaria.

**No banco.** As restrições de coluna (`not null`, chave primária) e as
políticas de RLS recusam o que passar das duas camadas anteriores. Uma falha
aqui vira exceção no aplicativo e cai no estado de erro da tela, em vez de
virar uma lista vazia silenciosa.

## 5. Mecanismos de feedback utilizados

| Mecanismo | Onde aparece | O que comunica |
| --- | --- | --- |
| **Barra de confirmação** no rodapé | após cada operação | "execução registrada", "ficha atualizada", "execução removida", "você saiu da sua conta", "entrada cancelada" |
| **Barra em tom de erro** | falha ao salvar | "não consegui salvar. tente de novo." |
| **Erro no campo** | formulários | a regra que não foi cumprida, colada ao campo |
| **Esqueleto de conteúdo** | telas de dados carregando | que há busca em andamento, com a silhueta do que vem |
| **Indicador em anel** | tela de espera da entrada | que a conta está sendo verificada no servidor |
| **Estado de erro com ação** | qualquer tela de dados, e agora a de espera | o que aconteceu, e "tentar de novo" |
| **Estado vazio com convite** | listas sem dado | que está vazio porque é novo, com o caminho para o primeiro registro |
| **Sheet de confirmação** | sair da ficha, remover execução | o que será perdido, antes de perder |

Três detalhes que valem registro:

- **A barra de confirmação é anunciada ao leitor de tela**, não só exibida: uma
  confirmação que só existe visualmente não confirma nada para quem não vê.
- **O estado de erro da tela de espera oferece duas saídas** — "tentar de novo"
  e "voltar para a entrada" —, porque insistir não é a resposta certa quando o
  problema é a senha.
- **Cancelar não é erro.** Quem desiste na tela de espera volta ao login com a
  confirmação "entrada cancelada", e não com uma mensagem de falha.

## 6. Principais decisões técnicas

### 6.1 O aplicativo funciona sem backend configurado

`modoConectado()` resolve a cada chamada, e `fonte()`
(`src/features/execucoes/fonteDeDados.ts`, linha 38) devolve o banco remoto ou
o local. Sem as variáveis de ambiente, a aplicação é exatamente a da etapa 04.

Isso resolve três problemas de uma vez: a persistência local entregue na etapa
04 continua demonstrável; quem clona o repositório consegue executar sem
credencial; e as 428 asserções que já existiam continuam valendo sem alteração,
porque o modo local é o padrão em teste.

### 6.2 O isolamento entre contas é do banco, não do aplicativo

No SQLite, cada consulta carrega `WHERE dono = ?` — e isso depende de o
aplicativo lembrar de aplicar o filtro. No PostgreSQL, quem filtra são as
políticas de **Row Level Security**: cada operação é restrita a
`auth.uid() = usuario_id`, resolvido a partir do token.

A diferença é de natureza, não de grau. O aplicativo **nunca envia a coluna do
dono**: ela tem `default auth.uid()`, então é o servidor que a preenche. Um
cliente adulterado não consegue nem ler nem escrever no nome de outra conta, e
não há filtro do cliente que possa ser esquecido.

### 6.3 Um arquivo só fala com o servidor, como um só fala SQL

`bancoRemoto.ts` é a única porta para o PostgreSQL, com as mesmas quatro
operações que `bancoLocal.ts` expõe para o SQLite. As duas satisfazem a mesma
forma (`FonteDeDados`), e é isso que permitiu trocar a fonte sem tocar no
repositório acima dela nem nas telas.

### 6.4 A chave que vai no aplicativo é a pública, e só ela

A variável precisa do prefixo `EXPO_PUBLIC_` para chegar ao aplicativo, o que
significa que **ela vai para o pacote distribuído**. Por isso só a chave `anon`
é usada: ela é pública por projeto e está sujeita às políticas de RLS. A chave
de serviço, que ignora as políticas, nunca entra no aplicativo — e, pela regra
registrada em `docs/proposta.md` seção 10, chamadas que exijam segredo passarão
por funções no servidor.

### 6.5 A leitura da sessão continua com teto, inclusive no caminho novo

A aplicação só monta as rotas depois de saber se há sessão, e enquanto não sabe
**não há tela montada** — logo não há onde mostrar erro nem indicador. Por isso
essa leitura tem um teto de dois segundos, e o teto passou a valer para as duas
fontes: o armazenamento local e o do token.

Era o ponto mais fácil de errar nesta etapa. Trocar a leitura local por uma ida
ao armazenamento do token sem manter o teto produziria um aplicativo que não
abre quando a fonte não responde. Há teste para isso: com a leitura da sessão
travada, a aplicação abre na tela de entrada depois do teto, em vez de ficar
parada.

### 6.6 A senha vive só na memória, e só até ser usada

As credenciais digitadas ficam em estado do React entre o formulário e a ida ao
servidor, e são descartadas assim que a sessão é aplicada. Não são persistidas,
não entram no objeto de usuário e não aparecem em registro de log. O que fica
guardado depois do login é o token da sessão. Há teste que varre o
armazenamento local procurando a senha.

### 6.7 Conta nova de servidor nasce vazia

O conjunto de 21 execuções de exemplo continua existindo, mas é recurso do modo
local: ele dá ao aplicativo o que mostrar sem backend nenhum. Semear uma conta
real inventaria 21 execuções que o usuário nunca cozinhou.

### 6.8 O que ficou deliberadamente de fora

- **Espelho local e fila de sincronização.** No modo conectado o servidor é a
  fonte da verdade; a cópia local das execuções remotas e a fila para o que foi
  criado sem rede estão previstas em `docs/proposta.md` seção 11 e dependem de
  uma política de resolução de conflito que esta etapa não decide.
- **Entrar com Google.** O fluxo oficial exige configuração de provedor e
  redirecionamento no aparelho. No modo conectado o botão responde com a
  mensagem de que o caminho chega em etapa posterior, em vez de simular uma
  verificação que não houve. No modo local ele segue como estava.
- **Recuperação de senha, fotos e áudios, e as funcionalidades de IA.** Todas
  dependem de serviços adicionais e são de etapas posteriores. Os controles que
  já existem na interface continuam anunciando a etapa em que chegam.

## 7. Instruções para execução e teste

### 7.1 Configurar o backend

Sem este passo a aplicação executa em modo local, e o fluxo desta etapa não
acontece.

1. Crie uma conta em [supabase.com](https://supabase.com) e um projeto novo.
2. No painel do projeto, abra **SQL Editor**, cole o conteúdo de
   [`supabase/migrations/0001_execucoes.sql`](../supabase/migrations/0001_execucoes.sql)
   e execute. Isso cria a tabela, o índice e as quatro políticas de segurança.
3. Em **Authentication**, ajuste dois interruptores — e eles ficam em lugares
   diferentes, o que é fácil confundir:

   | Onde | Opção | Deixe | Por quê |
   | --- | --- | --- | --- |
   | **Sign In / Providers → Email** | *Enable email provider* | **ligado** | desligado, `signup` responde `400 email_provider_disabled` e não há como criar conta |
   | seção **User Signups** | *Confirm email* | **desligado** | ligado, criar conta não devolve sessão e o fluxo exige abrir o e-mail no meio do caminho |

   Não confunda o *Confirm email* com o **Secure email change**, que fica dentro
   do provedor: aquele trata da *troca* de e-mail de uma conta que já existe e
   não tem relação com o cadastro. Deixe-o como está.

   O painel já moveu o *Confirm email* de dentro do provedor para a seção
   **User Signups** — se não achar num, procure no outro.
4. Pegue a **Project URL** e a chave **anon public**. A URL é a **raiz** do
   projeto, sem caminho nenhum depois do domínio:

   ```
   https://<project-ref>.supabase.co
   ```

   O `<project-ref>` aparece no endereço do painel
   (`supabase.com/dashboard/project/<project-ref>`). **Não use o endereço do
   endpoint REST** (`.../rest/v1/`): o cliente monta os caminhos a partir da
   raiz, e com o sufixo cada chamada vira `/rest/v1//auth/v1/...` e responde
   404. A chave fica em **Project Settings → API Keys**; serve tanto a `anon`
   quanto a *publishable*.
5. Na raiz do projeto, copie `.env.example` para `.env` e preencha:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://seuprojeto.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
   ```

6. Reinicie o servidor de desenvolvimento. As variáveis são lidas na carga do
   pacote: sem reiniciar, a aplicação continua em modo local.

> O `.env` é ignorado pelo git. A chave `anon` é pública por projeto e é
> protegida pelas políticas de RLS; a chave `service_role` **não** deve ser
> colocada aqui nem em qualquer lugar do aplicativo.

### 7.2 Executar

```bash
npm install          # o .npmrc já aplica legacy-peer-deps
npm run android      # abre no emulador ou no aparelho conectado
```

### 7.3 Verificação automatizada

```bash
npm run typecheck                  # tsc --noEmit
npm test                           # Jest
npx expo export --platform android # pega erro de resolução de módulo
```

Os três precisam passar. São **477 asserções em 23 suítes** — as 428 que já
existiam, sem nenhuma alteração, mais 49 desta etapa. As novas:

| Suíte | O que verifica |
| --- | --- |
| `src/__tests__/backend.test.ts` | as quatro operações remotas, a conversão dos tipos que voltam do banco, a falha virando exceção, e a tradução de cada mensagem de autenticação |
| `src/__tests__/fluxo-backend.test.tsx` | o fluxo completo de negócio contra o servidor, as derivações da etapa 04 sobre dados remotos, o isolamento entre contas, a senha não persistida, a entrada pelas telas reais com erro e com acerto, e a abertura da aplicação com sessão restaurada |

O acesso ao backend é substituído em teste por um dublê da camada de acesso
(`src/services/__mocks__/supabase.ts`), que imita duas coisas de propósito: o
dono preenchido pelo servidor e o escopo por conta na leitura. **O dublê não
prova que as políticas de RLS estão ligadas no projeto real** — isso é SQL
rodando no servidor, e quem verifica é o passo 8 do roteiro da seção 2.

### 7.4 Verificar o isolamento diretamente no banco

Com duas contas criadas pelo aplicativo, no SQL Editor do painel:

```sql
-- quantas linhas existem, e de quantos donos distintos
select usuario_id, count(*) from public.execucoes group by usuario_id;

-- as políticas ativas na tabela
select policyname, cmd from pg_policies where tablename = 'execucoes';
```

A primeira consulta mostra as linhas separadas por dono; a segunda deve listar
as quatro políticas, uma por operação.

---

## Limitações declaradas

1. **Não há espelho local das execuções remotas.** No modo conectado, sem rede
   a tela mostra o estado de erro com "tentar de novo". A fila de sincronização
   é de etapa posterior.
2. **Entrar com Google não está implementado** no modo conectado, pela razão da
   seção 6.8.
3. **Não há recuperação de senha.** O controle existe na interface e anuncia a
   etapa em que chega.
4. **As receitas-guia não têm tabela remota.** Elas não possuem fluxo de
   importação, e por isso aparecem apenas no modo local, junto com o conjunto
   de exemplo.
5. **Fotos e áudios continuam como marcadores.** O armazenamento de objetos é
   de etapa posterior.
6. **As políticas de segurança não são exercitadas por teste automatizado**,
   pela razão explicada na seção 7.3. A verificação é o roteiro no aparelho e a
   consulta da seção 7.4.
