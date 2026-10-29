#!/usr/bin/env bash
# Aplica las migraciones en un Postgres de prueba y corre los tests de seguridad.
#
#   ./supabase/tests/run-local.sh                    # levanta un Postgres temporal (necesita initdb)
#   DATABASE_URL=postgres://... ./supabase/tests/run-local.sh   # usa una base vacía existente (CI)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TMP=""

cleanup() {
  if [[ -n "$TMP" ]]; then
    $AS_PG "$PGBIN/pg_ctl -D $TMP/data stop -m fast" >/dev/null 2>&1 || true
    rm -rf "$TMP"
  fi
}
trap cleanup EXIT

if [[ -z "${DATABASE_URL:-}" ]]; then
  PGBIN="$(dirname "$(command -v initdb 2>/dev/null || ls -d /usr/lib/postgresql/*/bin/initdb | tail -1)")"
  TMP="$(mktemp -d /var/tmp/bereano-pg.XXXXXX)"
  # initdb no corre como root: en ese caso usamos el usuario postgres.
  if [[ "$(id -u)" == "0" ]]; then
    chown postgres "$TMP"
    AS_PG="su postgres -c"
  else
    AS_PG="bash -c"
  fi
  $AS_PG "$PGBIN/initdb -D $TMP/data -A trust -U postgres" >/dev/null
  $AS_PG "$PGBIN/pg_ctl -D $TMP/data -o '-k $TMP -p 5499 -c listen_addresses=' -l $TMP/log -w start" >/dev/null
  DATABASE_URL="postgresql://postgres@/postgres?host=$TMP&port=5499"
fi

PSQL=(psql "$DATABASE_URL" -X -q -t -v ON_ERROR_STOP=1)

echo "== Roles de Supabase (simulados)"
"${PSQL[@]}" -f "$ROOT/supabase/tests/supabase_roles.sql"

for f in "$ROOT"/supabase/migrations/*.sql; do
  echo "== Migración $(basename "$f")"
  "${PSQL[@]}" -f "$f"
done

echo "== Datos: Reina-Valera 1909"
python3 "$ROOT/supabase/data/load_bible.py" "$DATABASE_URL"

for t in waitlist_security bible companion subscriptions security_audit; do
  echo "== Tests: $t"
  "${PSQL[@]}" -f "$ROOT/supabase/tests/$t.sql" 2>&1 | sed "s/^psql:[^ ]* NOTICE:  /   /" | grep -v "^ *$"
done
