// "Versículos sobre…": temas con pasajes elegidos. El texto sale siempre de la Biblia de la app
// (Reina-Valera 1909); acá solo van las citas. test/temas.test.ts verifica que existan.

export type TemaRef = { book: string; chapter: number; from: number; to?: number };
export type Tema = { id: string; title: string; subtitle: string; colors: [string, string]; refs: TemaRef[] };

const r = (book: string, chapter: number, from: number, to?: number): TemaRef => ({
  book,
  chapter,
  from,
  to,
});

export const TEMAS: Tema[] = [
  {
    id: 'ansiedad',
    title: 'Ansiedad',
    subtitle: 'Cuando la mente no para',
    colors: ['#4C6EF5', '#15AABF'],
    refs: [r('php', 4, 6, 7), r('mat', 6, 34), r('1pe', 5, 7), r('psa', 55, 22), r('isa', 41, 10)],
  },
  {
    id: 'amor',
    title: 'Amor',
    subtitle: 'El amor de Dios y el nuestro',
    colors: ['#F03E3E', '#F76707'],
    refs: [r('jhn', 3, 16), r('1jn', 4, 8), r('1co', 13, 4, 7), r('rom', 8, 38, 39), r('jhn', 15, 13)],
  },
  {
    id: 'fortaleza',
    title: 'Fortaleza',
    subtitle: 'Para los días difíciles',
    colors: ['#E8590C', '#FAB005'],
    refs: [r('isa', 40, 31), r('php', 4, 13), r('psa', 46, 1), r('jos', 1, 9), r('2co', 12, 9)],
  },
  {
    id: 'esperanza',
    title: 'Esperanza',
    subtitle: 'Lo mejor todavía no llegó',
    colors: ['#0CA678', '#74B816'],
    refs: [r('rom', 15, 13), r('jer', 29, 11), r('lam', 3, 22, 23), r('heb', 11, 1), r('rom', 5, 5)],
  },
  {
    id: 'paz',
    title: 'Paz',
    subtitle: 'Descanso para el corazón',
    colors: ['#1C7ED6', '#22B8CF'],
    refs: [r('jhn', 14, 27), r('isa', 26, 3), r('php', 4, 7), r('rom', 5, 1), r('num', 6, 24, 26)],
  },
  {
    id: 'miedo',
    title: 'Miedo',
    subtitle: 'No temas',
    colors: ['#5F3DC4', '#9775FA'],
    refs: [r('psa', 23, 4), r('2ti', 1, 7), r('psa', 27, 1), r('deu', 31, 6), r('isa', 43, 1)],
  },
  {
    id: 'perdon',
    title: 'Perdón',
    subtitle: 'Recibirlo y darlo',
    colors: ['#C2255C', '#F06595'],
    refs: [r('1jn', 1, 9), r('eph', 4, 32), r('col', 3, 13), r('mat', 6, 14), r('psa', 103, 12)],
  },
  {
    id: 'fe',
    title: 'Fe',
    subtitle: 'Confiar sin ver',
    colors: ['#364FC7', '#4DABF7'],
    refs: [r('heb', 11, 6), r('mrk', 11, 24), r('rom', 10, 17), r('eph', 2, 8), r('pro', 3, 5, 6)],
  },
  {
    id: 'sanidad',
    title: 'Sanidad',
    subtitle: 'En la enfermedad',
    colors: ['#2B8A3E', '#69DB7C'],
    refs: [r('jer', 17, 14), r('psa', 147, 3), r('isa', 53, 5), r('jas', 5, 15), r('exo', 15, 26)],
  },
  {
    id: 'familia',
    title: 'Familia',
    subtitle: 'Para el hogar',
    colors: ['#D9480F', '#FFA94D'],
    refs: [r('jos', 24, 15), r('eph', 6, 4), r('psa', 127, 3), r('col', 3, 20), r('pro', 22, 6)],
  },
  {
    id: 'gratitud',
    title: 'Gratitud',
    subtitle: 'Dar gracias en todo',
    colors: ['#F59F00', '#FFD43B'],
    refs: [r('1th', 5, 18), r('psa', 107, 1), r('col', 3, 17), r('psa', 100, 4), r('psa', 118, 24)],
  },
  {
    id: 'duelo',
    title: 'Duelo',
    subtitle: 'Cuando perdemos a alguien',
    colors: ['#495057', '#868E96'],
    refs: [r('psa', 34, 18), r('mat', 5, 4), r('rev', 21, 4), r('jhn', 11, 25), r('2co', 1, 3, 4)],
  },
  {
    id: 'sabiduria',
    title: 'Sabiduría',
    subtitle: 'Para decidir bien',
    colors: ['#0B7285', '#3BC9DB'],
    refs: [r('jas', 1, 5), r('pro', 9, 10), r('psa', 119, 105), r('pro', 16, 3), r('col', 3, 16)],
  },
  {
    id: 'oracion',
    title: 'Oración',
    subtitle: 'Hablar con Dios',
    colors: ['#6741D9', '#B197FC'],
    refs: [r('mat', 7, 7), r('1th', 5, 17), r('jer', 33, 3), r('mat', 6, 6), r('jas', 5, 16)],
  },
  {
    id: 'proposito',
    title: 'Propósito',
    subtitle: 'Para qué estoy acá',
    colors: ['#1864AB', '#748FFC'],
    refs: [r('rom', 8, 28), r('eph', 2, 10), r('pro', 19, 21), r('php', 1, 6), r('ecc', 3, 1)],
  },
  {
    id: 'amistad',
    title: 'Amistad',
    subtitle: 'Los que caminan con nosotros',
    colors: ['#E64980', '#FFA8A8'],
    refs: [r('pro', 17, 17), r('jhn', 15, 15), r('ecc', 4, 9, 10), r('pro', 27, 17), r('pro', 18, 24)],
  },
];

export function getTema(id: string | undefined): Tema | undefined {
  return TEMAS.find((t) => t.id === id);
}
