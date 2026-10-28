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
