-- Simula los roles y privilegios por defecto de Supabase en un Postgres "pelado".
-- Solo para tests (CI o run-local.sh). NO correr en un proyecto real de Supabase.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
grant usage on schema public to anon, authenticated, service_role;
-- Supabase da todos los privilegios sobre tablas nuevas de public a estos roles:
-- reproducirlo es clave para comprobar que nuestros REVOKE funcionan.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
-- auth.uid() como en Supabase: el usuario sale del JWT (acá, de un setting).
create schema if not exists auth;
grant usage on schema auth to anon, authenticated, service_role;
create function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
