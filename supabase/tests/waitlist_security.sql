-- Test de seguridad de la tabla waitlist. Se verifica solo: si algo no se comporta
-- como esperamos, termina con ERROR y código de salida distinto de 0.
-- Todo corre en una transacción que se deshace al final: no deja datos.
--
-- Local (con `npx supabase start`):
--   psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -f supabase/tests/waitlist_security.sql
-- Sin Docker: ./supabase/tests/run-local.sh

\set ON_ERROR_STOP 1
begin;

-- Afirma que la sentencia falla. Si no falla, el test se corta.
create function pg_temp.debe_fallar(descripcion text, sentencia text) returns void
language plpgsql as $$
begin
  begin
    execute sentencia;
  exception when others then
    raise notice 'ok   (falla como se espera) %: %', descripcion, sqlerrm;
    return;
  end;
  raise exception 'FALLO: "%" debería haber fallado y no falló', descripcion;
end;
$$;
grant execute on function pg_temp.debe_fallar(text, text) to anon, authenticated;

set local role anon;

-- Lo que tiene que funcionar
insert into public.waitlist (name, email, country, source) values ('Ana', 'ana@test.com', 'AR', 'landing');
insert into public.waitlist (email, source) values ('beto@test.com', 'puerta_companero');
\echo 'ok   inserts válidos'

-- Validaciones
select pg_temp.debe_fallar('email duplicado', $q$insert into public.waitlist (name, email, country) values ('Ana', 'ana@test.com', 'AR')$q$);
select pg_temp.debe_fallar('email sin normalizar', $q$insert into public.waitlist (name, email, country) values ('Ana', 'Otra@Test.com', 'AR')$q$);
select pg_temp.debe_fallar('email inválido', $q$insert into public.waitlist (name, email, country) values ('X', 'no-es-email', 'AR')$q$);
select pg_temp.debe_fallar('email de más de 254 caracteres', format($q$insert into public.waitlist (email) values ('%s@test.com')$q$, repeat('a', 250)));
select pg_temp.debe_fallar('país inválido', $q$insert into public.waitlist (name, email, country) values ('X', 'x@test.com', 'Argentina')$q$);
select pg_temp.debe_fallar('source inventado', $q$insert into public.waitlist (email, source) values ('y@test.com', 'hack')$q$);
select pg_temp.debe_fallar('nombre de 81 caracteres', $q$insert into public.waitlist (name, email) values (repeat('a', 81), 'z@test.com')$q$);
select pg_temp.debe_fallar('nombre vacío', $q$insert into public.waitlist (name, email) values ('   ', 'z@test.com')$q$);

-- Permisos del cliente
select pg_temp.debe_fallar('fijar created_at', $q$insert into public.waitlist (email, created_at) values ('w@test.com', '2000-01-01')$q$);
select pg_temp.debe_fallar('anon: SELECT', 'select * from public.waitlist');
select pg_temp.debe_fallar('anon: UPDATE', $q$update public.waitlist set name = 'x'$q$);
select pg_temp.debe_fallar('anon: DELETE', 'delete from public.waitlist');
select pg_temp.debe_fallar('anon: leer private.waitlist_attempts', 'select * from private.waitlist_attempts');

reset role;
set local role authenticated;
select pg_temp.debe_fallar('authenticated: SELECT', 'select * from public.waitlist');
reset role;

-- Límite por IP: 30 altas por hora desde la misma IP; la 31 falla.
set local request.headers = '{"x-forwarded-for": "203.0.113.7, 10.0.0.1"}';
set local role anon;
insert into public.waitlist (email, source)
  select format('limite%s@test.com', i), 'landing' from generate_series(1, 30) as i;
\echo 'ok   30 altas desde la misma IP'
select pg_temp.debe_fallar('alta 31 desde la misma IP', $q$insert into public.waitlist (email) values ('limite31@test.com')$q$);
reset role;

-- Otra IP no se ve afectada
set local request.headers = '{"x-forwarded-for": "198.51.100.9"}';
set local role anon;
insert into public.waitlist (email) values ('otra-ip@test.com');
\echo 'ok   otra IP sigue pudiendo anotarse'
reset role;

-- No guardamos la IP en claro
do $$
begin
  if exists (select 1 from private.waitlist_attempts where ip_hash like '%203.0.113.7%') then
    raise exception 'FALLO: la IP quedó guardada en claro';
  end if;
end $$;
\echo 'ok   la IP se guarda hasheada'

\echo 'TODOS LOS TESTS PASARON'
rollback;
