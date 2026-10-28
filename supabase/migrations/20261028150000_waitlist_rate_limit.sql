-- Límite anti-spam para la lista de espera: máximo 30 altas por IP por hora.
--
-- Por qué 30 y no 5: es común que un grupo entero se anote desde el mismo WiFi
-- (una iglesia, una célula). 30 por hora no molesta a un grupo real y frena a un
-- bot que intenta cargar miles de emails.
--
-- Privacidad: no guardamos la IP, solo su hash SHA-256, y los registros se borran
-- solos a las 24 horas.

create schema if not exists private;
-- El esquema `private` no está expuesto en la API: nadie del cliente puede tocarlo.
revoke all on schema private from public, anon, authenticated;

create table private.waitlist_attempts (
  ip_hash    text not null,
  created_at timestamptz not null default now()
);

create index waitlist_attempts_ip_time_idx on private.waitlist_attempts (ip_hash, created_at);
create index waitlist_attempts_time_idx on private.waitlist_attempts (created_at);

alter table private.waitlist_attempts enable row level security;

create function private.waitlist_rate_limit()
returns trigger
language plpgsql
-- Corre con los permisos del dueño (postgres) para poder escribir en `private`,
-- con search_path vacío para que nadie pueda inyectar funciones o tablas propias.
security definer
set search_path = ''
as $$
declare
  headers  json;
  ip       text;
  hashed   text;
  attempts int;
begin
  -- PostgREST expone los headers HTTP del pedido. Si no hay (SQL directo, dashboard,
  -- service_role desde un script), no aplicamos límite.
  headers := nullif(current_setting('request.headers', true), '')::json;
  ip := coalesce(headers ->> 'cf-connecting-ip', split_part(headers ->> 'x-forwarded-for', ',', 1));
  ip := nullif(btrim(ip), '');
  if ip is null then
    return new;
  end if;

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

create trigger waitlist_rate_limit
  before insert on public.waitlist
  for each row execute function private.waitlist_rate_limit();
