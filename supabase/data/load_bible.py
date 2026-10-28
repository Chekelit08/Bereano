#!/usr/bin/env python3
"""Carga supabase/data/rv1909.json en una base local o de CI (no en producción).

Uso:
    python3 supabase/data/load_bible.py "postgresql://postgres@localhost:5432/postgres"

Usa COPY a través de psql, así no hace falta instalar ningún paquete de Python.
Producción se carga una sola vez desde el SQL de supabase/data/README.md.
"""

import json
import subprocess
import sys
from pathlib import Path


def tsv_escape(text: str) -> str:
    return text.replace('\\', '\\\\').replace('\t', '\\t').replace('\n', '\\n')


def main(database_url: str) -> None:
    data = json.loads(Path(__file__).with_name('rv1909.json').read_text(encoding='utf-8'))
    rows = ''.join(
        f"{data['version']}\t{b}\t{c}\t{v}\t{tsv_escape(t)}\n" for b, c, v, t in data['verses']
    )
    copy = r'\copy public.bible_verses (version_id, book_id, chapter, verse, text) from stdin'
    subprocess.run(
        ['psql', database_url, '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-c', copy],
        input=rows.encode('utf-8'),
        check=True,
    )
    print(f"{len(data['verses'])} versículos cargados ({data['name']})")


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
