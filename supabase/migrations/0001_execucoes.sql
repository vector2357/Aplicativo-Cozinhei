-- ---------------------------------------------------------------------------
-- Cozinhei — etapa 05
-- A tabela de execuções no Postgres, espelhando o esquema local da etapa 04.
--
-- Rode este arquivo uma vez no SQL Editor do painel do Supabase. O roteiro
-- está em docs/etapa-05.md.
-- ---------------------------------------------------------------------------

create table if not exists public.execucoes (
  id          text primary key,
  -- Quem é o dono. O default é o que permite o aplicativo inserir sem enviar
  -- o id: quem o preenche é o servidor, a partir do token.
  usuario_id  uuid not null references auth.users (id) on delete cascade
                default auth.uid(),
  prato_id    text not null,
  prato       text not null,
  mes         text not null,
  tentativa   text not null,
  data        text not null,
  tempo       text not null,
  custo       numeric not null,
  nota        numeric not null,
  -- Os chips são no máximo dois rótulos curtos e nenhuma consulta filtra por
  -- eles; `jsonb` guarda a mesma forma que o SQLite guarda como texto.
  chips       jsonb not null default '[]'::jsonb,
  -- `bigint` em milissegundos, igual ao local: é só o que ordena a lista, e
  -- um timestamp traria fuso para um campo que não é data de domínio.
  criado_em   bigint not null
);

-- A forma exata da única consulta de leitura.
create index if not exists execucoes_por_usuario
  on public.execucoes (usuario_id, criado_em desc);

-- ---------------------------------------------------------------------------
-- Isolamento por conta. Isto é o que substitui o `WHERE dono = ?` do SQLite:
-- lá o filtro é do cliente e depende de o aplicativo lembrar de aplicá-lo;
-- aqui é do banco, e um cliente adulterado não contorna.
-- ---------------------------------------------------------------------------

alter table public.execucoes enable row level security;

-- `authenticated` e não `public`: anônimo não lê nem escreve nada.
drop policy if exists "dono lê as próprias execuções" on public.execucoes;
create policy "dono lê as próprias execuções"
  on public.execucoes for select to authenticated
  using (auth.uid() = usuario_id);

-- `with check` barra inserir linha no nome de outra conta.
drop policy if exists "dono cria as próprias execuções" on public.execucoes;
create policy "dono cria as próprias execuções"
  on public.execucoes for insert to authenticated
  with check (auth.uid() = usuario_id);

-- Os dois juntos: `using` escolhe a linha, `with check` barra mudar de dono.
drop policy if exists "dono altera as próprias execuções" on public.execucoes;
create policy "dono altera as próprias execuções"
  on public.execucoes for update to authenticated
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

drop policy if exists "dono remove as próprias execuções" on public.execucoes;
create policy "dono remove as próprias execuções"
  on public.execucoes for delete to authenticated
  using (auth.uid() = usuario_id);
