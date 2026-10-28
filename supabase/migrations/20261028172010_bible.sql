-- Texto bíblico: versiones, libros y versículos.
--
-- Modelo de seguridad: es texto de dominio público (hoy la Reina-Valera 1909), sin datos de
-- usuarios. Cualquiera puede LEERLO desde la app; nadie puede escribirlo desde el cliente.
-- (La regla "solo el dueño" del proyecto es para datos de usuarios; esto es contenido público.)
-- Los datos se cargan aparte, desde supabase/data/rv1909.json (ver supabase/data/README.md).

create schema if not exists extensions;
create extension if not exists unaccent with schema extensions;
-- En Supabase anon y authenticated ya pueden usar este esquema; se deja explícito para no
-- depender de un permiso implícito (las funciones de abajo usan unaccent desde la app).
grant usage on schema extensions to anon, authenticated;

-- Para buscar sin acentos ("jehova" encuentra "Jehová"). unaccent() no es IMMUTABLE, así que
-- se envuelve con el diccionario fijo: es el patrón recomendado para usarlo en índices.
create function public.bible_unaccent(text) returns text
language sql immutable parallel safe strict
set search_path = ''
as $$ select extensions.unaccent('extensions.unaccent'::regdictionary, $1) $$;

-- Texto comparable: sin acentos, sin puntuación, en minúsculas y con espacios simples.
create function public.bible_normalize(text) returns text
language sql immutable parallel safe strict
set search_path = ''
as $$ select btrim(regexp_replace(lower(public.bible_unaccent($1)), '[^a-z0-9ñ]+', ' ', 'g')) $$;

create table public.bible_versions (
  id         text primary key check (id ~ '^[a-z0-9]+$'),
  name       text not null,
  license    text not null,
  is_default boolean not null default false
);

create table public.bible_books (
  id        smallint primary key check (id between 1 and 66),
  code      text not null unique check (code ~ '^[1-3A-Z][A-Z0-9]{2}$'),  -- código USFM
  name      text not null unique,
  testament text not null check (testament in ('AT', 'NT')),
  chapters  smallint not null check (chapters > 0)
);

create table public.bible_verses (
  version_id text not null references public.bible_versions (id),
  book_id    smallint not null references public.bible_books (id),
  chapter    smallint not null check (chapter > 0),
  verse      smallint not null check (verse > 0),
  text       text not null check (char_length(text) > 0),
  search     tsvector generated always as (to_tsvector('spanish'::regconfig, public.bible_unaccent(text))) stored,
  primary key (version_id, book_id, chapter, verse)
);

create index bible_verses_search_idx on public.bible_verses using gin (search);

insert into public.bible_versions (id, name, license, is_default) values
  ('rv1909', 'Reina-Valera 1909', 'Dominio público', true);

insert into public.bible_books (id, code, name, testament, chapters) values
  (1, 'GEN', 'Génesis', 'AT', 50),
  (2, 'EXO', 'Éxodo', 'AT', 40),
  (3, 'LEV', 'Levítico', 'AT', 27),
  (4, 'NUM', 'Números', 'AT', 36),
  (5, 'DEU', 'Deuteronomio', 'AT', 34),
  (6, 'JOS', 'Josué', 'AT', 24),
  (7, 'JDG', 'Jueces', 'AT', 21),
  (8, 'RUT', 'Rut', 'AT', 4),
  (9, '1SA', '1 Samuel', 'AT', 31),
  (10, '2SA', '2 Samuel', 'AT', 24),
  (11, '1KI', '1 Reyes', 'AT', 22),
  (12, '2KI', '2 Reyes', 'AT', 25),
  (13, '1CH', '1 Crónicas', 'AT', 29),
  (14, '2CH', '2 Crónicas', 'AT', 36),
  (15, 'EZR', 'Esdras', 'AT', 10),
  (16, 'NEH', 'Nehemías', 'AT', 13),
  (17, 'EST', 'Ester', 'AT', 10),
  (18, 'JOB', 'Job', 'AT', 42),
  (19, 'PSA', 'Salmos', 'AT', 150),
  (20, 'PRO', 'Proverbios', 'AT', 31),
  (21, 'ECC', 'Eclesiastés', 'AT', 12),
  (22, 'SNG', 'Cantares', 'AT', 8),
  (23, 'ISA', 'Isaías', 'AT', 66),
  (24, 'JER', 'Jeremías', 'AT', 52),
  (25, 'LAM', 'Lamentaciones', 'AT', 5),
  (26, 'EZK', 'Ezequiel', 'AT', 48),
  (27, 'DAN', 'Daniel', 'AT', 12),
  (28, 'HOS', 'Oseas', 'AT', 14),
  (29, 'JOL', 'Joel', 'AT', 3),
  (30, 'AMO', 'Amós', 'AT', 9),
  (31, 'OBA', 'Abdías', 'AT', 1),
  (32, 'JON', 'Jonás', 'AT', 4),
  (33, 'MIC', 'Miqueas', 'AT', 7),
  (34, 'NAM', 'Nahúm', 'AT', 3),
  (35, 'HAB', 'Habacuc', 'AT', 3),
  (36, 'ZEP', 'Sofonías', 'AT', 3),
  (37, 'HAG', 'Hageo', 'AT', 2),
  (38, 'ZEC', 'Zacarías', 'AT', 14),
  (39, 'MAL', 'Malaquías', 'AT', 4),
  (40, 'MAT', 'Mateo', 'NT', 28),
  (41, 'MRK', 'Marcos', 'NT', 16),
  (42, 'LUK', 'Lucas', 'NT', 24),
  (43, 'JHN', 'Juan', 'NT', 21),
  (44, 'ACT', 'Hechos', 'NT', 28),
  (45, 'ROM', 'Romanos', 'NT', 16),
  (46, '1CO', '1 Corintios', 'NT', 16),
  (47, '2CO', '2 Corintios', 'NT', 13),
  (48, 'GAL', 'Gálatas', 'NT', 6),
  (49, 'EPH', 'Efesios', 'NT', 6),
  (50, 'PHP', 'Filipenses', 'NT', 4),
  (51, 'COL', 'Colosenses', 'NT', 4),
  (52, '1TH', '1 Tesalonicenses', 'NT', 5),
  (53, '2TH', '2 Tesalonicenses', 'NT', 3),
  (54, '1TI', '1 Timoteo', 'NT', 6),
  (55, '2TI', '2 Timoteo', 'NT', 4),
  (56, 'TIT', 'Tito', 'NT', 3),
  (57, 'PHM', 'Filemón', 'NT', 1),
  (58, 'HEB', 'Hebreos', 'NT', 13),
  (59, 'JAS', 'Santiago', 'NT', 5),
  (60, '1PE', '1 Pedro', 'NT', 5),
  (61, '2PE', '2 Pedro', 'NT', 3),
  (62, '1JN', '1 Juan', 'NT', 5),
  (63, '2JN', '2 Juan', 'NT', 1),
  (64, '3JN', '3 Juan', 'NT', 1),
  (65, 'JUD', 'Judas', 'NT', 1),
  (66, 'REV', 'Apocalipsis', 'NT', 22);

-- RLS: lectura pública, sin escritura desde el cliente.
alter table public.bible_versions enable row level security;
alter table public.bible_books enable row level security;
alter table public.bible_verses enable row level security;

create policy "bible_versions: lectura pública" on public.bible_versions for select to anon, authenticated using (true);
create policy "bible_books: lectura pública" on public.bible_books for select to anon, authenticated using (true);
create policy "bible_verses: lectura pública" on public.bible_verses for select to anon, authenticated using (true);

revoke all on table public.bible_versions, public.bible_books, public.bible_verses from anon, authenticated;
grant select on table public.bible_versions, public.bible_books, public.bible_verses to anon, authenticated;

-- Un pasaje: libro (código USFM o nombre), capítulo y rango de versículos.
create function public.bible_passage(
  p_book text,
  p_chapter int,
  p_verse_from int default 1,
  p_verse_to int default null,
  p_version text default 'rv1909'
) returns table (book text, chapter smallint, verse smallint, text text)
language sql stable
set search_path = ''
as $$
  select b.name, v.chapter, v.verse, v.text
  from public.bible_verses v
  join public.bible_books b on b.id = v.book_id
  where v.version_id = p_version
    and (b.code = upper(p_book) or public.bible_normalize(b.name) = public.bible_normalize(p_book))
    and v.chapter = p_chapter
    and v.verse between p_verse_from and coalesce(p_verse_to, p_verse_from)
  order by v.verse
  limit 200
$$;

-- Búsqueda de texto: "mansos heredaran", "jehova es mi pastor". Máximo 50 resultados.
create function public.bible_search(p_query text, p_version text default 'rv1909', p_limit int default 20)
returns table (book text, chapter smallint, verse smallint, text text, rank real)
language sql stable
set search_path = ''
as $$
  select b.name, v.chapter, v.verse, v.text,
         ts_rank(v.search, websearch_to_tsquery('spanish'::regconfig, public.bible_unaccent(p_query)))
  from public.bible_verses v
  join public.bible_books b on b.id = v.book_id
  where v.version_id = p_version
    and char_length(p_query) between 2 and 200
    and v.search @@ websearch_to_tsquery('spanish'::regconfig, public.bible_unaccent(p_query))
  order by 5 desc, v.book_id, v.chapter, v.verse
  limit least(greatest(coalesce(p_limit, 20), 1), 50)
$$;

-- Verificación de citas para el compañero: ¿el versículo existe y contiene esta cita?
-- Compara sin acentos, puntuación ni mayúsculas, así "recibirán la tierra por heredad"
-- coincide con Mateo 5:5 aunque el modelo cambie un signo. Devuelve false si no existe.
create function public.bible_verify_quote(
  p_book text,
  p_chapter int,
  p_verse int,
  p_quote text,
  p_version text default 'rv1909'
) returns boolean
language sql stable
set search_path = ''
as $$
  select coalesce(bool_or(
    char_length(public.bible_normalize(p_quote)) >= 3
    and position(public.bible_normalize(p_quote) in public.bible_normalize(v.text)) > 0
  ), false)
  from public.bible_verses v
  join public.bible_books b on b.id = v.book_id
  where v.version_id = p_version
    and (b.code = upper(p_book) or public.bible_normalize(b.name) = public.bible_normalize(p_book))
    and v.chapter = p_chapter
    and v.verse = p_verse
$$;

revoke all on function public.bible_passage(text, int, int, int, text) from public;
revoke all on function public.bible_search(text, text, int) from public;
revoke all on function public.bible_verify_quote(text, int, int, text, text) from public;
grant execute on function public.bible_passage(text, int, int, int, text) to anon, authenticated;
grant execute on function public.bible_search(text, text, int) to anon, authenticated;
grant execute on function public.bible_verify_quote(text, int, int, text, text) to anon, authenticated;
