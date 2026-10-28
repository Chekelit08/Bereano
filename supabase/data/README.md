# Texto bíblico

## Reina-Valera 1909 (`rv1909.json`)

- **Fuente:** eBible.org, [Santa Biblia — Reina Valera 1909](https://ebible.org/find/details.php?id=spaRV1909), archivo `spaRV1909_vpl.zip`. **Dominio público.**
- **Formato:** `{ version, name, license, source, source_file_sha256, colophons, verses }`, donde cada versículo es `[libro, capítulo, versículo, texto]`. El libro va del 1 (Génesis) al 66 (Apocalipsis), en el orden de `bible_books`.
- **Contenido:** 66 libros, 1.189 capítulos, 31.102 versículos, ninguno vacío.

### Qué se corrigió respecto del archivo original

El texto bíblico no se modifica: solo se arreglan errores de la edición digital o impresa.

1. **Numeración** (`rv1909_versificacion.json`, generado por `align_rv1909.py`). En 23 capítulos eBible sigue el corte de capítulos del hebreo y deja 18 versículos vacíos: capítulos corridos un lugar y dos versículos fusionados al final. Se renumeraron con la numeración estándar, la misma que la RVR1960, usando bibliaparalela.com solo como referencia de dónde empieza cada versículo. En cada capítulo se verificó que el texto de eBible quedara idéntico, sin agregar ni perder una palabra. Ejemplo: "Y después movió el pueblo de Haseroth" es Números 12:16 y no 13:1.
2. **Notas de cierre.** 14 cartas traían al final la nota antigua "Fué escrita de Corinto á los Romanos…", que no es texto bíblico. Se sacaron del versículo y quedan en `colophons`.
3. **Corchetes.** La edición original ponía en cursiva las palabras agregadas por los traductores; eBible las marca con corchetes, que se quitaron.
4. **Letra capital.** La primera palabra de cada capítulo venía en mayúsculas ("EN el principio", "Y DESPUÉS"); se pasó a minúsculas, respetando los nombres propios ("Y Jehová"). Las mayúsculas legítimas, como los encabezados hebreos del Salmo 119 ("ALEPH.") o "MENE, MENE, TEKEL", no se tocan.

La ortografía de 1909 ("fué", "á", "crió") se deja tal cual: es el texto auténtico.

### Regenerar

```bash
curl -LO https://ebible.org/Scriptures/spaRV1909_vpl.zip && unzip spaRV1909_vpl.zip -d rv1909
```

```bash
python3 supabase/data/build_rv1909.py rv1909/spaRV1909_vpl.txt
```

(`align_rv1909.py` ya se corrió; solo hace falta volver a correrlo si cambia el archivo de eBible.)

### Cargar

- **Local o CI:** `./supabase/tests/run-local.sh` aplica las migraciones, carga los datos con `load_bible.py` y corre los tests.
- **Producción:** se cargó una sola vez con la extensión `http` de Supabase, leyendo el JSON desde GitHub en un commit fijo. Después se borró la extensión. Ver `docs/decisiones.md`.

## Sumar otra versión (por ejemplo, la RVR1960 con licencia)

1. Insertar la versión en `bible_versions` (`id`, `name`, `license`).
2. Cargar sus versículos en `bible_verses` con ese `version_id`.
3. Los textos con licencia **no** se commitean a este repo, que es público: se cargan directo a la base.
