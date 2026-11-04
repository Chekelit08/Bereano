// La voz de cada escena (Magnific, voz "Casilda Escudero", ElevenLabs v4) con las marcas de tiempo
// de cada palabra que devuelve Magnific. Las etiquetas de dirección ([warm voice]) no van.
export type Palabra = { t: string; s: number; e: number };
export type Toma = { audio: string; segundos: number; palabras: Palabra[] };

const w = (lista: [string, number, number][]): Palabra[] => lista.map(([t, s, e]) => ({ t, s, e }));

export const VOZ = {
  gancho: {
    audio: 'voz/escena-1.mp3',
    segundos: 5.96,
    palabras: w([
      ['¿Alguna', 0.08, 0.32],
      ['vez', 0.4, 0.56],
      ['empezaste', 0.64, 1.12],
      ['a', 1.15, 1.17],
      ['leer', 1.2, 1.36],
      ['la', 1.44, 1.52],
      ['Biblia…', 1.56, 2.16],
      ['y', 2.32, 2.4],
      ['a', 2.44, 2.48],
      ['los', 2.6, 2.72],
      ['pocos', 2.8, 2.96],
      ['días', 3.04, 3.2],
      ['lo', 3.28, 3.32],
      ['dejaste?', 3.36, 4.12],
      ['¡No', 4.47, 4.56],
      ['sos', 4.72, 4.96],
      ['el', 5.04, 5.12],
      ['único!', 5.2, 5.6],
    ]),
  },
  promesa: {
    audio: 'voz/escena-2.mp3',
    segundos: 4.99,
    palabras: w([
      ['¡Bereano', 0.08, 0.48],
      ['es', 0.52, 0.56],
      ['tu', 0.6, 0.64],
      ['compañero', 0.72, 1.2],
      ['para', 1.28, 1.44],
      ['leer', 1.52, 1.68],
      ['la', 1.76, 1.84],
      ['Biblia', 1.88, 2.32],
      ['cada', 2.4, 2.64],
      ['día…', 2.72, 3.39],
      ['y', 3.41, 3.44],
      ['entender', 3.52, 4],
      ['lo', 4.08, 4.16],
      ['que', 4.2, 4.24],
      ['leés!', 4.36, 4.76],
    ]),
  },
  devocional: {
    audio: 'voz/escena-3.mp3',
    segundos: 6.03,
    palabras: w([
      ['Cada', 0.07, 0.16],
      ['mañana,', 0.24, 0.76],
      ['un', 0.88, 1.04],
      ['devocional:', 1.12, 2],
      ['un', 2.08, 2.16],
      ['pasaje,', 2.32, 2.88],
      ['una', 2.96, 3.04],
      ['reflexión', 3.12, 3.6],
      ['corta,', 3.68, 4.12],
      ['¡y', 4.24, 4.32],
      ['una', 4.4, 4.56],
      ['pregunta', 4.64, 4.96],
      ['para', 5.04, 5.12],
      ['aplicar!', 5.16, 5.68],
    ]),
  },
  companero: {
    audio: 'voz/escena-4.mp3',
    segundos: 6.11,
    palabras: w([
      ['¿Algo', 0.07, 0.24],
      ['no', 0.28, 0.32],
      ['se', 0.4, 0.44],
      ['entiende?', 0.48, 1.12],
      ['¡Preguntale', 1.28, 1.68],
      ['al', 1.72, 1.76],
      ['compañero!', 1.84, 2.6],
      ['Te', 2.87, 2.88],
      ['responde', 2.96, 3.36],
      ['con', 3.4, 3.44],
      ['los', 3.52, 3.6],
      ['versículos,', 3.72, 4.36],
      ['verificados', 4.48, 5.12],
      ['en', 5.16, 5.2],
      ['la', 5.28, 5.36],
      ['Biblia.', 5.4, 5.88],
    ]),
  },
  planes: {
    audio: 'voz/escena-5.mp3',
    segundos: 6.03,
    palabras: w([
      ['Planes', 0.07, 0.24],
      ['de', 0.32, 0.36],
      ['lectura,', 0.4, 1],
      ['tu', 1.12, 1.2],
      ['racha,', 1.28, 1.84],
      ['oración', 1.92, 2.24],
      ['guiada…', 2.32, 2.88],
      ['¡y', 3.04, 3.16],
      ['la', 3.2, 3.28],
      ['Biblia', 3.32, 3.6],
      ['completa,', 3.72, 4.28],
      ['también', 4.4, 4.8],
      ['sin', 4.88, 4.96],
      ['conexión!', 5.04, 5.6],
    ]),
  },
  cierre: {
    audio: 'voz/escena-6.mp3',
    segundos: 6.53,
    palabras: w([
      ['Diez', 0.16, 0.28],
      ['minutos', 0.32, 0.64],
      ['por', 0.72, 0.8],
      ['día', 0.88, 1.04],
      ['alcanzan.', 1.16, 2.08],
      ['Leer', 2.16, 2.32],
      ['la', 2.4, 2.48],
      ['Biblia', 2.56, 2.96],
      ['es', 3.04, 3.12],
      ['gratis,', 3.2, 3.92],
      ['siempre.', 4, 4.88],
      ['¡Probá', 5.06, 5.16],
      ['Bereano', 5.2, 5.68],
      ['hoy!', 5.76, 6.13],
    ]),
  },
} satisfies Record<string, Toma>;

export type EscenaId = keyof typeof VOZ;
export const ORDEN: EscenaId[] = ['gancho', 'promesa', 'devocional', 'companero', 'planes', 'cierre'];
export const FPS = 30;
/** Aire después de cada frase; el cierre queda más tiempo con el logo. */
export const AIRE: Record<EscenaId, number> = { gancho: 0.15, promesa: 0.25, devocional: 0.1, companero: 0.1, planes: 0.15, cierre: 1.8 };
export const frames = (id: EscenaId) => Math.ceil((VOZ[id].segundos + AIRE[id]) * FPS);
export const TOTAL = ORDEN.reduce((a, id) => a + frames(id), 0);
