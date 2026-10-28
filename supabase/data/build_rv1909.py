#!/usr/bin/env python3
"""Convierte la Reina-Valera 1909 de eBible.org al formato que carga Bereano.

Fuente: https://ebible.org/find/details.php?id=spaRV1909 (dominio público)
Archivo: https://ebible.org/Scriptures/spaRV1909_vpl.zip, de donde se usa spaRV1909_vpl.txt

Uso:
    python3 supabase/data/build_rv1909.py ruta/a/spaRV1909_vpl.txt

Genera supabase/data/rv1909.json con cada versículo como [libro, capítulo, versículo, texto].

Correcciones (no se toca el texto bíblico, solo artefactos de la edición digital e impresa):
  * Numeración: en 23 capítulos eBible corre los versículos (sigue el corte hebreo y deja 18
    versículos vacíos). Se reemplazan por los de rv1909_versificacion.json, generado por
    align_rv1909.py, que renumera sin agregar ni quitar una palabra.
  * Notas de cierre: 14 cartas traen al final la nota antigua "Fué escrita de Corinto…", que no es
    texto bíblico. Se sacan del versículo y quedan registradas en "colophons".
  * Se quitan los corchetes de las palabras que la edición original ponía en cursiva
    ("los que [estaban] en Tesalónica" -> "los que estaban en Tesalónica").
  * La primera palabra de cada capítulo viene en mayúsculas por la letra capital
    ("EN el principio", "Y DESPUÉS movió"); se pasa a minúsculas. Nunca se tocan mayúsculas
    legítimas como "ALEPH." (Salmo 119) o "MENE:" (Daniel 5).
  * La ortografía de 1909 ("fué", "á") se deja como está: es el texto auténtico.
"""

import hashlib
import json
import re
import sys
from pathlib import Path

# Orden canónico protestante (66 libros). Código USFM, nombre en español.
BOOKS = [
    ('GEN', 'Génesis'), ('EXO', 'Éxodo'), ('LEV', 'Levítico'), ('NUM', 'Números'),
    ('DEU', 'Deuteronomio'), ('JOS', 'Josué'), ('JDG', 'Jueces'), ('RUT', 'Rut'),
    ('1SA', '1 Samuel'), ('2SA', '2 Samuel'), ('1KI', '1 Reyes'), ('2KI', '2 Reyes'),
    ('1CH', '1 Crónicas'), ('2CH', '2 Crónicas'), ('EZR', 'Esdras'), ('NEH', 'Nehemías'),
    ('EST', 'Ester'), ('JOB', 'Job'), ('PSA', 'Salmos'), ('PRO', 'Proverbios'),
    ('ECC', 'Eclesiastés'), ('SNG', 'Cantares'), ('ISA', 'Isaías'), ('JER', 'Jeremías'),
    ('LAM', 'Lamentaciones'), ('EZK', 'Ezequiel'), ('DAN', 'Daniel'), ('HOS', 'Oseas'),
    ('JOL', 'Joel'), ('AMO', 'Amós'), ('OBA', 'Abdías'), ('JON', 'Jonás'),
    ('MIC', 'Miqueas'), ('NAM', 'Nahúm'), ('HAB', 'Habacuc'), ('ZEP', 'Sofonías'),
    ('HAG', 'Hageo'), ('ZEC', 'Zacarías'), ('MAL', 'Malaquías'),
    ('MAT', 'Mateo'), ('MRK', 'Marcos'), ('LUK', 'Lucas'), ('JHN', 'Juan'),
    ('ACT', 'Hechos'), ('ROM', 'Romanos'), ('1CO', '1 Corintios'), ('2CO', '2 Corintios'),
    ('GAL', 'Gálatas'), ('EPH', 'Efesios'), ('PHP', 'Filipenses'), ('COL', 'Colosenses'),
    ('1TH', '1 Tesalonicenses'), ('2TH', '2 Tesalonicenses'), ('1TI', '1 Timoteo'),
    ('2TI', '2 Timoteo'), ('TIT', 'Tito'), ('PHM', 'Filemón'), ('HEB', 'Hebreos'),
    ('JAS', 'Santiago'), ('1PE', '1 Pedro'), ('2PE', '2 Pedro'), ('1JN', '1 Juan'),
    ('2JN', '2 Juan'), ('3JN', '3 Juan'), ('JUD', 'Judas'), ('REV', 'Apocalipsis'),
]
# El archivo VPL de eBible usa los códigos de BibleWorks, en el mismo orden canónico.
VPL_CODES = (
    'GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SOL ISA '
    'JER LAM EZE DAN HOS JOE AMO OBA JON MIC NAH HAB ZEP HAG ZEC MAL MAT MAR LUK JOH ACT ROM 1CO '
    '2CO GAL EPH PHI COL 1TH 2TH 1TI 2TI TIT PHM HEB JAM 1PE 2PE 1JO 2JO 3JO JUD REV'
).split()
BOOK_NUMBER = {code: i for i, code in enumerate(VPL_CODES, start=1)}
assert len(BOOK_NUMBER) == len(BOOKS) == 66

# Cartas que terminan con una nota de cierre después del último "Amén." (código VPL).
COLOPHON_BOOKS = {'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHI', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB'}

# Letras capitales de dos palabras que las reglas no cubren (revisadas a mano).
TEXT_FIXES = {('PSA', 39, 1): [('Yo DIJE:', 'Yo dije:')]}

# Únicas capitales a mitad de capítulo ("HUBO en los días de Herodes").
SECTION_OPENERS = {('LUK', 1, 5)}

LINE = re.compile(r'^([1-4A-Z]{3}) (\d+):(\d+) ?(.*)$')
# Letra capital: la primera palabra del capítulo viene toda en mayúsculas. Puede venir después
# de "Y ", de "¿" o del encabezado hebreo del Salmo 119 ("ALEPH. "), y tiene que estar seguida de
# un espacio, coma, punto y coma o dos puntos (si sigue ".", son mayúsculas legítimas, como el
# "ALEPH." del Salmo 119; "MENE:" de Daniel 5 no abre capítulo, así que no se toca).
UPPER = 'A-ZÁÉÍÓÚÑÜÂÊÎÔÛ'
LEADING_CAPS = re.compile(rf'^((?:[{UPPER}]+\. )?[¿¡]?(?:[A-ZÁÉÍÓÚ] )?[¿¡]?)([{UPPER}]{{2,}})(?=[ ,;:])')


# Palabras que la heurística no resuelve sola (revisadas a mano): Job 27:1 y Job 35:1.
FORCE_LOWER = {'reasumió', 'procediendo'}

# Cuántas veces aparece cada palabra con mayúscula inicial y cuántas en minúscula, en toda la
# Biblia. Sirve para saber si "JEHOVÁ" o "DESPUÉS" es nombre propio ("Y Jehová", "Y después").
WORD_CASE: dict[str, list[int]] = {}


def learn_case(texts) -> None:
    for t in texts:
        # Se ignora la primera palabra de cada oración: ahí todo va con mayúscula.
        for prev, w in re.findall(r'(^|[.?!:;¿¡]\s*|\s)([A-Za-zÁÉÍÓÚÑÜÂÊÎÔÛáéíóúñüâêîôû]+)', t):
            if prev.strip() or prev == '' or (w.isupper() and len(w) > 1):
                continue
            counts = WORD_CASE.setdefault(w.lower(), [0, 0])
            counts[0 if w[0].isupper() else 1] += 1


AFTER_TITLE_CAPS = re.compile(rf'(?<=[.:] )((?:[A-ZÁÉÍÓÚ] )?[{UPPER}])([{UPPER}]+)(?=[ ,;:])')


def _fix_caps(m: re.Match) -> str:
    prefix, word = m.groups()
    lower = word.lower()
    if lower in FORCE_LOWER:
        proper = False
    elif lower in WORD_CASE:
        cap, low = WORD_CASE[lower]
        proper = cap > low
    else:
        # Palabra que no aparece en ningún otro lado: nombre propio ("Achab"), salvo que sea un
        # verbo con pronombre pegado ("Tornéme", "Acuérdate").
        proper = not re.search(r'(me|te|se|le|les|lo|los|la|las|nos|os)$', lower)
    # Después de "Y " u "O " va en minúscula ("Y después"), salvo nombres propios ("Y Jehová").
    if re.search(r'[A-ZÁÉÍÓÚ] $', prefix) and not prefix.endswith('. ') and not proper:
        return prefix + lower
    return prefix + word[0] + lower[1:]


def clean(text: str, starts_chapter: bool) -> str:
    text = text.replace('[', '').replace(']', '')
    if starts_chapter:
        text = LEADING_CAPS.sub(_fix_caps, text)
        # En los Salmos la letra capital va después del título ("Salmo de David. JEHOVÁ es mi
        # pastor"). Después de un punto siempre lleva mayúscula inicial: "Jehová", "Respóndeme".
        text = AFTER_TITLE_CAPS.sub(lambda m: _fix_caps(re.match(r'^(.*?)(\S+)$', m.group(0))), text, count=1)
    return re.sub(r'\s+', ' ', text).strip()


def main(src: str) -> None:
    raw = Path(src).read_bytes()
    corrections = json.loads(Path(__file__).with_name('rv1909_versificacion.json').read_text(encoding='utf-8'))

    # 1. Leer el archivo tal cual, por capítulo.
    chapters_src = {}
    for n, line in enumerate(raw.decode('utf-8').splitlines(), start=1):
        m = LINE.match(line)
        if not m:
            sys.exit(f'Línea {n} con formato inesperado: {line[:60]!r}')
        code, chapter, verse, text = m.groups()
        if code not in BOOK_NUMBER:
            sys.exit(f'Libro desconocido en la línea {n}: {code}')
        chapters_src.setdefault((code, int(chapter)), []).append([int(verse), text.strip()])

    # Textos que en la edición original abren un capítulo (llevan letra capital).
    chapter_openers = {rows[0][1] for rows in chapters_src.values() if rows[0][1]}

    # 2. Renumerar los capítulos afectados.
    for key, rows in corrections.items():
        code, chapter = key.split()
        chapters_src[(code, int(chapter))] = rows

    # 3. Notas de cierre de las cartas.
    colophons = []
    for code in COLOPHON_BOOKS:
        last_chapter = max(c for b, c in chapters_src if b == code)
        row = chapters_src[(code, last_chapter)][-1]
        i = row[1].rfind('Amén.')
        assert i > 0 and row[1][i + 5:].strip(), f'{code}: no encontré la nota de cierre'
        colophons.append([BOOK_NUMBER[code], last_chapter, row[0], row[1][i + 5:].strip().replace('[', '').replace(']', '')])
        row[1] = row[1][: i + 5]

    # 4. Limpieza y armado.
    learn_case(t for rows in chapters_src.values() for _, t in rows)
    verses = []
    for (code, chapter), rows in sorted(chapters_src.items(), key=lambda kv: (BOOK_NUMBER[kv[0][0]], kv[0][1])):
        for verse, text in rows:
            if not text:
                sys.exit(f'{code} {chapter}:{verse} quedó vacío')
            opener = verse == 1 or text in chapter_openers or (code, chapter, verse) in SECTION_OPENERS
            text = clean(text, opener)
            for old, new in TEXT_FIXES.get((code, chapter, verse), []):
                assert old in text, f'{code} {chapter}:{verse}: no encontré {old!r}'
                text = text.replace(old, new)
            verses.append([BOOK_NUMBER[code], chapter, verse, text])

    # Controles mínimos: si alguno falla, el archivo de origen cambió y hay que revisarlo.
    books_seen = {v[0] for v in verses}
    chapters = {(v[0], v[1]) for v in verses}
    assert len(books_seen) == 66, f'esperaba 66 libros, hay {len(books_seen)}'
    assert len(chapters) == 1189, f'esperaba 1189 capítulos, hay {len(chapters)}'
    assert len(verses) == 31102, f'esperaba 31102 versículos, hay {len(verses)}'
    assert len({(b, c, v) for b, c, v, _ in verses}) == len(verses), 'hay versículos repetidos'

    out = {
        'version': 'rv1909',
        'name': 'Reina-Valera 1909',
        'license': 'Dominio público',
        'source': 'https://ebible.org/Scriptures/spaRV1909_vpl.zip',
        'source_file_sha256': hashlib.sha256(raw).hexdigest(),
        'colophons': sorted(colophons),
        'verses': verses,
    }
    dest = Path(__file__).with_name('rv1909.json')
    dest.write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(f'{dest}: {len(verses)} versículos, {len(chapters)} capítulos, {len(books_seen)} libros')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
