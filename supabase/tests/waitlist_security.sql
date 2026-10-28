-- Test de seguridad de la tabla waitlist. Correr SOLO contra una base local
-- (supabase start) después de aplicar las migraciones:
--   psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f supabase/tests/waitlist_security.sql
-- Todo corre dentro de una transacción que se deshace al final.
-- Esperado: 1 y 2 funcionan; del 3 al 12 dan ERROR.

\set ON_ERROR_ROLLBACK on
begin;
set local role anon;
\echo '1. insert válido (OK)'
insert into public.waitlist (name, email, country, source) values ('Ana', 'ana@test.com', 'AR', 'landing');
\echo '2. puerta falsa sin nombre (OK)'
insert into public.waitlist (email, source) values ('beto@test.com', 'puerta_companero');
\echo '3. duplicado (ERROR)'
insert into public.waitlist (name, email, country) values ('Ana', 'ana@test.com', 'AR');
\echo '4. email sin normalizar (ERROR)'
insert into public.waitlist (name, email, country) values ('Ana', 'Ana@Test.com', 'AR');
\echo '5. email inválido (ERROR)'
insert into public.waitlist (name, email, country) values ('X', 'no-es-email', 'AR');
\echo '6. país inválido (ERROR)'
insert into public.waitlist (name, email, country) values ('X', 'x@test.com', 'Argentina');
\echo '7. source inventado (ERROR)'
insert into public.waitlist (email, source) values ('y@test.com', 'hack');
\echo '8. nombre de 81 caracteres (ERROR)'
insert into public.waitlist (name, email) values (repeat('a', 81), 'z@test.com');
\echo '9. fijar created_at (ERROR)'
insert into public.waitlist (email, created_at) values ('w@test.com', '2000-01-01');
\echo '10. SELECT (ERROR)'
select * from public.waitlist;
\echo '11. UPDATE (ERROR)'
update public.waitlist set name = 'x';
\echo '12. DELETE (ERROR)'
delete from public.waitlist;
rollback;
