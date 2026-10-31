-- Estadísticas de uso: la app y la landing solo insertan; nadie lee desde el cliente.
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

set local role anon;
insert into public.analytics_events (source, name, screen, visitor, props)
values ('app', 'screen_view', '(tabs)/index', gen_random_uuid(), '{"platform":"ios"}'),
       ('landing', 'page_view', '/', gen_random_uuid(), '{}');
\echo 'ok   anon inserta eventos válidos'
select pg_temp.debe_fallar('nombre inválido', $q$insert into public.analytics_events (source, name) values ('app', 'Hola Mundo')$q$);
select pg_temp.debe_fallar('origen inventado', $q$insert into public.analytics_events (source, name) values ('otro', 'x_y')$q$);
select pg_temp.debe_fallar('props que no son objeto', $q$insert into public.analytics_events (source, name, props) values ('app', 'x_y', '[1,2]')$q$);
select pg_temp.debe_fallar('props gigantes', format($q$insert into public.analytics_events (source, name, props) values ('app', 'x_y', '{"a":"%s"}')$q$, repeat('x', 2000)));
select pg_temp.debe_fallar('fijar la fecha', $q$insert into public.analytics_events (source, name, at) values ('app', 'x_y', '2000-01-01')$q$);
select pg_temp.debe_fallar('anon: SELECT', 'select * from public.analytics_events');
select pg_temp.debe_fallar('anon: UPDATE', $q$update public.analytics_events set name = 'x_y'$q$);
select pg_temp.debe_fallar('anon: DELETE', 'delete from public.analytics_events');
select pg_temp.debe_fallar('anon: resumen del panel', 'select public.analytics_summary(30)');
reset role;

set local role authenticated;
insert into public.analytics_events (source, name) values ('app', 'devocional_leido');
select pg_temp.debe_fallar('authenticated: SELECT', 'select * from public.analytics_events');
select pg_temp.debe_fallar('authenticated: resumen del panel', 'select public.analytics_summary(30)');
reset role;

-- Email desde la app
set local role anon;
insert into public.waitlist (email, source) values ('app-email@test.com', 'app_devocional_email');
\echo 'ok   email desde la app (app_devocional_email)'
reset role;

-- Resumen (service_role)
set local role service_role;
do $$
declare s jsonb := public.analytics_summary(30);
begin
  if (s -> 'totals' ->> 'app_visitors')::int < 1 or (s -> 'totals' ->> 'landing_visitors')::int < 1 then
    raise exception 'FALLO: el resumen no cuenta visitantes: %', s -> 'totals';
  end if;
  if jsonb_array_length(s -> 'screens') < 1 or (s -> 'screens' -> 0 ->> 'screen') <> '(tabs)/index' then
    raise exception 'FALLO: pantallas mal contadas: %', s -> 'screens';
  end if;
  if jsonb_array_length(s -> 'funnel_app') <> 6 then
    raise exception 'FALLO: embudo de la app incompleto';
  end if;
end $$;
\echo 'ok   resumen del panel (service_role)'
reset role;

-- Límite por IP: 600 eventos por hora.
set local request.headers = '{"cf-connecting-ip": "203.0.113.50"}';
set local role anon;
insert into public.analytics_events (source, name) select 'app', 'carga' from generate_series(1, 600);
select pg_temp.debe_fallar('evento 601 desde la misma IP', $q$insert into public.analytics_events (source, name) values ('app', 'carga')$q$);
reset role;

\echo 'TODOS LOS TESTS PASARON'
rollback;
