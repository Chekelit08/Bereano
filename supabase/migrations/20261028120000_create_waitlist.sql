-- Lista de espera de la landing.
--
-- Modelo de seguridad:
--   * El cliente (rol anon) solo puede INSERTAR. No puede leer, editar ni borrar.
--   * Toda la validación vive en la base (CHECK). La del navegador es solo para UX.
--   * Para leer la lista se usa el dashboard de Supabase o la service_role desde un
--     entorno de servidor. Nunca desde la landing.

create table public.waitlist (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  -- Nulo cuando el email llega desde una puerta falsa (solo pedimos email).
  name        text,
  email       text not null,
  -- ISO 3166-1 alfa-2. 'ZZ' = "Otro país".
  country     text,
  -- De dónde vino: el formulario principal o una de las puertas falsas.
  source      text not null default 'landing',

  constraint waitlist_email_unique unique (email),
  -- Guardamos el email ya normalizado: así el UNIQUE evita duplicados como
  -- "Ana@Mail.com" y "ana@mail.com ".
  constraint waitlist_email_normalized check (email = lower(btrim(email))),
  constraint waitlist_email_format check (
    char_length(email) <= 254
    and email ~ '^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$'
  ),
  constraint waitlist_name_length check (
    name is null or (char_length(btrim(name)) between 1 and 80)
  ),
  constraint waitlist_country_format check (country is null or country ~ '^[A-Z]{2}$'),
  constraint waitlist_source_valid check (
    source in ('landing', 'puerta_companero', 'puerta_planes_tema', 'puerta_modo_grupo')
  )
);

comment on table public.waitlist is
  'Lista de espera de la landing. INSERT anónimo; sin SELECT/UPDATE/DELETE desde el cliente.';

-- RLS: sin políticas, nadie (salvo service_role / postgres) puede hacer nada.
alter table public.waitlist enable row level security;

-- Única política: insertar. No hay políticas de SELECT, UPDATE ni DELETE,
-- así que esas operaciones devuelven 0 filas o fallan para anon/authenticated.
-- La validación real está en los CHECK de arriba, por eso el WITH CHECK es true.
create policy "waitlist: insert anónimo"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (true);

-- Privilegios: Supabase por defecto da ALL a anon/authenticated sobre tablas nuevas
-- de public. Los recortamos para que, aunque alguien agregue una política por error,
-- el cliente siga sin poder leer ni modificar.
revoke all on table public.waitlist from anon, authenticated;
-- INSERT solo de estas columnas: el cliente no puede fijar id ni created_at.
grant insert (name, email, country, source) on table public.waitlist to anon, authenticated;
