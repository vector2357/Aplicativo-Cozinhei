# Etapa 03 — Navegação, UX e Acessibilidade

Cozinhei é um diário pessoal de cozinha: o usuário registra o que ele mesmo
preparou e o app transforma esse histórico em informação sobre a própria
evolução.

Esta etapa fechou o fluxo de navegação do aplicativo. O que existia eram
quatro telas de entrada que desembocavam numa tela inicial; agora são dez
telas em três níveis, com retorno em todas elas, e o app é percorrível de
ponta a ponta.

---

## 1. Estrutura de navegação

A navegação tem três níveis, e cada um usa um mecanismo diferente porque
responde a uma pergunta diferente.

```
  /  entrar  ⇄  /criar-conta
       │
       └─ replace ─→  /entrando  ─ replace ─→  ┌─────────────────────────┐
                                               │   barra de abas         │
                                               │                         │
                                               │  /inicio   /historico   │
                                               │  /pratos   /perfil      │
                                               └───────────┬─────────────┘
                                                           │ push
                                          ┌────────────────┼────────────────┐
                                          │                │                │
                                    /prato/[id]    /execucao/[id]      /evolucao
```

**Nível 1 — entrada.** As telas de login e cadastro. Elas não fazem parte do
app autenticado e não têm barra de abas.

**Nível 2 — as quatro abas.** Destinos permanentes, sempre alcançáveis, cada
um preservando seu estado. Não têm botão de voltar porque não há de onde
voltar: trocar de aba é trocar de lugar, não avançar.

**Nível 3 — o detalhe.** Telas empilhadas sobre a aba de origem, que mostram
um item específico ou um painel derivado. Todas voltam.

A passagem do nível 1 para o nível 2 é feita com `replace`, e não com `push`.
A diferença importa: com `push`, o botão de voltar do Android ressuscitaria o
formulário de login depois de o usuário já estar dentro do app.

A guarda de sessão vive no layout das abas (`src/app/(tabs)/_layout.tsx`):
quem não está autenticado é redirecionado para o login antes de a tela chegar
a montar. Um link direto para `/inicio` não abre o app sem nunca ter havido
login.

---

## 2. Telas e como se chega a cada uma

| Tela | Rota | Como se chega | Como se volta |
| --- | --- | --- | --- |
| Entrar | `/` | abertura do app; sair da conta | — |
| Criar conta | `/criar-conta` | seletor no topo da tela de entrar | mesmo seletor |
| Entrando | `/entrando` | ao enviar o login | botão "cancelar" |
| Início | `/inicio` | após entrar; aba "início" | — (é aba) |
| Histórico | `/historico` | aba "histórico" | — (é aba) |
| Pratos | `/pratos` | aba "pratos" | — (é aba) |
| Perfil | `/perfil` | aba "perfil"; avatar no canto do início | — (é aba) |
| Prato | `/prato/[id]` | tocar um prato em "pratos" | seta, gesto de borda, botão do Android |
| Execução | `/execucao/[id]` | tocar uma ficha no histórico, no início ou dentro de um prato | seta, gesto de borda, botão do Android |
| Evolução | `/evolucao` | botão "ver sua evolução", no cartão do mês | seta, gesto de borda, botão do Android |

As capturas de todas elas estão em [`telas/`](telas/).

As duas rotas com `[id]` são dinâmicas: o mesmo arquivo atende qualquer
prato ou qualquer execução, e o identificador chega pela URL. É o que
permite que a mesma ficha seja aberta a partir de três lugares diferentes.

---

## 3. Mecanismos de navegação

**Barra de abas flutuante.** Quatro abas e o botão de registrar no centro.
Fica no rodapé, que é onde o polegar alcança sem reposicionar o aparelho — o
canto superior é a região mais cara de atingir numa tela grande. A aba ativa
é marcada por cor e por ícone preenchido, nunca só por cor.

**Botão `+` de registrar.** Centro da barra, em âmbar, maior que as abas. É a
ação principal do app inteiro, e a única ação em âmbar em qualquer tela com
barra de abas.

**Cabeçalho com voltar.** Toda tela empilhada tem um cabeçalho com seta de
retorno. A seta não é o único caminho: o gesto de arrastar da borda e o botão
de voltar do Android funcionam igualmente, e isso é deliberado — o canto
superior esquerdo é justamente o ponto mais difícil de alcançar com o polegar.

**Bottom sheet.** Usado para escolhas curtas que se resolvem em segundos:
escolher a conta Google, escolher como registrar uma execução. Um sheet fecha,
não volta — e por isso nada que exija navegação interna virou sheet.

A regra que separa os três: destino permanente é aba; detalhe de um item é
tela empilhada; escolha de três segundos é sheet.

---

## 4. Feedback visual

**Toque.** Todo controle responde imediatamente, com um mesmo valor de
opacidade em todo o app. Um botão que não responde é indistinguível de um app
travado, e o sintoma é o usuário tocar de novo.

**Carregamento.** As telas que dependem de dados mostram um esqueleto com a
forma do conteúdo que vai chegar, em vez de um círculo girando no meio do
nada. A tela de "entrando" mostra um anel animado e diz o que está trazendo.

**Estados de tela.** Toda tela de lista tem três estados construídos, não um:

- **vazio** — convida a agir e diz por que está vazio. Nunca "nenhum item encontrado";
- **carregando** — visível, com a forma do que vem;
- **erro** — diz o que aconteceu em linguagem direta e oferece uma saída.

**Aviso de rodapé.** Ações que acontecem e mudam de tela — sair da conta, por
exemplo — confirmam com uma barra no rodapé, que some sozinha e pode ser
fechada.

**Estados dos controles.** Botão desabilitado tem cor própria de fundo, texto
e borda, e não apenas transparência: transparência faz o controle parecer um
defeito de renderização.

**Validação de formulário.** O erro aparece sob o campo que o causou, em
vinho, com a borda do campo na mesma cor, e desaparece assim que o usuário
começa a corrigir.

---

## 5. Decisões de UX

**A ação principal fica onde o polegar chega.** Botões de confirmação na
metade inferior da tela; navegação no rodapé. A Lei de Fitts diz que o custo
de acertar um alvo cresce com a distância e cai com o tamanho — e o `+` é o
maior alvo do app justamente por ser a ação que o produto existe para receber.

**Alvos separados por espaço morto.** Não basta cada alvo ter 44pt: dois
alvos encostados erram, porque o dedo cobre mais área do que o ponto que a
pessoa mira. Há 8pt de folga entre abas vizinhas e 12pt em volta do `+`.

**Nenhum controle sem destino.** Um botão que responde ao toque e não faz
mais nada é pior que um botão ausente. Onde a tela ainda não existe, o
controle abre um aviso dizendo o que aquela tela vai fazer e em que etapa
chega.

**Os números são calculados, nunca escritos.** O cartão do mês conta as
execuções a partir dos dados. Número escrito à mão descola do conteúdo na
primeira alteração, e aí a tela passa a mentir.

**Conta nova começa vazia.** Quem acabou de se cadastrar vê os estados vazios
de verdade, com convite para o primeiro registro — e não os dados de exemplo
de outra pessoa.

**Texto em caixa baixa.** Títulos e botões em minúsculas, exceto nomes
próprios. O app é um diário pessoal, e caixa alta soa como formulário.

**Formatação brasileira em toda parte.** Nota `4,5`, dinheiro `R$ 12,80`,
data `19 ago`, tempo `1h05`. Nenhuma tela monta essas strings à mão.

---

## 6. Acessibilidade

**Contraste.** Todo texto fecha o mínimo de 4,5:1 da WCAG 2.1 AA contra o
fundo em que de fato aparece — medir contra branco quando o fundo é cinza
claro infla o número. Componentes não textuais, como a borda de uma caixa
marcável, fecham 3:1. Há um teste automatizado que calcula cada par de cores
usado no app e falha abaixo do piso: `src/__tests__/contraste.test.ts`.

**Tamanho dos alvos.** 44pt é o piso de qualquer elemento tocável, inclusive
links que parecem texto. Onde o visual precisa ser menor, a área de toque
cresce por folga, nunca o alvo encolhe. Medido no emulador: abas de 44×56dp,
botão de registrar de 62×62dp, campos de 52dp.

**Fonte ampliada do sistema.** O app funciona com a fonte em 200%. O texto
corrido cresce sem limite, porque é o principal recurso de quem enxerga
pouco. Onde a caixa não pode crescer junto — a calha do número da tentativa,
o rótulo de uma aba — a caixa cresce com a fonte, e só quando isso não basta
existe um teto.

**Leitores de tela.** Todo controle tem papel e nome, e o nome descreve a
consequência, não só o texto: o botão de voltar anuncia "voltar para a
lista". Cada ficha de execução é um único ponto de parada que carrega o
registro inteiro — prato, tentativa, data, nota, tempo, custo e os chips —
em vez de se fragmentar em várias paradas repetidas. Elementos decorativos
saem da leitura. Ao abrir uma tela empilhada, o foco vai para o título, que é
o que responde "onde eu estou".

**Cor nunca é o único sinal.** Chips de qualidade e de defeito têm cores
opostas, e para quem tem daltonismo de eixo vermelho-verde as duas são o
mesmo cinza. Por isso cada um também tem um símbolo: um tique e um alerta.

**Movimento.** As animações respeitam a opção "reduzir movimento" do sistema.

**Idioma declarado.** O aplicativo declara português do Brasil, para o leitor
de tela pronunciar o texto com as regras certas.

---

## 7. Como executar e testar a navegação

### Executar

```bash
npm install
npm run android      # ou: npm run ios
```

O app abre na tela de entrar. Qualquer e-mail válido e uma senha de 8
caracteres ou mais entram como a usuária de exemplo, com 21 execuções em 9
pratos. Criar uma conta nova entra com o histórico vazio.

### Roteiro de teste

**Navegar e voltar**

1. Entre. Toque em "histórico" e depois em qualquer ficha — abre a execução.
2. Volte pela seta, pelo gesto de arrastar da borda esquerda e pelo botão de
   voltar do Android. Os três funcionam.
3. Na aba "pratos", toque em "Bolo de cenoura" e depois numa das tentativas.
   Volte duas vezes: você retorna ao prato e depois à lista.
4. No início, toque em "ver sua evolução" e volte.
5. Troque de aba algumas vezes e aperte voltar: o app não retorna ao login.

**Feedback visual**

6. Segure qualquer botão: ele escurece enquanto pressionado.
7. Na tela de entrar, toque em "entrar" com os campos vazios: o erro aparece
   sob cada campo. Comece a digitar: o erro some.
8. No perfil, role até o fim e toque em "sair da conta": uma barra no rodapé
   confirma.

**Acessibilidade**

9. Aumente a fonte do sistema para o máximo (Ajustes → Tela → Tamanho da
   fonte) e percorra o histórico: nada é cortado e a barra de abas não muda.
10. Ligue o TalkBack e percorra o histórico deslizando: cada ficha é lida uma
    vez, com o registro completo.
11. Ainda com o TalkBack, abra uma ficha: o foco vai para o título da tela
    nova, e o voltar se anuncia dizendo para onde volta.

**Conta nova**

12. Saia e crie uma conta. As quatro abas mostram os estados vazios, cada um
    com um convite para registrar a primeira execução.

### Verificação automatizada

```bash
npm run typecheck
npm test
```

São **346 testes em 18 suítes**. Entre eles, uma varredura que percorre as
nove telas e falha se algum controle ficar sem nome, sem papel ou com alvo
menor que 44pt, e o cálculo de contraste de cada par de cores do app.
