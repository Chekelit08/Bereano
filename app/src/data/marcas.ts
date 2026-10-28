// Palabras destacadas en el estilo "Editorial" del versículo del día (como las piezas de
// Holy Bible: algunas en negrita, otras en cursiva, una encerrada en un círculo a mano y una
// frase subrayada). Cada palabra tiene que existir en el texto: lo verifica
// test/devocionales.test.ts. Si un devocional no tiene marcas, se ve en un estilo más simple.
export type Marks = {
  bold?: string[];
  italic?: string[];
  circle?: string; // una sola palabra
  underline?: string; // palabras seguidas
};

export const MARKS: Record<string, Marks> = {
  pastor: {
    bold: ['no', 'temeré'],
    italic: ['sombra', 'aliento.'],
    circle: 'conmigo:',
    underline: 'tú estarás',
  },
  descanso: { bold: ['Venid', 'descansar.'], italic: ['trabajados', 'cargados,'], circle: 'mí' },
  afan: { bold: ['paz', 'Dios,'], italic: ['corazones'], circle: 'guardará', underline: 'en Cristo Jesús.' },
  'de-tal-manera': {
    bold: ['vida', 'eterna.'],
    italic: ['amó', 'mundo,'],
    circle: 'todo',
    underline: 'no se pierda,',
  },
  'cada-manana': {
    bold: ['fidelidad.'],
    italic: ['misericordia', 'cada'],
    circle: 'Nuevas',
    underline: 'grande es tu',
  },
  'alas-como-aguilas': {
    bold: ['nuevas', 'fuerzas;'],
    italic: ['águilas;'],
    circle: 'esperan',
    underline: 'no se cansarán;',
  },
  'nada-nos-separa': {
    bold: ['amor', 'Dios,'],
    italic: ['muerte,', 'vida,'],
    circle: 'ninguna',
    underline: 'nos podrá apartar',
  },
  fiate: {
    bold: ['Fíate', 'corazón,'],
    italic: ['caminos,'],
    circle: 'todo',
    underline: 'enderezará tus veredas.',
  },
  caridad: { bold: ['todo', 'soporta.'], italic: ['cree,', 'espera,'], circle: 'sufre,' },
  primeramente: {
    bold: ['reino', 'Dios'],
    italic: ['justicia,'],
    circle: 'primeramente',
    underline: 'os serán añadidas.',
  },
  esfuerzate: {
    bold: ['valiente:'],
    italic: ['esfuerces'],
    circle: 'contigo',
    underline: 'no temas ni desmayes,',
  },
  amparo: {
    bold: ['no', 'temeremos'],
    italic: ['montes'],
    circle: 'aunque',
    underline: 'la tierra sea removida;',
  },
  'la-vid': {
    bold: ['vid,', 'fruto;'],
    italic: ['pámpanos:'],
    circle: 'nada',
    underline: 'el que está en mí,',
  },
  fruto: {
    bold: ['Espíritu'],
    italic: ['gozo,', 'paz,'],
    circle: 'caridad,',
    underline: 'contra tales cosas',
  },
  'por-gracia': { bold: ['gracia', 'don'], italic: ['fe;'], circle: 'salvos', underline: 'No por obras,' },
  pruebas: {
    bold: ['sabiduría,'],
    italic: ['abundantemente,'],
    circle: 'demándela',
    underline: 'le será dada.',
  },
  confesar: { bold: ['fiel', 'justo'], italic: ['perdone'], circle: 'limpie', underline: 'de toda maldad.' },
  'lo-bueno': { bold: ['misericordia,'], italic: ['juicio,'], circle: 'andar', underline: 'con tu Dios.' },
  'el-padre-corre': {
    bold: ['misericordia,'],
    italic: ['lejos,'],
    circle: 'corrió,',
    underline: 'echóse sobre su cuello,',
  },
  formado: { bold: ['maravillosas'], italic: ['obras:'], circle: 'alabaré;', underline: 'mi alma lo conoce' },
  luz: { bold: ['luz'], italic: ['hombres,'], circle: 'alumbre', underline: 'glorifiquen á vuestro Padre' },
  'la-carrera': { bold: ['carrera'], italic: ['testigos,'], circle: 'corramos', underline: 'con paciencia' },
  renovacion: {
    bold: ['renovación'],
    italic: ['siglo;'],
    circle: 'reformaos',
    underline: 'agradable y perfecta.',
  },
  bastate: {
    bold: ['Bástate', 'gracia;'],
    italic: ['flaqueza'],
    circle: 'potencia',
    underline: 'se perfecciona.',
  },
  'no-se-turbe': {
    bold: ['No', 'turbe'],
    italic: ['corazón:'],
    circle: 'creed',
    underline: 'también en mí.',
  },
  lampara: { bold: ['Lámpara', 'palabra,'], italic: ['camino.'], circle: 'pies', underline: 'lumbrera á mi' },
  vestios: {
    bold: ['perdonándoos'],
    italic: ['Sufriéndoos'],
    circle: 'Cristo',
    underline: 'así también hacedlo',
  },
  bereanos: { bold: ['Escrituras,'], italic: ['nobles'], circle: 'escudriñando', underline: 'cada día' },
  'la-roca': { bold: ['prudente,'], italic: ['palabras,'], circle: 'hace,', underline: 'sobre la peña…' },
  'mi-socorro': { bold: ['socorro'], italic: ['cielos'], circle: 'guarda.', underline: 'No dará tu pie' },
  'todo-nuevo': {
    bold: ['lágrima'],
    italic: ['llanto,', 'dolor:'],
    circle: 'limpiará',
    underline: 'la muerte no será más;',
  },
};

/** Posición de una secuencia de palabras dentro del texto, o -1. */
export function findSequence(words: string[], seq: string[]): number {
  for (let i = 0; i + seq.length <= words.length; i++) {
    if (seq.every((w, j) => words[i + j] === w)) return i;
  }
  return -1;
}
