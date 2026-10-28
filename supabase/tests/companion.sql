-- Test de seguridad del compañero: límite diario y caché solo para la Edge Function.
-- Corre en una transacción que se deshace al final.
\set ON_ERROR_STOP 1
begin;

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
grant execute on function pg_temp.debe_fallar(text, text) to anon, authenticated;

-- Desde la app no se puede tocar nada
do $$
declare r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    execute format('set local role %I', r);
    perform pg_temp.debe_fallar(r || ' lee el uso', 'select * from public.companion_usage');
    perform pg_temp.debe_fallar(r || ' escribe el uso', $q$insert into public.companion_usage (user_id, day, count) values (gen_random_uuid(), current_date, 0)$q$);
    perform pg_temp.debe_fallar(r || ' lee la caché', 'select * from public.companion_cache');
    perform pg_temp.debe_fallar(r || ' escribe la caché', $q$insert into public.companion_cache (key, response) values (repeat('a', 64), '{}')$q$);
    perform pg_temp.debe_fallar(r || ' se suma usos', 'select public.companion_consume(gen_random_uuid(), 1000)');
    perform pg_temp.debe_fallar(r || ' se devuelve usos', 'select public.companion_refund(gen_random_uuid())');
    reset role;
  end loop;
end $$;

-- RLS activado en las dos tablas
do $$
begin
  if exists (
    select 1 from pg_class
    where relname in ('companion_usage', 'companion_cache') and relnamespace = 'public'::regnamespace
      and not relrowsecurity
  ) then
    raise exception 'FALLO: hay una tabla del compañero sin RLS';
  end if;
  raise notice 'ok   RLS activado en companion_usage y companion_cache';
end $$;

-- La Edge Function (service_role) respeta el límite
set local role service_role;
do $$
declare
  u uuid := gen_random_uuid();
  r integer;
begin
  r := public.companion_consume(u, 3);
  if r <> 2 then raise exception 'FALLO: primer uso debería dejar 2, dejó %', r; end if;
  perform public.companion_consume(u, 3);
  r := public.companion_consume(u, 3);
  if r <> 0 then raise exception 'FALLO: tercer uso debería dejar 0, dejó %', r; end if;
  r := public.companion_consume(u, 3);
  if r <> -1 then raise exception 'FALLO: cuarto uso debería estar bloqueado, dio %', r; end if;
  perform public.companion_refund(u);
  r := public.companion_consume(u, 3);
  if r <> 0 then raise exception 'FALLO: después de devolver uno debería quedar 0, dio %', r; end if;
  if public.companion_consume(null, 3) <> -1 or public.companion_consume(u, 0) <> -1 then
    raise exception 'FALLO: parámetros inválidos deberían bloquear';
  end if;
  raise notice 'ok   límite diario: 3 usos, el cuarto se bloquea, devolución funciona';
end $$;

insert into public.companion_cache (key, response) values (repeat('b', 64), '{"answer": "x"}');
select pg_temp.debe_fallar('clave de caché inválida', $q$insert into public.companion_cache (key, response) values ('hola', '{}')$q$);
\echo 'ok   la Edge Function usa la caché'

rollback;
