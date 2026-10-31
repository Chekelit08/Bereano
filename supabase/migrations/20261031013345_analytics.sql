-- Estadísticas de uso propias (sin servicios de terceros) y nuevos orígenes de email.
--
-- Modelo de seguridad:
--   * La app y la landing solo pueden INSERTAR eventos. Nadie puede leerlos desde el cliente.
--   * Los eventos son anónimos: un id aleatorio por dispositivo o visita (no el usuario de
--     Supabase), el nombre del evento, la pantalla y unos pocos datos sin información personal.
--   * El panel lee un resumen con analytics_summary(), que solo puede ejecutar la service_role
--     (desde la Edge Function `panel`, protegida con una clave propia).
--   * Límite por IP para que nadie llene la base: 600 eventos por hora.

-- 1. Nuevo origen de email: "Recibí el devocional en tu email" desde la app.
alter table public.waitlist drop constraint waitlist_source_valid;
alter table public.waitlist add constraint waitlist_source_valid check (
  source in ('landing', 'puerta_companero', 'puerta_planes_tema', 'puerta_modo_grupo', 'app_devocional_email')
);

-- 2. Eventos.
create table public.analytics_events (
  id      bigint generated always as identity primary key,
  at      timestamptz not null default now(),
  source  text not null check (source in ('app', 'landing')),
  name    text not null check (name ~ '^[a-z0-9_]{2,48}$'),
  screen  text check (screen is null or char_length(screen) <= 80),
  visitor uuid,
  props   jsonb not null default '{}'::jsonb
    check (jsonb_typeof(props) = 'object' and pg_column_size(props) <= 1024)
);

create index analytics_events_at_idx on public.analytics_events (at);
create index analytics_events_name_at_idx on public.analytics_events (name, at);

alter table public.analytics_events enable row level security;
revoke all on public.analytics_events from anon, authenticated;
grant insert (source, name, screen, visitor, props) on public.analytics_events to anon, authenticated;

create policy "eventos: insert anónimo" on public.analytics_events
  for insert to anon, authenticated
  with check (true);

-- 3. Límite por IP (mismo criterio que la lista de espera: solo cf-connecting-ip).
create table private.analytics_attempts (
  ip_hash    text not null,
  created_at timestamptz not null default now()
);
create index analytics_attempts_ip_time_idx on private.analytics_attempts (ip_hash, created_at);
alter table private.analytics_attempts enable row level security;

create function private.analytics_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  headers  json;
  hashed   text;
  attempts int;
begin
  headers := nullif(current_setting('request.headers', true), '')::json;
  if headers is null then
    return new;
  end if;
  hashed := encode(sha256(convert_to(
    coalesce(nullif(btrim(headers ->> 'cf-connecting-ip'), ''), 'sin-ip'), 'UTF8')), 'hex');

  -- Limpieza ocasional (1 de cada 50 inserts) para no recorrer la tabla en cada evento.
  if random() < 0.02 then
    delete from private.analytics_attempts where created_at < now() - interval '2 hours';
  end if;

  select count(*) into attempts
  from private.analytics_attempts
  where ip_hash = hashed and created_at > now() - interval '1 hour';

  if attempts >= 600 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  insert into private.analytics_attempts (ip_hash) values (hashed);
  return new;
end;
$$;

revoke all on function private.analytics_rate_limit() from public, anon, authenticated;

create trigger analytics_rate_limit
  before insert on public.analytics_events
  for each row execute function private.analytics_rate_limit();

-- 4. Resumen para el panel (solo service_role).
create function public.analytics_summary(p_days integer)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with params as (
    select greatest(1, least(coalesce(p_days, 30), 180)) as days
  ),
  ev as (
    select e.* from public.analytics_events e, params
    where e.at > now() - make_interval(days => params.days)
  ),
  wl as (
    select w.* from public.waitlist w, params
    where w.created_at > now() - make_interval(days => params.days)
  )
  select jsonb_build_object(
    'days', (select days from params),
    'totals', jsonb_build_object(
      'landing_visitors', (select count(distinct visitor) from ev where source = 'landing'),
      'app_visitors', (select count(distinct visitor) from ev where source = 'app'),
      'events', (select count(*) from ev),
      'emails', (select count(*) from wl),
      'emails_all_time', (select count(*) from public.waitlist)
    ),
    'daily', coalesce((
      select jsonb_agg(d order by d.day) from (
        select to_char(date_trunc('day', at), 'YYYY-MM-DD') as day,
               count(distinct visitor) filter (where source = 'landing') as landing,
               count(distinct visitor) filter (where source = 'app') as app
        from ev group by 1
      ) d
    ), '[]'::jsonb),
    'emails_daily', coalesce((
      select jsonb_agg(d order by d.day) from (
        select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day, count(*) as count
        from wl group by 1
      ) d
    ), '[]'::jsonb),
    'emails_by_source', coalesce((
      select jsonb_agg(d order by d.count desc) from (
        select source, count(*) as count from wl group by 1
      ) d
    ), '[]'::jsonb),
    'screens', coalesce((
      select jsonb_agg(d order by d.views desc) from (
        select screen, count(*) as views, count(distinct visitor) as visitors
        from ev where source = 'app' and name = 'screen_view' and screen is not null
        group by 1 order by 2 desc limit 20
      ) d
    ), '[]'::jsonb),
    'pages', coalesce((
      select jsonb_agg(d order by d.views desc) from (
        select screen as page, count(*) as views, count(distinct visitor) as visitors
        from ev where source = 'landing' and name = 'page_view'
        group by 1 order by 2 desc limit 10
      ) d
    ), '[]'::jsonb),
    'events_top', coalesce((
      select jsonb_agg(d order by d.count desc) from (
        select source, name, count(*) as count, count(distinct visitor) as visitors
        from ev where name not in ('screen_view', 'page_view')
        group by 1, 2 order by 3 desc limit 40
      ) d
    ), '[]'::jsonb),
    'funnel_app', (
      select jsonb_agg(jsonb_build_object('step', s.step, 'visitors',
        (select count(distinct visitor) from ev where source = 'app' and name = s.step)) order by s.ord)
      from (values (1, 'app_abierta'), (2, 'onboarding_fin'), (3, 'devocional_leido'),
                   (4, 'companero_pregunta'), (5, 'paywall_visto'), (6, 'compra_intento')) s(ord, step)
    ),
    'funnel_landing', (
      select jsonb_agg(jsonb_build_object('step', s.step, 'visitors',
        (select count(distinct visitor) from ev where source = 'landing' and name = s.step)) order by s.ord)
      from (values (1, 'page_view'), (2, 'waitlist_form_iniciado'), (3, 'waitlist_registro_ok')) s(ord, step)
    )
  );
$$;

revoke all on function public.analytics_summary(integer) from public, anon, authenticated;
grant execute on function public.analytics_summary(integer) to service_role;
