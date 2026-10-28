-- Compañero de estudio con IA: límite de uso por usuario y por día, y caché de respuestas.
--
-- Modelo de seguridad: estas tablas solo las toca la Edge Function `companero` con la
-- service_role. Desde la app (anon / authenticated) no se puede leer ni escribir nada:
-- RLS activado, sin políticas y sin privilegios. Las conversaciones NO se guardan acá:
-- quedan en el teléfono del usuario.

create table public.companion_usage (
  user_id uuid not null,
  day     date not null,
  count   integer not null default 0 check (count >= 0),
  primary key (user_id, day)
);

alter table public.companion_usage enable row level security;
revoke all on public.companion_usage from anon, authenticated;

-- Respuestas a preguntas repetidas (solo primeras preguntas, sin historial).
-- key = sha256 de la pregunta normalizada: no se guarda quién preguntó.
create table public.companion_cache (
  key        text primary key check (key ~ '^[0-9a-f]{64}$'),
  response   jsonb not null,
  created_at timestamptz not null default now(),
  hits       integer not null default 0
);

alter table public.companion_cache enable row level security;
revoke all on public.companion_cache from anon, authenticated;

-- Suma un uso si no se pasó del límite. Devuelve cuántos le quedan hoy, o -1 si ya no hay.
-- Atómico: dos pedidos simultáneos no pueden pasar el límite.
create function public.companion_consume(p_user uuid, p_limit integer)
returns integer
language plpgsql security definer
set search_path = ''
as $$
declare
  used integer;
begin
  if p_user is null or p_limit is null or p_limit < 1 then
    return -1;
  end if;
  insert into public.companion_usage as u (user_id, day, count)
  values (p_user, (now() at time zone 'utc')::date, 1)
  on conflict (user_id, day) do update set count = u.count + 1
    where u.count < p_limit
  returning u.count into used;
  if used is null then
    return -1;
  end if;
  return p_limit - used;
end;
$$;

-- Devuelve un uso cuando la respuesta falló por un error nuestro (no del usuario).
create function public.companion_refund(p_user uuid)
returns void
language sql security definer
set search_path = ''
as $$
  update public.companion_usage set count = count - 1
  where user_id = p_user and day = (now() at time zone 'utc')::date and count > 0;
$$;

revoke all on function public.companion_consume(uuid, integer) from public, anon, authenticated;
revoke all on function public.companion_refund(uuid) from public, anon, authenticated;
grant execute on function public.companion_consume(uuid, integer) to service_role;
grant execute on function public.companion_refund(uuid) to service_role;
