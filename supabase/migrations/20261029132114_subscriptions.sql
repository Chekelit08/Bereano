-- Suscripción Bereano Plus (RevenueCat) y preguntas de regalo del compañero.
--
-- Modelo de seguridad:
-- - subscriptions la escribe SOLO el webhook de RevenueCat (Edge Function con service_role).
-- - Cada usuario puede LEER solo su fila: auth.uid() = user_id. Nunca "cualquier autenticado".
--   (Con login anónimo cada anónimo tiene su propio uid, así que la regla sigue siendo del dueño.)
-- - El servidor decide si alguien es Plus; la app solo muestra.

create table public.subscriptions (
  user_id     uuid primary key,
  entitlement text not null default 'plus' check (entitlement = 'plus'),
  expires_at  timestamptz,           -- null = sin vencimiento (compra de por vida)
  period_type text check (period_type in ('normal', 'trial', 'intro', 'prepaid')),
  store       text check (char_length(store) <= 40),
  event_ts    bigint not null,       -- marca de tiempo del evento: ignora eventos viejos fuera de orden
  updated_at  timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
revoke all on public.subscriptions from anon, authenticated;
grant select on public.subscriptions to authenticated;

create policy "solo el dueño lee su suscripción" on public.subscriptions
  for select to authenticated
  using (auth.uid() = user_id);

-- Aplica un evento de RevenueCat. Solo si es más nuevo que el último guardado.
create function public.subscription_apply(
  p_user uuid, p_expires timestamptz, p_period text, p_store text, p_event_ts bigint
) returns void
language sql security definer
set search_path = ''
as $$
  insert into public.subscriptions as s (user_id, expires_at, period_type, store, event_ts)
  values (p_user, p_expires, p_period, p_store, p_event_ts)
  on conflict (user_id) do update
    set expires_at = excluded.expires_at,
        period_type = excluded.period_type,
        store = excluded.store,
        event_ts = excluded.event_ts,
        updated_at = now()
    where s.event_ts <= excluded.event_ts;
$$;

-- ¿Tiene Plus activo ahora?
create function public.is_plus(p_user uuid) returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = p_user and (expires_at is null or expires_at > now())
  );
$$;

-- Preguntas de regalo (sin Plus): p_total en total, no por día. Devuelve cuántas quedan o -1.
create function public.companion_consume_free(p_user uuid, p_total integer)
returns integer
language plpgsql security definer
set search_path = ''
as $$
declare
  used integer;
begin
  if p_user is null or p_total is null or p_total < 1 then
    return -1;
  end if;
  -- Un pedido a la vez por usuario: dos simultáneos no pueden pasar el total.
  perform pg_advisory_xact_lock(hashtextextended(p_user::text, 0));
  select coalesce(sum(count), 0) into used from public.companion_usage where user_id = p_user;
  if used >= p_total then
    return -1;
  end if;
  insert into public.companion_usage as u (user_id, day, count)
  values (p_user, (now() at time zone 'utc')::date, 1)
  on conflict (user_id, day) do update set count = u.count + 1;
  return p_total - used - 1;
end;
$$;

revoke all on function public.subscription_apply(uuid, timestamptz, text, text, bigint) from public, anon, authenticated;
revoke all on function public.is_plus(uuid) from public, anon, authenticated;
revoke all on function public.companion_consume_free(uuid, integer) from public, anon, authenticated;
grant execute on function public.subscription_apply(uuid, timestamptz, text, text, bigint) to service_role;
grant execute on function public.is_plus(uuid) to service_role;
grant execute on function public.companion_consume_free(uuid, integer) to service_role;
