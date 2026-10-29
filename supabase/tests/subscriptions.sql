-- Test de seguridad: suscripciones y preguntas de regalo. Se deshace al final.
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

-- Datos de prueba (como lo haría el webhook)
set local role service_role;
select public.subscription_apply('11111111-1111-1111-1111-111111111111', now() + interval '7 days', 'trial', 'APP_STORE', 100);
select public.subscription_apply('22222222-2222-2222-2222-222222222222', now() - interval '1 day', 'normal', 'PLAY_STORE', 100);
reset role;

-- Evento viejo fuera de orden: no pisa al nuevo
set local role service_role;
select public.subscription_apply('11111111-1111-1111-1111-111111111111', now() - interval '1 day', 'normal', 'APP_STORE', 50);
do $$
begin
  if not public.is_plus('11111111-1111-1111-1111-111111111111') then
    raise exception 'FALLO: un evento viejo pisó la suscripción';
  end if;
  if public.is_plus('22222222-2222-2222-2222-222222222222') then
    raise exception 'FALLO: una suscripción vencida cuenta como Plus';
  end if;
  if public.is_plus('33333333-3333-3333-3333-333333333333') then
    raise exception 'FALLO: alguien sin suscripción cuenta como Plus';
  end if;
  raise notice 'ok   is_plus: activa, vencida, inexistente y evento viejo';
end $$;
reset role;

-- El dueño ve solo su fila
set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
do $$
declare n integer;
begin
  select count(*) into n from public.subscriptions;
  if n <> 1 then raise exception 'FALLO: el usuario ve % filas, debería ver solo la suya', n; end if;
  raise notice 'ok   cada usuario ve solo su suscripción';
end $$;
select pg_temp.debe_fallar('authenticated se da Plus', $q$insert into public.subscriptions (user_id, event_ts) values ('11111111-1111-1111-1111-111111111111', 1)$q$);
select pg_temp.debe_fallar('authenticated se extiende la suscripción', $q$update public.subscriptions set expires_at = null$q$);
select pg_temp.debe_fallar('authenticated llama al webhook interno', $q$select public.subscription_apply('11111111-1111-1111-1111-111111111111', null, 'normal', 'x', 999)$q$);
select pg_temp.debe_fallar('authenticated pregunta is_plus', $q$select public.is_plus('11111111-1111-1111-1111-111111111111')$q$);
select pg_temp.debe_fallar('authenticated se suma preguntas de regalo', $q$select public.companion_consume_free('11111111-1111-1111-1111-111111111111', 99)$q$);
reset role;

set local role anon;
do $$
declare n integer;
begin
  select count(*) into n from public.subscriptions;
  raise exception 'FALLO: anon pudo leer subscriptions (% filas)', n;
exception when insufficient_privilege then
  raise notice 'ok   anon no puede leer subscriptions';
end $$;
reset role;

-- Preguntas de regalo: 3 en total, no por día
set local role service_role;
do $$
declare
  u uuid := gen_random_uuid();
  r integer;
begin
  r := public.companion_consume_free(u, 3);
  if r <> 2 then raise exception 'FALLO: primera de regalo debería dejar 2, dejó %', r; end if;
  -- Simula que las anteriores fueron otro día
  update public.companion_usage set day = day - 1 where user_id = u;
  r := public.companion_consume_free(u, 3);
  if r <> 1 then raise exception 'FALLO: segunda (otro día) debería dejar 1, dejó %', r; end if;
  r := public.companion_consume_free(u, 3);
  if r <> 0 then raise exception 'FALLO: tercera debería dejar 0, dejó %', r; end if;
  r := public.companion_consume_free(u, 3);
  if r <> -1 then raise exception 'FALLO: la cuarta debería bloquearse, dio %', r; end if;
  raise notice 'ok   preguntas de regalo: 3 en total aunque sean días distintos';
end $$;

rollback;
