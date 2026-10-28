#!/usr/bin/env python3
"""Corrige la numeración de versículos de la RV1909 de eBible en los capítulos donde difiere.

Por qué: el archivo de eBible fuerza una grilla de versículos estándar, pero en 18 lugares la
edición de 1909 corta los capítulos como el texto hebreo. Resultado: versículos vacíos, capítulos
corridos un lugar y, al final, dos versículos fusionados en uno. Si un usuario cita Números 12:16
(la numeración que usa todo el mundo, la de la RVR1960), tiene que encontrar el texto correcto.

Cómo: para cada capítulo afectado se toma la numeración de referencia de bibliaparalela.com
(que publica la RV1909 con la numeración estándar) y se corta el texto DE EBIBLE en esos puntos,
alineando palabra por palabra con tolerancia a erratas sueltas (difflib). Nunca se copia texto de la referencia: solo se usa para saber
dónde empieza cada versículo. Al final se verifica que en cada capítulo el texto sea idéntico al
original, sin agregar ni perder una palabra.

Uso (una sola vez; el resultado queda commiteado en rv1909_versificacion.json):
    python3 supabase/data/align_rv1909.py ruta/a/spaRV1909_vpl.txt
"""

import difflib
import html
import json
import re
import sys
import time
import unicodedata
import urllib.request
from pathlib import Path

# Capítulos afectados (el del versículo vacío y el siguiente). Código USFM -> nombre en bibliaparalela.
AFFECTED = {
    'NUM': ('numbers', [12, 13, 29, 30]),
    '1SA': ('1_samuel', [23, 24]),
    '2SA': ('2_samuel', [20, 21]),
    '2CH': ('2_chronicles', [33, 34]),
    'JOB': ('job', [35, 36, 38, 39, 40, 41]),
    'HOS': ('hosea', [11, 12]),
    'JON': ('jonah', [1, 2]),
    'ACT': ('acts', [19, 20]),
    '2CO': ('2_corinthians', [13]),
}

VERSE_RE = re.compile(
    r'<span class="reftext"><a href="/[^/]+/(\d+)-(\d+)\.htm"><b>\d+</b></a></span>'
    r'<span class="maintext">(.*?)</span>',
    re.S,
)


def norm_word(w: str) -> str:
    """Palabra comparable: sin corchetes, puntuación, mayúsculas ni acentos
    (las ediciones difieren en cosas como "ó"/"O" o "CAZARÁS"/"CAZARAS")."""
    w = unicodedata.normalize('NFD', w.lower())
    return re.sub(r'[^a-z0-9ñ]', '', w.replace('n\u0303', 'ñ'))


def fetch_reference(slug: str, chapter: int) -> list[tuple[int, str]]:
    url = f'https://bibliaparalela.com/rv/{slug}/{chapter}.htm'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Bereano; alineación RV1909)'})
    page = urllib.request.urlopen(req, timeout=30).read().decode('utf-8', 'replace')
    out = []
    for c, v, raw in VERSE_RE.findall(page):
        if int(c) != chapter:
            continue
        text = html.unescape(re.sub(r'<[^>]+>', '', raw))
        text = re.sub(r'^\s*\([HG][\d:-]+\)\s*', '', text)  # marca de numeración hebrea (H) o griega (G)
        out.append((int(v), re.sub(r'\s+', ' ', text).strip()))
    if not out:
        sys.exit(f'No pude leer {url}')
    return out


def main(src: str) -> None:
    lines = Path(src).read_text(encoding='utf-8').splitlines()
    ebible = {}
    for line in lines:
        m = re.match(r'^([1-4A-Z]{3}) (\d+):(\d+) ?(.*)$', line)
        b, c, v, t = m.groups()
        ebible.setdefault((b, int(c)), []).append((int(v), t.strip()))

    corrections = {}
    diffs = []
    for book, (slug, chapters) in AFFECTED.items():
        # Todo el texto de eBible de los capítulos afectados, como una secuencia de palabras.
        stream = [w for c in chapters for _, t in ebible[(book, c)] for w in t.split()]
        # Todos los versículos de referencia, con el índice de su primera palabra.
        ref_words, starts = [], []
        for c in chapters:
            for v, ref_text in fetch_reference(slug, c):
                starts.append((c, v, len(ref_words)))
                ref_words.extend(ref_text.split())
            time.sleep(1)

        # Alineación tolerante: encuentra a qué palabra de eBible corresponde cada palabra de la
        # referencia aunque haya erratas sueltas en alguna de las dos ediciones.
        sm = difflib.SequenceMatcher(None, [norm_word(w) for w in ref_words], [norm_word(w) for w in stream], autojunk=False)
        ref_to_stream = {}
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag == 'equal':
                for k in range(i2 - i1):
                    ref_to_stream[i1 + k] = j1 + k
            else:
                diffs.append(f'{book}: referencia «{" ".join(ref_words[i1:i2])}» / eBible «{" ".join(stream[j1:j2])}»')
        if sm.ratio() < 0.97:
            print('\n'.join(d for d in diffs if d.startswith(book)))
            sys.exit(f'{book}: las ediciones difieren demasiado ({sm.ratio():.3f}); revisar a mano')

        cuts = []
        for c, v, i in starts:
            if i not in ref_to_stream:
                print('\n'.join(d for d in diffs if d.startswith(book)))
                sys.exit(f'{book} {c}:{v}: el inicio del versículo cae en una diferencia; revisar a mano')
            cuts.append((c, v, ref_to_stream[i]))
        cuts[0] = (cuts[0][0], cuts[0][1], 0)  # el primer versículo arranca al principio
        for n, (c, v, j) in enumerate(cuts):
            end = cuts[n + 1][2] if n + 1 < len(cuts) else len(stream)
            corrections.setdefault(f'{book} {c}', []).append([v, ' '.join(stream[j:end])])
        for c in chapters:
            print(f'{book} {c}: {len(corrections[f"{book} {c}"])} versículos')

        # Control final: mismo texto de eBible, solo cambia dónde empieza cada versículo.
        nuevo = ' '.join(t for c in chapters for _, t in corrections[f'{book} {c}']).split()
        assert stream == nuevo, f'{book}: el texto cambió al renumerar'

    print('Diferencias entre ediciones (se conserva siempre el texto de eBible):')
    for d in diffs:
        print('  ' + d)

    dest = Path(__file__).with_name('rv1909_versificacion.json')
    dest.write_text(json.dumps(corrections, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'{dest}: {len(corrections)} capítulos corregidos')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
