-- Revisión de seguridad (octubre 2026).
--
-- Límite de la lista de espera: la IP sale solo de `cf-connecting-ip`, que pone Cloudflare
-- (delante de Supabase) y el cliente no puede falsificar. `x-forwarded-for` sí se puede
-- inventar: antes, cambiándolo, un bot conseguía 30 altas nuevas por cada valor. Si el header
-- de Cloudflare falta, todos esos pedidos comparten un mismo cupo.

create or replace function private.waitlist_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  headers  json;
  ip       text;
  hashed   text;
  attempts int;
begin
  -- Sin headers HTTP (SQL directo, dashboard, scripts con service_role) no hay límite.
  headers := nullif(current_setting('request.headers', true), '')::json;
  if headers is null then
    return new;
  end if;
  ip := coalesce(nullif(btrim(headers ->> 'cf-connecting-ip'), ''), 'sin-ip');

  hashed := encode(sha256(convert_to(ip, 'UTF8')), 'hex');

  delete from private.waitlist_attempts where created_at < now() - interval '24 hours';

  select count(*) into attempts
  from private.waitlist_attempts
  where ip_hash = hashed and created_at > now() - interval '1 hour';

  if attempts >= 30 then
    raise exception 'rate_limited'
      using errcode = 'P0001', hint = 'Demasiadas altas desde la misma conexión. Probá más tarde.';
  end if;

  insert into private.waitlist_attempts (ip_hash) values (hashed);
  return new;
end;
$$;

revoke all on function private.waitlist_rate_limit() from public, anon, authenticated;
