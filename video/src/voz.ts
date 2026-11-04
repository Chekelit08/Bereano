// La voz de cada escena (Magnific, voz "Casilda Escudero", ElevenLabs v4) con las marcas de tiempo
// de cada palabra que devuelve Magnific. Las etiquetas de dirección ([warm voice]) no van.
export type Palabra = { t: string; s: number; e: number };
export type Toma = { audio: string; segundos: number; palabras: Palabra[] };

const w = (lista: [string, number, number][]): Palabra[] => lista.map(([t, s, e]) => ({ t, s, e }));

export const VOZ = {
  gancho: {
    audio: 'voz/escena-1.mp3',
    segundos: 6.35,
    palabras: w([
      ['¿Alguna', 0.08, 0.48], ['vez', 0.56, 0.72], ['empezaste', 0.8, 1.28], ['a', 1.36, 1.4], ['leer', 1.44, 1.6],
      ['la', 1.68, 1.76], ['Biblia…', 1.84, 2.44], ['y', 2.64, 2.72], ['a', 2.76, 2.8], ['los', 2.88, 2.96],
      ['pocos', 3.04, 3.28], ['días', 3.32, 3.52], ['lo', 3.56, 3.6], ['dejaste?', 3.68, 4.24],
      ['No', 4.96, 5.04], ['sos', 5.12, 5.36], ['el', 5.44, 5.52], ['único.', 5.6, 5.94],
    ]),
  },
  promesa: {
    audio: 'voz/escena-2.mp3',
    segundos: 5.41,
    palabras: w([
      ['Bereano', 0.15, 0.56], ['es', 0.64, 0.72], ['tu', 0.8, 0.88], ['compañero', 1.04, 1.6], ['para', 1.68, 1.84],
      ['leer', 1.92, 2.16], ['la', 2.2, 2.24], ['Biblia', 2.32, 2.8], ['cada', 2.91, 3.12], ['día…', 3.2, 3.8],
      ['y', 3.84, 3.92], ['entender', 4, 4.48], ['lo', 4.56, 4.64], ['que', 4.68, 4.72], ['leés.', 4.8, 5.22],
    ]),
  },
  devocional: {
    audio: 'voz/escena-3.mp3',
    segundos: 6.92,
    palabras: w([
      ['Cada', 0.25, 0.32], ['mañana,', 0.4, 1.12], ['un', 1.2, 1.28], ['devocional:', 1.36, 2.48], ['un', 2.56, 2.6],
      ['pasaje,', 2.64, 3.52], ['una', 3.6, 3.68], ['reflexión', 3.76, 4.24], ['corta,', 4.32, 4.96], ['y', 5, 5.04],
      ['una', 5.12, 5.2], ['pregunta', 5.36, 5.76], ['para', 5.84, 5.92], ['aplicar.', 6, 6.56],
    ]),
  },
  companero: {
    audio: 'voz/escena-4.mp3',
    segundos: 6.43,
    palabras: w([
      ['¿Algo', 0.16, 0.4], ['no', 0.48, 0.56], ['se', 0.6, 0.64], ['entiende?', 0.76, 1.4], ['Preguntale', 1.6, 2],
      ['al', 2.04, 2.08], ['compañero.', 2.2, 2.84], ['Te', 3.12, 3.2], ['responde', 3.28, 3.6], ['con', 3.64, 3.68],
      ['los', 3.76, 3.84], ['versículos,', 3.96, 4.6], ['verificados', 4.72, 5.28], ['en', 5.36, 5.4], ['la', 5.44, 5.52],
      ['Biblia.', 5.56, 6.04],
    ]),
  },
  planes: {
    audio: 'voz/escena-5.mp3',
    segundos: 7.16,
    palabras: w([
      ['Planes', 0.08, 0.4], ['de', 0.44, 0.48], ['lectura,', 0.64, 1.4], ['tu', 1.52, 1.6], ['racha,', 1.68, 2.4],
      ['oración', 2.56, 2.96], ['guiada…', 3.08, 3.88], ['y', 4.16, 4.24], ['la', 4.32, 4.4], ['Biblia', 4.44, 4.64],
      ['completa,', 4.72, 5.52], ['también', 5.56, 5.92], ['sin', 6, 6.16], ['conexión.', 6.24, 6.75],
    ]),
  },
  cierre: {
    audio: 'voz/escena-6.mp3',
    segundos: 6.61,
    palabras: w([
      ['Diez', 0.15, 0.24], ['minutos', 0.32, 0.64], ['por', 0.72, 0.8], ['día', 0.88, 1.04], ['alcanzan.', 1.12, 1.96],
      ['Leer', 2.16, 2.4], ['la', 2.44, 2.48], ['Biblia', 2.56, 2.96], ['es', 3.04, 3.12], ['gratis,', 3.2, 3.92],
      ['siempre.', 4.08, 4.76], ['Probá', 5.18, 5.28], ['Bereano', 5.32, 5.84], ['hoy.', 5.92, 6.28],
    ]),
  },
} satisfies Record<string, Toma>;

export type EscenaId = keyof typeof VOZ;
export const ORDEN: EscenaId[] = ['gancho', 'promesa', 'devocional', 'companero', 'planes', 'cierre'];
export const FPS = 30;
/** Aire después de cada frase; el cierre queda más tiempo con el logo. */
export const AIRE: Record<EscenaId, number> = { gancho: 0.35, promesa: 0.4, devocional: 0.3, companero: 0.4, planes: 0.3, cierre: 2.2 };
export const frames = (id: EscenaId) => Math.ceil((VOZ[id].segundos + AIRE[id]) * FPS);
export const TOTAL = ORDEN.reduce((a, id) => a + frames(id), 0);
