# Etapa 04 — Persistência local de dados

Esta etapa dá ao Cozinhei um lugar para guardar o que o usuário registra. Até a
etapa 03 o aplicativo exibia um conjunto de dados de exemplo mantido em memória:
funcionava enquanto a aplicação estava aberta e desaparecia ao fechá-la. Agora as
execuções são criadas, lidas, alteradas e removidas num banco de dados no próprio
aparelho, e continuam disponíveis depois de encerrar e reabrir a aplicação.

O ponto de ligação já existia. A etapa 03 concentrou todo o acesso a dados em
`src/features/execucoes/repositorio.ts` — dez funções assíncronas, todas
recebendo o dono dos dados. Por isso nenhuma das dez telas existentes precisou
ser reescrita: o repositório trocou a fonte, e as telas continuaram consumindo os
mesmos tipos.

---

## 1. Mecanismo de persistência utilizado

Duas camadas locais, cada uma com um papel distinto:

| Camada | Tecnologia | O que guarda |
| --- | --- | --- |
| Banco de dados relacional | **`expo-sqlite`** (SQLite) | as execuções do usuário, numa tabela por coluna |
| Armazenamento chave-valor | **`@react-native-async-storage/async-storage`** | a sessão, para a aplicação reabrir já dentro da conta |

Ambas são locais ao dispositivo e funcionam sem rede: nenhuma parte desta etapa
depende de servidor.

O arquivo de banco é `cozinhei.db`, criado pelo próprio aplicativo na primeira
execução. **Todo o acesso ao SQLite está em um único arquivo** —
`src/features/execucoes/bancoLocal.ts` —, que é o único módulo do projeto que
importa `expo-sqlite`. A sessão fica em `src/features/auth/sessaoArmazenada.ts`,
sob a chave `cozinhei:sessao`.

## 2. Justificativa da escolha

**Por que SQLite para as execuções.** A execução é um registro relacional, não um
documento isolado: ela pertence a um prato, ocupa uma posição numerada na série de
tentativas daquele prato e alimenta agregações (média por prato, total por mês,
defeito mais recorrente). O SQLite entrega isso com três vantagens concretas sobre
um arquivo serializado:

1. **Escrita por linha.** Criar, alterar ou remover uma execução é um `INSERT`,
   um `UPDATE` ou um `DELETE` que toca uma linha. Um arquivo JSON exigiria
   reescrever o conjunto inteiro a cada toque — e o risco de corromper tudo num
   encerramento no meio da gravação.
2. **Separação por dono.** A coluna `dono` com índice permite que contas
   diferentes no mesmo aparelho tenham históricos independentes, sem que uma
   leitura precise filtrar tudo em memória.
3. **Continuidade com a etapa seguinte.** O armazenamento remoto previsto em
   `docs/proposta.md` é PostgreSQL. O esquema desta tabela é o mesmo modelo que
   lá será criado, o que torna a sincronização futura uma tradução de colunas e
   não um remodelamento.

**Por que AsyncStorage para a sessão.** A sessão é um único valor pequeno, lido
uma vez na abertura e escrito uma vez no login. Criar tabela para isso seria
desproporcional; a API chave-valor resolve em três funções. Além disso, é ela que
produz a evidência mais direta do que esta etapa pede: ao reabrir a aplicação, o
usuário cai diretamente na tela de início, com os dados na tela, sem passar pelo
formulário de entrada.

**Por que essas duas e não outras.** São as tecnologias que a documentação do
projeto já havia escolhido, desde a etapa 01:

- `README.md`, seção *Tecnologias*: "Armazenamento local: SQLite (expo-sqlite) e
  AsyncStorage";
- `docs/proposta.md`, seção 11: "Local — SQLite (`expo-sqlite`) […] cópia local
  das execuções".

Esta etapa cumpre o que estava previsto, em vez de abrir uma terceira opção.

## 3. Estrutura dos dados armazenados

Duas tabelas, criadas com `CREATE TABLE IF NOT EXISTS` na primeira abertura
(`src/features/execucoes/bancoLocal.ts`):

```sql
CREATE TABLE IF NOT EXISTS donos (
  dono    TEXT PRIMARY KEY NOT NULL,
  semeado INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS execucoes (
  id        TEXT PRIMARY KEY NOT NULL,
  dono      TEXT NOT NULL,
  prato_id  TEXT NOT NULL,
  prato     TEXT NOT NULL,
  mes       TEXT NOT NULL,
  tentativa TEXT NOT NULL,
  data      TEXT NOT NULL,
  tempo     TEXT NOT NULL,
  custo     REAL NOT NULL,
  nota      REAL NOT NULL,
  chips     TEXT NOT NULL,
  criado_em INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS execucoes_por_dono ON execucoes (dono, criado_em DESC);
```

### Como as colunas correspondem ao tipo do domínio

O tipo `Execucao` está em `src/types/dominio.ts` e tem uma coluna para cada campo:

| Coluna | Campo de `Execucao` | Observação |
| --- | --- | --- |
| `id` | `id` | chave primária, gerada no aplicativo |
| `prato_id` | `pratoId` | agrupa as execuções do mesmo prato |
| `prato` | `prato` | nome exibido |
| `mes` | `mes` | rótulo do agrupamento do histórico: `agosto de 2026` |
| `tentativa` | `tentativa` | número na série, sempre com dois dígitos: `04` |
| `data` | `data` | data curta: `19 ago` |
| `tempo` | `tempo` | tempo gasto: `1h05` |
| `custo` | `custo` | `REAL` — número, não texto |
| `nota` | `nota` | `REAL`, de 0 a 5 |
| `chips` | `chips` | lista de qualidades e defeitos, em JSON |

Duas decisões merecem registro:

- **`chips` é JSON numa coluna, e não uma segunda tabela.** São no máximo dois
  rótulos curtos por execução, e nenhuma consulta desta etapa filtra por chip —
  o defeito recorrente é calculado no repositório, em cima das linhas já lidas.
  Normalizar dobraria o código de acesso sem nada em troca.
- **`criado_em` não pertence ao tipo do domínio.** É um inteiro que existe só
  para ordenar (`ORDER BY criado_em DESC`), e é o que coloca uma execução nova no
  topo do histórico. Ele é gerado por um contador estritamente crescente, porque
  duas gravações no mesmo milissegundo empatariam e o desempate do SQLite é
  arbitrário.

A tabela `donos` responde se um dono já foi inicializado — o que evita semear o
conjunto de exemplo duas vezes — e se ele carrega esse conjunto.

### O conjunto de exemplo

As 21 execuções de `src/features/execucoes/fixtures.ts` deixaram de ser a fonte
de dados e passaram a ser a **semente** do banco: entram uma única vez, na
primeira entrada de um dono que as traz. Entrar por e-mail e senha abre a conta de
demonstração com elas; criar uma conta nova começa com o banco vazio, e as telas
caem nos estados vazios. Esse é o mesmo comportamento da etapa 03 — a diferença é
que agora ele é persistido e separado por conta.

### O que guarda a sessão

Sob a chave `cozinhei:sessao`, o objeto `Usuario` em JSON (nome, e-mail,
iniciais, desde quando cozinha, total de execuções). Um valor corrompido é tratado
como ausência de sessão: a leitura devolve `null` em vez de lançar, porque travar
a abertura da aplicação seria pior do que pedir para entrar outra vez.

A mesma regra vale para o tempo. A aplicação só monta as rotas depois de o
armazenamento responder — é isso que evita o formulário de entrada aparecer por
um instante sobre uma sessão que existe —, e por isso essa leitura tem um teto
de dois segundos: se o armazenamento não responder, vale como ausência de
sessão e a aplicação abre na tela de entrada. **A abertura não espera o banco
de dados.** A sessão é aplicada de imediato e a preparação do SQLite acontece
em seguida, fora do caminho da abertura; quem cobre esse intervalo são os
estados de carregamento que cada tela já tem. Nenhuma operação de disco pode
atrasar indefinidamente a primeira tela.

## 4. Operações de persistência implementadas

As cinco operações pedidas, cada uma com a função que a expõe e o comando SQL que
a executa.

| Operação | Função pública (`features/execucoes/repositorio.ts`) | SQL (`features/execucoes/bancoLocal.ts`) |
| --- | --- | --- |
| **Criar** | `criarExecucao` — linha 191 | `INSERT INTO execucoes …` — `inserirExecucao`, linha 79 |
| **Armazenar a semente** | `garantirDadosDoDono` — linha 51 | o mesmo `INSERT`, uma vez por dono, mais `INSERT OR IGNORE INTO donos` — linha 133 |
| **Recuperar** | `buscarExecucao` (75), `listarExecucoes` (80), `listarExecucoesRecentes` (85), `listarHistoricoPorMes` (90), `listarPratos` (105), `buscarPrato` (136), `listarExecucoesDoPrato` (142), `obterResumoDoMes` (157), `obterEstatisticas` (173) | `SELECT … FROM execucoes WHERE dono = ? ORDER BY criado_em DESC` — `lerExecucoes`, linha 69 |
| **Atualizar** | `atualizarExecucao` — linha 227 | `UPDATE execucoes SET prato, tempo, custo, nota, chips WHERE id = ? AND dono = ?` — linha 103 |
| **Remover** | `removerExecucao` — linha 249 | `DELETE FROM execucoes WHERE id = ? AND dono = ?` — linha 120 |

Alguns detalhes do comportamento:

- **Criar deriva o que o usuário não digita.** O formulário pergunta prato, tempo
  em minutos, custo, nota e dois campos opcionais. O repositório calcula o `id`, o
  `pratoId` (um nome já registrado reaproveita o prato existente, comparando sem
  acento nem caixa — é isso que numera a tentativa e faz a tira de evolução
  crescer), o número da `tentativa`, a `data`, o `mes` e o `tempo` formatado.
  Nenhuma tela monta string de formato: isso é papel de `src/utils/formato.ts`.
- **Atualizar não mexe no prato, no `prato_id`, na `tentativa` nem no
  `criado_em`.** Trocar o prato de uma execução a moveria de série e renumeraria
  duas sequências de tentativas; é uma operação de transação, e fica para quando
  houver banco no servidor. A edição altera tempo, custo, nota e chips.
- **Remover um id inexistente não é erro.** A lista já não o tem, e estourar aí
  seria transformar uma condição de corrida em falha visível.
- **Nenhuma função atravessa contas.** Todas filtram por `dono`, que é o e-mail
  normalizado do usuário autenticado (`donoDe`, linha 34).
- **As telas já montadas releem depois de uma mutação.** Cada mutação chama
  `notificarMudanca()` (`features/execucoes/versaoDosDados.ts`), e as telas
  declaram `useVersaoDosDados()` entre as dependências da sua busca. Sem isso,
  salvar uma execução e voltar para uma aba que continuou montada mostraria a
  lista antiga.
- **O ramo de erro passou a ser alcançável.** Até a etapa 03 nenhuma função de
  dados podia falhar, e os estados de erro de sete telas nunca executaram. Uma
  falha de SQLite agora propaga pelo `useCarregamento` e cai nesse ramo.

## 5. Telas que utilizam os dados persistidos

| Tela | Rota | O que lê ou escreve |
| --- | --- | --- |
| **Ficha de execução** (nova) | `/execucao/ficha` | **cria** e **atualiza**. Modal de tela cheia, com confirmação antes de descartar o que foi digitado |
| **Execução em detalhe** | `/execucao/[id]` | **lê** uma execução; oferece **editar** e **remover execução**, esta com confirmação |
| **Início** | `/inicio` | resumo do mês, execuções recentes e receitas-guia |
| **Histórico** | `/historico` | todas as execuções, agrupadas por mês |
| **Pratos** | `/pratos` | pratos derivados das execuções, com a tira de evolução |
| **Prato em detalhe** | `/prato/[id]` | o prato e as suas tentativas |
| **Evolução** | `/evolucao` | os números gerais e a curva por prato |
| **Perfil** | `/perfil` | execuções, pratos, nota média e custo total; **apaga a sessão** ao sair da conta |
| **Entrar** | `/` | redireciona para `/inicio` quando há **sessão guardada** |

A ficha é alcançada de dois lugares: pelo botão `+` da barra de abas, em
"preencher à mão", e pelo botão "registrar a primeira" dos estados vazios de
início, histórico, pratos e perfil.

## 6. Instruções para execução e teste

### Pré-requisitos

Node.js 20 ou superior e um emulador Android (ou um aparelho com o Expo Go).

```bash
npm install          # o .npmrc já aplica legacy-peer-deps
npm run android      # abre no emulador ou no aparelho conectado
```

### Verificação automatizada

```bash
npm run typecheck                  # tsc --noEmit
npm test                           # Jest
npx expo export --platform android # pega erro de resolução de módulo
```

Os três precisam passar. As suítes que cobrem esta etapa:

| Suíte | O que verifica |
| --- | --- |
| `src/__tests__/repositorio.test.ts` | as cinco operações, a numeração de tentativas, a separação por dono e a releitura do que foi gravado |
| `src/__tests__/ficha-de-execucao.test.tsx` | a tela de ficha criando e editando, a validação dos campos, a confirmação de saída e a remoção |
| `src/__tests__/sessao.test.tsx` | a sessão sendo gravada, restaurada e apagada, e a aplicação abrindo direto no início |
| `src/__tests__/fluxos.test.tsx` | o caminho completo pelo roteador real: `+` → ficha → salvar → a execução no histórico |
| `src/__tests__/formato.test.ts` | os formatos de tempo, data curta e mês |

Em Jest, o acesso ao banco é substituído por um dublê em memória com as mesmas
assinaturas (`src/features/execucoes/__mocks__/bancoLocal.ts`), porque o módulo
nativo do SQLite não existe em ambiente Node. **O SQL real não é exercitado pelos
testes automatizados** — quem o verifica é o roteiro abaixo, no aparelho.

### Roteiro de teste no aparelho

1. Entre com qualquer e-mail e senha. O histórico abre com 21 execuções em 9
   pratos.
2. Toque no `+` → **preencher à mão**. Registre *Bolo de cenoura*, 70 minutos,
   R$ 13,50, nota 4, "massa fofa" em o que deu certo. Salve.
3. Confira: a ficha nova está no topo do histórico, no mês corrente, com
   **tentativa 05**; em `/pratos`, o bolo de cenoura passou a ter 5 tentativas e a
   tira de evolução cresceu.
4. Abra a execução nova, toque em **editar**, mude a nota para 5 e salve. O
   detalhe mostra 5 estrelas.
5. Abra a execução, toque em **remover execução** e confirme. Ela sai do
   histórico, e o bolo volta a 4 tentativas.
6. Saia da conta e crie uma conta nova. Histórico, pratos e perfil aparecem nos
   estados vazios — os dados são por conta.
7. Desligue o Wi-Fi e repita os passos 2 a 5. Tudo funciona: o armazenamento é
   local.

## 7. Verificação da persistência após encerrar e reabrir

O teste decisivo. **Encerrar não é mandar para o fundo**: é preciso remover a
aplicação da lista de aplicativos recentes, para que o processo morra e o estado em
memória se perca. O que sobrevive a isso só pode ter vindo do disco.

| # | Ação | O que deve acontecer |
| --- | --- | --- |
| 1 | Entrar e registrar uma execução (`+` → preencher à mão) | a ficha aparece no histórico |
| 2 | Encerrar a aplicação pelo multitarefa e reabrir | **abre direto em `/inicio`**, sem o formulário de entrada — a sessão veio do AsyncStorage — e a execução registrada está no histórico: *recuperação confirmada* |
| 3 | Abrir a execução, editar a nota, salvar; encerrar e reabrir | a nota alterada continua lá: *atualização persistida* |
| 4 | Abrir a execução, remover, confirmar; encerrar e reabrir | ela não voltou, e a contagem de tentativas do prato diminuiu: *remoção persistida* |
| 5 | Sair da conta, criar uma conta nova, encerrar e reabrir | continua na conta nova e continua vazia: *os dados são por dono, e a sessão também* |

Opcionalmente, o conteúdo do banco pode ser inspecionado diretamente. O caminho
mais simples é o visualizador que o próprio `expo-sqlite` oferece: com o
servidor de desenvolvimento rodando e a aplicação aberta, pressione `shift+m` no
terminal e escolha `expo-sqlite`. Abre uma página no navegador que lista as
tabelas e executa consultas contra o banco do aparelho.

Para examinar o arquivo fora da aplicação, o caminho dele é exposto pelo próprio
banco (`conexao().databasePath`) e pode ser copiado com o `adb`:

```bash
# o banco fica no sandbox de quem hospeda o processo:
# host.exp.exponent no Expo Go, br.com.cozinhei.app num build próprio
adb exec-out run-as host.exp.exponent cat '<caminho>' > cozinhei.db
sqlite3 cozinhei.db "select prato, tentativa, nota from execucoes order by criado_em desc;"
```

Capturas de tela dos passos 1, 2 e 5 servem como evidência complementar.

---

## Limitações declaradas

Registradas aqui porque documentação incompleta é pior do que documentação
ausente:

1. **O prato não é editável.** Alterar o prato de uma execução renumeraria duas
   séries de tentativas; a edição cobre tempo, custo, nota e chips.
2. **A nota do formulário tem cinco passos inteiros.** As meias notas que
   aparecem no conjunto de exemplo (4,5) chegam com a ficha preenchida por áudio,
   em etapa posterior.
3. **As receitas-guia ainda não têm tabela.** Elas não possuem fluxo de criação —
   a importação por link, PDF ou foto é de etapa posterior —, e por isso
   continuam vindo do conjunto de exemplo, visíveis só para a conta que o carrega.
4. **A frase do resumo do mês ainda é fixa** para a conta de exemplo. Para uma
   conta real, ela é derivada do defeito que mais se repete no mês. A versão
   interpretada chega com a etapa de análise.
5. **O SQL não é coberto por testes automatizados**, pela razão explicada na
   seção 6. A verificação é o roteiro no aparelho.
6. **Não há sincronização.** Tudo vive no aparelho. A fila de sincronização
   prevista em `docs/proposta.md` depende do servidor, que é de etapa posterior.
