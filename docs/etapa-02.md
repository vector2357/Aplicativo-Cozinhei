# Cozinhei — Etapa 02

**Disciplina:** Tecnologia e Construção de Software 2
**Etapa:** 02 — Implementação do protótipo de interface
**Autor:** Victor Hugo Resende Marinho
**Repositório:** https://github.com/vector2357/Aplicativo-Cozinhei
**Tag de entrega:** `etapa-02`

---

## 1. Telas implementadas

Implementei quatro telas, que juntas formam um caminho completo do login até a
porta de entrada do aplicativo.

| # | Tela | Rota | Arquivo |
| --- | --- | --- | --- |
| 01 | **Entrar** (tela inicial) | `/` | `src/app/index.tsx` |
| 02 | **Criar conta** | `/criar-conta` | `src/app/criar-conta.tsx` |
| 04 | **Entrando** | `/entrando` | `src/app/entrando.tsx` |
| 05 | **Início** | `/inicio` | `src/app/(tabs)/inicio.tsx` |

A numeração acompanha o inventário de 25 telas previsto na proposta, para que a
correspondência com as próximas etapas fique clara.

### O fluxo

```
   ┌──────────────────────────────────────────────┐
   │                                              │
   ▼                                              │
 ENTRAR  ◄──── segmento "entrar" ────  CRIAR CONTA
 ("/")   ───── segmento "criar conta" ──►
   │                                        │
   │  e-mail + senha válidos                │  cadastro válido
   │  ou conta Google escolhida             │
   ▼                                        ▼
                    ENTRANDO
                   ("/entrando")
                        │
       ┌── cancelar ────┴──── autenticado ────┐
       ▼                                      ▼
    ENTRAR                                 INÍCIO
                                         ("/inicio")
                                              │
                                    ┌─────────┴─────────┐
                                 barra de abas      botão (+)
                              histórico · pratos    "como registrar"
                                   · perfil
```

Além dessas quatro telas, há dois bottom sheets: a escolha de conta Google, que
aparece sobre o login e sobre o cadastro, e o "como registrar", que abre a
partir da barra de abas. As rotas `/historico`, `/pratos` e `/perfil` também
existem e mostram um marcador do que virá na etapa seguinte, de modo que a
navegação inteira já pode ser percorrida.

### Por que essas quatro

O enunciado pedia uma tela inicial e pelo menos três adicionais. Em vez de
escolher quatro telas isoladas ligadas por um menu, preferi as que precisam
existir primeiro e que formam um percurso real de ida e volta: entrar, alternar
para o cadastro, voltar, entrar por um provedor externo, cancelar o
carregamento e chegar ao início.

Cheguei a considerar o Histórico e a Execução em detalhe. As duas dependem de
dados que só passam a existir depois do registro de execução, previsto para a
etapa 03, e o resultado seriam listagens estáticas sem relação entre si.

---

## 2. Principais componentes de interface

### Reutilizáveis — `src/components/ui/`

São genéricos: nenhum deles sabe o que é uma execução ou um prato.

| Componente | Papel | Usado em |
| --- | --- | --- |
| `Tela` | moldura: área segura, cor de fundo e coluna de largura máxima | todas |
| `Botao` | ação em 4 variantes semânticas (`principal`, `secundaria`, `fantasma`, `contornoEscuro`) | todas |
| `Campo` | entrada de texto com rótulo, dica e estado de erro | 01, 02 |
| `SeletorSegmentado` | alternância entre duas opções exclusivas | 01, 02 |
| `Divisor` | separador com rótulo central ("ou") | 01, 02 |
| `BottomSheet` | painel modal ancorado no rodapé | sheets de 01, 02 e abas |
| `Chip` | rótulo de qualidade (oliva) ou defeito (vinho) | fichas de execução |
| `Estrelas` | nota em estrelas mais o valor numérico | fichas de execução |
| `Cartao` | superfície branca com borda hairline | base de cartões |
| `MidiaPlaceholder` | marcador listrado no lugar de foto ou vídeo | 05 |
| `MarcaGoogle` | marcador do provedor externo | 01, 02 |
| `TelaEmConstrucao` | marcador de rota ainda não implementada | abas |

### De domínio — `src/components/execucao/`

Estes conhecem o vocabulário do projeto: execução, tentativa, prato,
receita-guia.

| Componente | Papel |
| --- | --- |
| `CartaoExecucao` | ficha de execução, em duas variantes: `resumo` e `ficha`, esta com a calha numérica da tentativa e os chips de avaliação |
| `CartaoReceitaGuia` | cartão de receita-guia no carrossel horizontal |
| `CartaoResumoMes` | cartão escuro com execuções do mês, nota média e insight |

### Navegação e entrada

Em `src/components/navegacao/` ficam as peças da barra de abas: `BotaoAba`,
`IconeAba` (os quatro ícones desenhados em SVG, em contorno quando a aba está
inativa e sólidos quando selecionada), `BotaoRegistrar` e o sheet "como
registrar". A barra é composta em `src/app/(tabs)/_layout.tsx`.

Em `src/components/auth/` está o `SheetContaGoogle`, compartilhado entre o
login e o cadastro.

### A separação entre componentes e telas

As telas montam o layout, guardam o estado do formulário e decidem para onde
navegar. Nenhuma delas define aparência de botão, campo, chip ou cartão: isso
vive nos componentes, e as cores e medidas vêm todas de `src/theme`.

A regra de camada que segui é simples. `components/ui` não importa nada de
`features/`; quem conhece o domínio é `components/execucao`. Validação, sessão
e formatação ficam em `features/` e `utils/`, fora tanto das telas quanto dos
componentes. Na etapa 03 a validação deve ser reaproveitada pelo servidor, e é
essa separação que torna isso possível.

---

## 3. Elementos de entrada de dados

A entrada de dados se concentra nas telas de login e cadastro.

| Elemento | Onde | Detalhes |
| --- | --- | --- |
| Campo de e-mail | 01, 02 | teclado de e-mail, sem autocapitalização, `autoComplete="email"` |
| Campo de senha | 01, 02 | mascarado; `current-password` no login e `new-password` no cadastro |
| Campo de nome | 02 | autocapitalização por palavra |
| Seletor segmentado | 01, 02 | alterna entre entrar e criar conta |
| Caixa de aceite | 02 | termos de uso; alvo de 48pt, com papel de acessibilidade `checkbox` |
| Lista de contas | sheet Google | seleção de conta em bottom sheet |
| Botões de ação | todas | ação principal, secundária e links |

### Validação

As regras ficam em `src/features/auth/validacao.ts`, fora das telas:

- **Login:** e-mail obrigatório e com formato plausível, senha obrigatória.
- **Cadastro:** as mesmas regras, mais nome obrigatório, senha com no mínimo
  oito caracteres e aceite dos termos.

Quando alguma falha, a mensagem aparece logo abaixo do campo, em vinho, e a
navegação fica bloqueada até que o erro seja resolvido. Vinho é a cor que no
projeto significa sempre "algo deu errado". A mensagem tem papel `alert`, para
ser anunciada por leitores de tela.

---

## 4. Adaptação a diferentes tamanhos de tela

| Estratégia | Implementação | Motivo |
| --- | --- | --- |
| Área segura por borda | `SafeAreaView` com `edges` configuráveis, no componente `Tela` | notch, ilha dinâmica e barra de gestos |
| Coluna de largura máxima | `useLayoutResponsivo` limita o conteúdo a 520pt e centraliza | em tablet, esticar a ficha destruiria o alinhamento das colunas de nota e custo, que é o que torna a lista comparável |
| Detecção de tela curta | `compacta` quando a altura é menor que 720pt | encolhe os respiros verticais em vez de empurrar a ação principal para fora do alcance do polegar |
| Rolagem com crescimento | `ScrollView` com `flexGrow: 1` e um espaçador `flex: 1` | o botão desce ao fundo quando sobra altura, e a tela rola quando falta |
| Teclado | `KeyboardAvoidingView` nas telas de formulário | o teclado não cobre o campo em foco |
| Barra de abas | `useSafeAreaInsets` posiciona a barra flutuante | ela sobe acima da barra de gestos em qualquer aparelho |
| Layout fluido | `flex`, `gap` e percentuais, sem nenhuma largura fixa de tela | funciona de telefone pequeno a tablet |
| Texto | `numberOfLines` e `flex: 1` nos blocos de texto | nomes longos truncam em vez de quebrar o layout |

---

## 5. Instruções de execução

### Pré-requisitos

- Node.js 20 ou superior (desenvolvi com a 22.19.0)
- npm 10 ou superior
- Expo Go no celular, ou um emulador Android / simulador iOS

### Passos

```bash
git clone https://github.com/vector2357/Aplicativo-Cozinhei.git
cd Aplicativo-Cozinhei
npm install
npm start
```

O terminal mostra um QR Code: leia com o Expo Go no Android, ou com a câmera no
iOS. Para abrir direto num destino:

```bash
npm run android   # emulador ou aparelho Android
npm run ios       # simulador iOS (requer macOS)
npm run web       # navegador
```

### Verificação

```bash
npm run typecheck   # TypeScript, sem erros
npm test            # 72 testes automatizados
```

> O `.npmrc` na raiz fixa `legacy-peer-deps=true`, para resolver um conflito de
> peer dependency entre a versão de `react` que o Expo SDK 57 fixa e a que o
> `react-dom` exige. Sem ele, o `npm install` falha.

---

## 6. Principais decisões de interface

### A cor tem significado fixo

Vinho é sempre defeito. Oliva é sempre qualidade. Âmbar aparece em exatamente
três lugares: estrelas de nota, cronômetro em contagem e a ação principal da
tela. Bastaria usar uma dessas cores num quarto sentido para que a leitura do
aplicativo inteiro ficasse ambígua.

Disso decorre a regra de uma ação âmbar por tela: se duas parecem principais,
uma delas não é. A tela de Início não tem nenhuma, porque a ação âmbar dela é o
botão `+` da barra de abas.

### Todo dado quantitativo é monoespaçado

Nota, custo, tempo, número de tentativa e data usam DM Mono. A razão é
funcional: os numerais tabulares alinham verticalmente nas listas, e é esse
alinhamento que permite comparar execuções correndo o olho pela coluna. Toda a
formatação passa por helpers em `src/utils/formato.ts`, no padrão brasileiro.

### A ficha é numerada, e a foto vem em segundo plano

O que domina a ficha de execução é o número da tentativa, numa calha à
esquerda, junto com a nota. A miniatura tem entre 52 e 56pt e nunca é o
elemento principal.

Essa inversão é proposital. A numeração codifica a informação central do
produto, que é a repetição deliberada de um prato ao longo do tempo. Uma grade
de fotos grandes seria o padrão de qualquer aplicativo de comida e destruiria
justamente essa leitura.

### Tudo ao alcance do polegar

O aplicativo é usado com uma mão só, muitas vezes com as mãos ocupadas na
cozinha. Por isso as quatro abas ficam numa barra flutuante no rodapé, com o
botão de registrar sobreposto no centro, e toda escolha modal é um bottom
sheet, nunca um diálogo centralizado.

Pela mesma razão, 44pt é o piso de qualquer alvo tocável, incluindo links de
texto e botões de ícone. Onde o visual precisa ser menor, como no chip de
defeito, a área é ampliada com `hitSlop` ou padding, sem reduzir o alvo. Há
teste automatizado verificando isso em todas as variantes de botão.

### Carregar e "ainda não existe" são estados de verdade

A tela "Entrando" existe porque silêncio durante uma operação de rede parece
travamento. Ela diz o que está sendo trazido, em vez de um "aguarde" genérico,
e sempre oferece cancelar.

Pelo mesmo motivo, as abas de histórico, pratos e perfil são rotas reais que
mostram o que a tela vai conter e em que etapa. Uma aba que não responde ao
toque pareceria defeito, e com rotas de verdade a navegação inteira já pode ser
exercitada e testada.

### O texto da interface é todo em caixa baixa

"entrar", "criar minha conta", "histórico". A exceção são nomes próprios. É uma
escolha de tom: o aplicativo é um caderno pessoal, não um sistema.

---

## 7. Estrutura de diretórios

```
cozinhei/
├── app.json                  # configuração do Expo
├── babel.config.js
├── jest.config.js
├── tsconfig.json
├── .npmrc
│
├── docs/
│   ├── proposta.md           # etapa 01
│   └── etapa-02.md           # este documento
│
└── src/
    ├── app/                  # rotas (Expo Router)
    │   ├── _layout.tsx       # fontes, splash e sessão
    │   ├── index.tsx         # 01 · Entrar
    │   ├── criar-conta.tsx   # 02 · Criar conta
    │   ├── entrando.tsx      # 04 · Entrando
    │   └── (tabs)/
    │       ├── _layout.tsx   # barra de abas flutuante
    │       ├── inicio.tsx    # 05 · Início
    │       ├── historico.tsx
    │       ├── pratos.tsx
    │       └── perfil.tsx
    │
    ├── components/
    │   ├── ui/               # reutilizáveis, sem domínio
    │   ├── execucao/         # cartões de execução e receita-guia
    │   ├── navegacao/        # barra de abas: ícones, botões e estilos
    │   └── auth/             # sheet de conta Google
    │
    ├── features/
    │   ├── auth/             # sessão e validação
    │   └── execucoes/        # dados de exemplo
    │
    ├── hooks/                # layout responsivo
    ├── theme/                # cor, tipografia, espaçamento
    ├── types/                # tipos do domínio
    ├── utils/                # formatação brasileira
    └── __tests__/            # testes
```

A estrutura segue a que foi prevista na proposta (seção 13), com dois ajustes.

O primeiro é `src/app/(tabs)/inicio.tsx` no lugar de `index.tsx`. No Expo
Router os dois `index.tsx`, o do login e o das abas, colidiriam na rota `/`.
Manter o login em `/` deixa a tela inicial sendo literalmente a rota raiz, sem
depender de um redirecionamento que exigiria sessão persistida.

O segundo são as pastas `components/navegacao/` e `components/auth/`, que não
estavam previstas e agrupam peças que não são genéricas de interface nem de
domínio de execução.
