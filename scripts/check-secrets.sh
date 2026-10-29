#!/usr/bin/env bash
# Busca claves secretas en todos los archivos del repo (lo que está en git).
# Corre en la CI y se puede correr local: ./scripts/check-secrets.sh
set -euo pipefail
cd "$(dirname "$0")/.."

PATTERNS=(
  'eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}'   # JWT (por ejemplo, la service_role vieja)
  'sk-ant-[A-Za-z0-9_-]{10,}'                       # Anthropic
  'sb_secret_[A-Za-z0-9_-]{10,}'                    # Supabase (clave secreta nueva)
  'sk_[A-Za-z0-9]{20,}'                             # RevenueCat (clave secreta)
  'phx_[A-Za-z0-9]{20,}'                            # PostHog (clave personal)
  '-----BEGIN [A-Z ]*PRIVATE KEY-----'              # claves privadas (Apple, Google)
)

found=0
for p in "${PATTERNS[@]}"; do
  if git ls-files -z -- . ':!:*package-lock.json' ':!:app/src/data/bible/**' ':!:supabase/data/*.json' |
    xargs -0 grep -IlE -e "$p" -- 2>/dev/null; then
    echo "::error::Posible clave secreta (patrón: $p)"
    found=1
  fi
done
[[ $found == 0 ]] && echo "ok   no hay claves secretas en el repo"
exit $found
