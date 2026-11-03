// Oración guiada: pasos cortos con un versículo (siempre de la Biblia de la app) y un tiempo
// sugerido en silencio. test/oracion-guiada.test.ts verifica que cada cita exista.

export type GuideStep = {
  title: string;
  prompt: string;
  ref?: { book: string; chapter: number; verse: number };
  seconds: number;
  /** Muestra los pedidos abiertos del diario de oración. */
  usePrayers?: boolean;
};
export type Guide = {
  id: string;
  title: string;
  subtitle: string;
  minutes: number;
  premium: boolean;
  steps: GuideStep[];
};

export const GUIDES: Guide[] = [
  {
    id: 'acts',
    title: 'Adorar, confesar, agradecer, pedir',
    subtitle: 'Una oración completa en cuatro pasos',
    minutes: 5,
    premium: false,
    steps: [
      {
        title: 'Adoración',
        prompt: 'Empezá mirando a Dios, no a tus problemas. Decile quién es para vos: fiel, bueno, cercano.',
        ref: { book: 'psa', chapter: 100, verse: 4 },
        seconds: 60,
      },
      {
        title: 'Confesión',
        prompt: 'Contale con honestidad en qué fallaste. No para hundirte: él promete perdonar.',
        ref: { book: '1jn', chapter: 1, verse: 9 },
        seconds: 60,
      },
      {
        title: 'Gratitud',
        prompt: 'Nombrá tres cosas concretas de hoy por las que podés dar gracias.',
        ref: { book: '1th', chapter: 5, verse: 18 },
        seconds: 60,
      },
      {
        title: 'Súplica',
        prompt: 'Ahora sí: presentale lo que te preocupa, por vos y por otros.',
        ref: { book: 'php', chapter: 4, verse: 6 },
        seconds: 90,
        usePrayers: true,
      },
    ],
  },
  {
    id: 'salmo-23',
    title: 'Orar el Salmo 23',
    subtitle: 'Frase por frase, con el buen pastor',
    minutes: 6,
    premium: true,
    steps: [
      {
        title: 'Mi pastor',
        prompt: '¿Qué te falta hoy? Decíselo, y recordá quién te cuida.',
        ref: { book: 'psa', chapter: 23, verse: 1 },
        seconds: 50,
      },
      {
        title: 'Descanso',
        prompt: 'Respirá despacio. ¿Dónde necesitás que te lleve a descansar?',
        ref: { book: 'psa', chapter: 23, verse: 2 },
        seconds: 50,
      },
      {
        title: 'Restauración',
        prompt: 'Pedile que te renueve por dentro y te muestre el camino.',
        ref: { book: 'psa', chapter: 23, verse: 3 },
        seconds: 50,
      },
      {
        title: 'En el valle',
        prompt: '¿Qué valle estás atravesando? Él está con vos ahí.',
        ref: { book: 'psa', chapter: 23, verse: 4 },
        seconds: 60,
      },
      {
        title: 'La mesa',
        prompt: 'Agradecé lo que te dio, aun en medio de lo difícil.',
        ref: { book: 'psa', chapter: 23, verse: 5 },
        seconds: 50,
      },
      {
        title: 'Para siempre',
        prompt: 'Terminá confiando: su bien y su misericordia te siguen.',
        ref: { book: 'psa', chapter: 23, verse: 6 },
        seconds: 50,
      },
    ],
  },
  {
    id: 'por-otros',
    title: 'Orar por otros',
    subtitle: 'Familia, amigos, iglesia y autoridades',
    minutes: 5,
    premium: true,
    steps: [
      {
        title: 'Por todos',
        prompt: 'Pablo nos invita a orar por todas las personas. Pedile a Dios un corazón para los demás.',
        ref: { book: '1ti', chapter: 2, verse: 1 },
        seconds: 45,
      },
      {
        title: 'Tus pedidos',
        prompt: 'Estos son los pedidos de tu diario de oración. Presentalos uno por uno.',
        seconds: 90,
        usePrayers: true,
      },
      { title: 'Tu familia', prompt: 'Nombrá a cada persona de tu casa y lo que necesita hoy.', seconds: 60 },
      {
        title: 'Tu iglesia',
        prompt: 'Orá por tus pastores, por los que sirven y por los que están lejos.',
        seconds: 60,
      },
      {
        title: 'Los que sufren',
        prompt: 'Pensá en alguien enfermo, solo o en crisis. Pedí que Dios lo levante.',
        ref: { book: 'psa', chapter: 146, verse: 8 },
        seconds: 60,
      },
    ],
  },
];

export function getGuide(id: string | undefined): Guide | undefined {
  return GUIDES.find((g) => g.id === id);
}

/** El texto del versículo sin el título del salmo ("Salmo de David."). */
export function cleanVerse(text: string): string {
  return text.replace(/^Salmo de [A-ZÁÉÍÓÚ][a-záéíóú]+\.\s*/, '');
}
