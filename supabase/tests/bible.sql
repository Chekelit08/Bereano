-- Tests del texto bíblico. Se verifican solos: cualquier diferencia termina con ERROR.
-- Requiere las migraciones y los datos cargados (ver supabase/tests/run-local.sh).

\set ON_ERROR_STOP 1
begin;

create function pg_temp.esperar(descripcion text, ok boolean) returns void
language plpgsql as $$
begin
  if not coalesce(ok, false) then
    raise exception 'FALLO: %', descripcion;
  end if;
  raise notice 'ok   %', descripcion;
end;
$$;

create function pg_temp.debe_fallar(descripcion text, sentencia text) returns void
language plpgsql as $$
begin
  begin
    execute sentencia;
  exception when others then
    raise notice 'ok   (falla como se espera) %: %', descripcion, sqlerrm;
    return;
  end;
  raise exception 'FALLO: "%" debería haber fallado y no falló', descripcion;
end;
$$;
grant execute on function pg_temp.esperar(text, boolean), pg_temp.debe_fallar(text, text) to anon, authenticated;

-- Integridad de los datos
select pg_temp.esperar('66 libros', (select count(*) = 66 from public.bible_books));
select pg_temp.esperar('1189 capítulos en total', (select sum(chapters) = 1189 from public.bible_books));
select pg_temp.esperar('31102 versículos', (select count(*) = 31102 from public.bible_verses where version_id = 'rv1909'));
select pg_temp.esperar('cada libro tiene todos sus capítulos',
  (select bool_and(n = b.chapters) from public.bible_books b
     join (select book_id, count(distinct chapter) n from public.bible_verses group by book_id) x on x.book_id = b.id));
select pg_temp.esperar('ningún versículo vacío ni con corchetes',
  (select count(*) = 0 from public.bible_verses where text = '' or text like '%[%'));

-- Textos conocidos, palabra por palabra (verificados contra la RV1909)
select pg_temp.esperar('Hechos 17:11', (select text from public.bible_passage('ACT', 17, 11)) =
  'Y fueron éstos más nobles que los que estaban en Tesalónica, pues recibieron la palabra con toda solicitud, escudriñando cada día las Escrituras, si estas cosas eran así.');
select pg_temp.esperar('Mateo 5:5', (select text from public.bible_passage('Mateo', 5, 5)) =
  'Bienaventurados los mansos: porque ellos recibirán la tierra por heredad.');
select pg_temp.esperar('Génesis 1:1 sin la letra capital', (select text from public.bible_passage('GEN', 1, 1)) =
  'En el principio crió Dios los cielos y la tierra.');
-- Numeración corregida (eBible lo tenía en 13:1) y nota de cierre fuera del versículo
select pg_temp.esperar('Números 12:16 con la numeración estándar', (select text from public.bible_passage('NUM', 12, 16)) =
  'Y después movió el pueblo de Haseroth, y asentaron el campo en el desierto de Parán.');
select pg_temp.esperar('Romanos 16:27 sin la nota de cierre', (select text from public.bible_passage('ROM', 16, 27)) =
  'Al solo Dios sabio, sea gloria por Jesucristo para siempre. Amén.');
select pg_temp.esperar('pasaje de varios versículos', (select count(*) = 4 from public.bible_passage('Salmos', 23, 1, 4)));
select pg_temp.esperar('libro por nombre sin acento', (select count(*) = 1 from public.bible_passage('genesis', 1, 1)));

-- Búsqueda sin acentos
select pg_temp.esperar('buscar "mansos heredaran" encuentra Salmos 37:11',
  (select bool_or(book = 'Salmos' and chapter = 37 and verse = 11) from public.bible_search('mansos heredaran')));
select pg_temp.esperar('buscar "jehova es mi pastor" encuentra Salmos 23:1',
  (select bool_or(book = 'Salmos' and chapter = 23 and verse = 1) from public.bible_search('jehova es mi pastor')));
select pg_temp.esperar('la búsqueda devuelve como máximo 50', (select count(*) <= 50 from public.bible_search('dios', 'rv1909', 1000)));

-- Verificación de citas (para el compañero)
select pg_temp.esperar('cita correcta', public.bible_verify_quote('Mateo', 5, 5, 'recibirán la tierra por heredad'));
select pg_temp.esperar('cita sin acentos ni puntuación', public.bible_verify_quote('MAT', 5, 5, 'recibiran la tierra, por heredad'));
select pg_temp.esperar('cita inventada', not public.bible_verify_quote('Mateo', 5, 5, 'los mansos serán ricos'));
select pg_temp.esperar('versículo que no existe', not public.bible_verify_quote('Mateo', 5, 99, 'bienaventurados'));
select pg_temp.esperar('cita demasiado corta', not public.bible_verify_quote('Mateo', 5, 5, 'a'));

-- Permisos del cliente: leer sí, escribir no
set local role anon;
select pg_temp.esperar('anon puede leer versículos', (select count(*) > 0 from public.bible_verses limit 1));
select pg_temp.esperar('anon puede usar las funciones', (select count(*) = 1 from public.bible_passage('JHN', 3, 16)));
select pg_temp.debe_fallar('anon: INSERT', $q$insert into public.bible_verses (version_id, book_id, chapter, verse, text) values ('rv1909', 1, 1, 99, 'inventado')$q$);
select pg_temp.debe_fallar('anon: UPDATE', $q$update public.bible_verses set text = 'cambiado' where book_id = 1$q$);
select pg_temp.debe_fallar('anon: DELETE', 'delete from public.bible_verses');
select pg_temp.debe_fallar('anon: crear versión', $q$insert into public.bible_versions (id, name, license) values ('falsa', 'Falsa', 'x')$q$);
reset role;

\echo 'TODOS LOS TESTS DE LA BIBLIA PASARON'
rollback;
