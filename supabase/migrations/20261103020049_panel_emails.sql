-- Panel de uso: lista de emails de la lista de espera.
--
-- Solo la service_role puede ejecutarla (desde la Edge Function `panel`, protegida con
-- PANEL_TOKEN). Desde la app o la landing nadie puede leer emails: la tabla sigue sin SELECT.

create function public.analytics_emails(p_limit integer)
returns table (email text, name text, country text, source text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select w.email, w.name, w.country, w.source, w.created_at
  from public.waitlist w
  order by w.created_at desc
  limit greatest(1, least(coalesce(p_limit, 500), 2000));
$$;

revoke all on function public.analytics_emails(integer) from public, anon, authenticated;
grant execute on function public.analytics_emails(integer) to service_role;
