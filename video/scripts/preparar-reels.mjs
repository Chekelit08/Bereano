// Prepara los reels a partir de src/reels/guion.ts:
//   node --no-warnings scripts/preparar-reels.mjs textos   → imprime el texto de cada toma de voz
//   node --no-warnings scripts/preparar-reels.mjs alinear  → mide los audios de public/reels/<id>/<n>.mp3,
//        reparte cada palabra en el tiempo (por los silencios del audio) y escribe src/reels/generado.ts
// El texto de los versículos sale de la Biblia de la app (Reina-Valera 1909).
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

import { reference, verses } from '../../contenido/lib.mjs';
import { PASOS, REELS } from '../src/reels/guion.ts';

/** Texto del versículo como se ve y se lee: sin el título del salmo ni la letra hebrea. */
function textoVerso(c) {
  const t = verses(c.book, c.chapter, c.from, c.to ?? c.from)
    .join(' ')
    .replace(/^Salmo de David\.\s*/, '')
    .replace(/^[A-ZÑ]{2,}\.\s*/, '')
    .replace(/[,;:]$/, '…');
  return t;
}
const textoDe = (e) => (e.tipo === 'verso' ? textoVerso(e.cita) : e.texto);

function silencios(file) {
  const out = execFileSync('ffmpeg', ['-hide_banner', '-i', file, '-af', 'silencedetect=noise=-38dB:d=0.12', '-f', 'null', '-'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).toString();
  return out;
}
function medir(file) {
  const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString());
  let log = '';
  try {
    execFileSync('ffmpeg', ['-hide_banner', '-i', file, '-af', 'silencedetect=noise=-38dB:d=0.12', '-f', 'null', '-'], { stdio: ['ignore', 'ignore', 'pipe'] });
  } catch {}
  log = execFileSync('sh', ['-c', `ffmpeg -hide_banner -i "${file}" -af silencedetect=noise=-38dB:d=0.12 -f null - 2>&1 || true`]).toString();
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  // Tramos con voz = complemento de los silencios.
  const sil = starts.map((s, i) => [s, ends[i] ?? dur]);
  const voz = [];
  let t = 0;
  for (const [s, e] of sil) {
    if (s - t > 0.08) voz.push([t, s]);
    t = e;
  }
  if (dur - t > 0.08) voz.push([t, dur]);
  return { dur, voz };
}

/**
 * Cada frase (cortada en la puntuación) va a un tramo de voz entre silencios. Si hay más tramos
 * que frases, se juntan los separados por los silencios más cortos; si hay menos, se reparte todo
 * en proporción a las letras.
 */
function alinear(texto, voz) {
  const palabras = texto.split(/\s+/).filter(Boolean);
  const frases = [];
  let actual = [];
  for (const w of palabras) {
    actual.push(w);
    if (/[,;:.?!…]$/.test(w)) {
      frases.push(actual);
      actual = [];
    }
  }
  if (actual.length) frases.push(actual);
  const tramos = voz.map((t) => [...t]);
  while (tramos.length > frases.length) {
    let k = 0;
    for (let i = 1; i < tramos.length - 1; i++) if (tramos[i + 1][0] - tramos[i][1] < tramos[k + 1][0] - tramos[k][1]) k = i;
    tramos.splice(k, 2, [tramos[k][0], tramos[k + 1][1]]);
  }
  if (tramos.length !== frases.length) return proporcional(texto, voz);
  return frases.flatMap((f, i) => proporcional(f.join(' '), [tramos[i]]));
}

/** Reparte las palabras en los tramos con voz, en proporción a sus letras. */
function proporcional(texto, voz) {
  const palabras = texto.split(/\s+/).filter(Boolean);
  const peso = (w) => w.replace(/[^\p{L}\p{N}]/gu, '').length + 1;
  const total = palabras.reduce((a, w) => a + peso(w), 0);
  const largo = voz.reduce((a, [s, e]) => a + (e - s), 0);
  const out = [];
  let acc = 0;
  const pos = (x) => {
    // x en segundos "de voz" → tiempo real del audio
    let r = x;
    for (const [s, e] of voz) {
      if (r <= e - s) return s + r;
      r -= e - s;
    }
    return voz.at(-1)[1];
  };
  for (const w of palabras) {
    const a = (acc / total) * largo;
    acc += peso(w);
    const b = (acc / total) * largo;
    out.push({ t: w, s: +pos(a).toFixed(3), e: +pos(b).toFixed(3) });
  }
  return out;
}

const modo = process.argv[2];
if (modo === 'textos') {
  for (const r of REELS) r.escenas.forEach((e, i) => console.log(`${r.id}/${i + 1}\t${textoDe(e)}`));
} else if (modo === 'alinear') {
  const reels = REELS.map((r) => ({
    id: r.id,
    titulo: r.titulo,
    musicaDesde: r.musicaDesde,
    escenas: r.escenas.map((e, i) => {
      const audio = `reels/${r.id}/${i + 1}.mp3`;
      const { dur, voz } = medir(`public/${audio}`);
      const texto = textoDe(e);
      return {
        ...e,
        ...(e.tipo === 'verso' && { referencia: reference(e.cita.book, e.cita.chapter, e.cita.from, e.cita.to) }),
        ...(e.tipo === 'paso' && { pasos: PASOS, referencia: reference(e.cita.book, e.cita.chapter, e.cita.from, e.cita.to) }),
        audio,
        segundos: +dur.toFixed(3),
        palabras: alinear(texto, voz),
      };
    }),
  }));
  writeFileSync(
    'src/reels/generado.ts',
    `// Generado por scripts/preparar-reels.mjs. No editar a mano: cambiá src/reels/guion.ts.\nexport const REELS_LISTOS = ${JSON.stringify(reels, null, 2)} as const;\n`,
  );
  for (const r of REELS) {
    writeFileSync(`out/reels/${r.id}.txt`, `${r.posteo}\n\nLink en la bio.\n\n${r.hashtags.map((h) => '#' + h).join(' ')}\n`);
  }
  console.log('src/reels/generado.ts listo');
} else {
  console.log('Uso: preparar-reels.mjs textos | alinear');
}
