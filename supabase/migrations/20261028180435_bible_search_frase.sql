-- Búsqueda: primero los versículos que contienen la frase completa.
-- Antes "jehova es mi pastor" devolvía Ezequiel 34:2 (muchas veces "pastores") antes que
-- Salmos 23:1. Ahora la coincidencia exacta de la frase (sin acentos ni puntuación) va primero.
create or replace function public.bible_search(p_query text, p_version text default 'rv1909', p_limit int default 20)
returns table (book text, chapter smallint, verse smallint, text text, rank real)
language sql stable
set search_path = ''
as $$
  select b.name, v.chapter, v.verse, v.text,
         ts_rank(v.search, websearch_to_tsquery('spanish'::regconfig, public.bible_unaccent(p_query)))
         + case when position(public.bible_normalize(p_query) in public.bible_normalize(v.text)) > 0 then 1 else 0 end
  from public.bible_verses v
  join public.bible_books b on b.id = v.book_id
  where v.version_id = p_version
    and char_length(p_query) between 2 and 200
    and v.search @@ websearch_to_tsquery('spanish'::regconfig, public.bible_unaccent(p_query))
  order by 5 desc, v.book_id, v.chapter, v.verse
  limit least(greatest(coalesce(p_limit, 20), 1), 50)
$$;
