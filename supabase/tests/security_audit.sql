-- Auditoría general: corre después de todas las migraciones y falla si algo se escapa de
-- las reglas de CLAUDE.md, aunque sea una tabla o función nueva que nadie testeó todavía.

\set ON_ERROR_STOP 1
begin;

-- 1. RLS activado en TODAS las tablas de public y private.
do $$
declare t text;
begin
  select string_agg(format('%I.%I', n.nspname, c.relname), ', ') into t
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where c.relkind in ('r', 'p') and n.nspname in ('public', 'private') and not c.relrowsecurity;
  if t is not null then
    raise exception 'FALLO: tablas sin RLS: %', t;
  end if;
end $$;
\echo 'ok   RLS activado en todas las tablas'

-- 2. Políticas abiertas (using/with check true) solo donde está pensado: lectura del texto
--    bíblico (dominio público) y el INSERT anónimo de la lista de espera.
do $$
declare t text;
begin
  select string_agg(format('%s.%s "%s"', schemaname, tablename, policyname), ', ') into t
  from pg_policies
  where schemaname in ('public', 'private')
    and (coalesce(qual, '') = 'true' or coalesce(with_check, '') = 'true')
    and not (tablename in ('bible_versions', 'bible_books', 'bible_verses') and cmd = 'SELECT')
    and not (tablename = 'waitlist' and cmd = 'INSERT');
  if t is not null then
    raise exception 'FALLO: políticas abiertas a todos: %', t;
  end if;
end $$;
\echo 'ok   ninguna política "todos pueden todo" fuera de la Biblia y la lista de espera'

-- 3. Ninguna política sobre datos de usuarios usa solo "authenticated" sin comparar el dueño
--    (con logins anónimos, cualquiera es authenticated).
do $$
declare t text;
begin
  select string_agg(format('%s.%s "%s"', schemaname, tablename, policyname), ', ') into t
  from pg_policies
  where schemaname in ('public', 'private')
    and 'authenticated' = any(roles)
    and tablename not in ('bible_versions', 'bible_books', 'bible_verses', 'waitlist')
    and coalesce(qual, '') || coalesce(with_check, '') not like '%auth.uid()%';
  if t is not null then
    raise exception 'FALLO: políticas para authenticated sin "solo el dueño": %', t;
  end if;
end $$;
\echo 'ok   las políticas de datos de usuarios son "solo el dueño"'

-- 4. Funciones que el cliente (anon/authenticated) puede ejecutar: solo las de la Biblia.
--    bible_unaccent y bible_normalize son puras y las usan las de búsqueda (SECURITY INVOKER),
--    por eso el cliente las necesita.
do $$
declare t text;
begin
  select string_agg(distinct p.proname, ', ') into t
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  cross join (values ('anon'), ('authenticated')) r(role)
  where n.nspname in ('public', 'private')
    and has_function_privilege(r.role, p.oid, 'execute')
    and p.proname not in ('bible_passage', 'bible_search', 'bible_verify_quote', 'bible_unaccent', 'bible_normalize');
  if t is not null then
    raise exception 'FALLO: funciones ejecutables desde el cliente: %', t;
  end if;
end $$;
\echo 'ok   el cliente solo puede ejecutar las funciones de la Biblia'

-- 5. Toda función SECURITY DEFINER fija search_path.
do $$
declare t text;
begin
  select string_agg(p.proname, ', ') into t
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('public', 'private') and p.prosecdef
    and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%');
  if t is not null then
    raise exception 'FALLO: SECURITY DEFINER sin search_path: %', t;
  end if;
end $$;
\echo 'ok   las funciones SECURITY DEFINER fijan search_path'

\echo 'TODOS LOS TESTS PASARON'
rollback;
