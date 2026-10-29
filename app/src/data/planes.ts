// Planes de lectura. Cada día: uno o más pasajes (siempre de la Biblia de la app) y una
// pregunta para aplicar. Los rangos se verifican en test/planes.test.ts.
// `premium`: los planes por tema irán detrás del paywall cuando exista (CLAUDE.md).

export type Reading = { book: string; chapter: number; from?: number; to?: number };
export type PlanDay = { title: string; readings: Reading[]; focus: string };
export type Plan = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  premium: boolean;
  days: PlanDay[];
};

const r = (book: string, chapter: number, from?: number, to?: number): Reading => ({
  book,
  chapter,
  from,
  to,
});

// Una pregunta por capítulo del plan de Juan.
const JUAN_FOCUS = [
  '¿Qué te dice de Jesús que sea "el Verbo"?',
  '¿Qué te enseña el primer milagro de Jesús?',
  '¿Qué significa para ti nacer de nuevo?',
  '¿De qué tienes sed hoy?',
  '¿Qué excusa le darías a Jesús, como el paralítico?',
  '¿Por qué buscas a Jesús: por el pan o por él?',
  '¿Qué opinan de Jesús las personas a tu alrededor?',
  '¿Qué te dice Jesús cuando te sientes acusado?',
  '¿Dónde Jesús te abrió los ojos?',
  '¿Reconoces la voz del buen pastor?',
  '¿Qué te dice que Jesús llorara con sus amigos?',
  '¿Qué ofrenda costosa le darías a Jesús?',
  '¿A quién podrías servir hoy, como Jesús lavó los pies?',
  '¿Qué te inquieta? Jesús prepara lugar para ti.',
  '¿Qué te ayuda a permanecer en la vid?',
  '¿Qué tristeza esperas que se convierta en gozo?',
  '¿Qué te dice que Jesús orara por ti?',
  '¿Cuándo negaste a Jesús? Él no te abandonó.',
  '¿Qué significa para ti "Consumado es"?',
  '¿Dónde necesitas ver a Jesús resucitado?',
  '¿Qué te responde Jesús cuando te pregunta "¿me amas?"?',
];

export const PLANES: Plan[] = [
  {
    id: 'ansiedad',
    title: 'Ansiedad',
    subtitle: 'Paz en medio del afán',
    description:
      'Siete días para llevar las preocupaciones a Dios, de la mano de Jesús en Getsemaní y de las promesas que sostuvieron a su pueblo.',
    premium: true,
    days: [
      {
        title: 'No os congojéis',
        readings: [r('mat', 6, 25, 34)],
        focus: '¿Qué preocupación de mañana estás cargando hoy?',
      },
      {
        title: 'La paz que guarda',
        readings: [r('php', 4, 4, 9)],
        focus: 'Convierte una preocupación en oración y agrega un motivo de gratitud.',
      },
      {
        title: 'El Señor es mi pastor',
        readings: [r('psa', 23)],
        focus: '¿En qué valle necesitas recordar que no caminas solo?',
      },
      {
        title: 'Getsemaní',
        readings: [r('mat', 26, 36, 46)],
        focus: 'Jesús también sintió angustia. ¿Qué le quieres decir con honestidad?',
      },
      {
        title: 'Echad toda vuestra solicitud',
        readings: [r('1pe', 5, 6, 11)],
        focus: '¿Qué carga concreta puedes entregarle hoy?',
      },
      {
        title: 'No temas',
        readings: [r('isa', 41, 8, 13)],
        focus: '¿Qué cambia saber que Dios te sostiene con su mano?',
      },
      {
        title: 'Mi paz os doy',
        readings: [r('jhn', 14, 15, 27)],
        focus: '¿Dónde buscas paz además de en Jesús?',
      },
    ],
  },
  {
    id: 'perdon',
    title: 'Perdón',
    subtitle: 'Recibirlo y darlo',
    description:
      'Del hijo pródigo a José y sus hermanos: una semana para recibir el perdón de Dios y aprender a perdonar a otros.',
    premium: true,
    days: [
      {
        title: 'El hijo pródigo',
        readings: [r('luk', 15, 11, 32)],
        focus: '¿Con cuál de los dos hijos te identificas más hoy?',
      },
      {
        title: 'Crea en mí un corazón limpio',
        readings: [r('psa', 51, 1, 12)],
        focus: '¿Qué necesitas confesarle a Dios?',
      },
      {
        title: 'Si confesamos',
        readings: [r('1jn', 1, 5, 10)],
        focus: '¿Crees que Dios ya te perdonó? ¿Qué te cuesta creer?',
      },
      {
        title: 'Setenta veces siete',
        readings: [r('mat', 18, 21, 35)],
        focus: '¿A quién te cuesta perdonar?',
      },
      {
        title: 'José perdona a sus hermanos',
        readings: [r('gen', 50, 15, 21)],
        focus: '¿Puedes ver a Dios obrando aun en lo que te hicieron?',
      },
      {
        title: 'Benignos y misericordiosos',
        readings: [r('eph', 4, 25, 32)],
        focus: '¿Qué palabra o actitud necesitas cambiar con alguien?',
      },
      {
        title: 'Vestíos de caridad',
        readings: [r('col', 3, 12, 17)],
        focus: '¿Qué paso concreto de perdón puedes dar esta semana?',
      },
    ],
  },
  {
    id: 'familia',
    title: 'Familia',
    subtitle: 'Lealtad, cuidado y fe en casa',
    description:
      'La historia de Rut y Noemí, y otros pasajes sobre el hogar: lealtad, cuidado mutuo y una fe que se transmite.',
    premium: true,
    days: [
      {
        title: 'Tu pueblo será mi pueblo',
        readings: [r('rut', 1, 1, 18)],
        focus: '¿A quién de tu familia puedes acompañar hoy?',
      },
      {
        title: 'Rut en el campo de Booz',
        readings: [r('rut', 2, 1, 12)],
        focus: '¿Cómo puedes mostrar bondad a alguien de tu casa?',
      },
      {
        title: 'Una familia nueva',
        readings: [r('rut', 4, 13, 17)],
        focus: '¿Dónde ves la mano de Dios en la historia de tu familia?',
      },
      {
        title: 'Si Jehová no edificare la casa',
        readings: [r('psa', 127)],
        focus: '¿Qué lugar tiene Dios en tu hogar hoy?',
      },
      {
        title: 'Padres e hijos',
        readings: [r('eph', 6, 1, 4)],
        focus: '¿Qué palabra de ánimo puedes darle a alguien de tu familia?',
      },
      {
        title: 'Soportándoos los unos a los otros',
        readings: [r('col', 3, 12, 21)],
        focus: '¿Qué actitud de este pasaje necesita tu casa?',
      },
      {
        title: 'Yo y mi casa',
        readings: [r('jos', 24, 14, 15)],
        focus: '¿Qué decisión de fe quieres tomar con tu familia?',
      },
    ],
  },
  {
    id: 'tormenta',
    title: 'Fe en la tormenta',
    subtitle: 'Cuando todo se sacude',
    description:
      'Jesús sobre el mar, Pablo en el naufragio y los salmos de refugio: una semana para confiar cuando todo se mueve.',
    premium: true,
    days: [
      {
        title: 'Jesús sobre el mar',
        readings: [r('mat', 14, 22, 33)],
        focus: '¿Dónde estás mirando: al viento o a Jesús?',
      },
      {
        title: 'Calla, enmudece',
        readings: [r('mrk', 4, 35, 41)],
        focus: '¿Qué tormenta le quieres presentar hoy?',
      },
      { title: 'Nuestro amparo', readings: [r('psa', 46)], focus: '¿Dónde buscas refugio primero?' },
      {
        title: 'El naufragio',
        readings: [r('act', 27, 13, 26)],
        focus: '¿Qué promesa de Dios te sostiene en medio de la crisis?',
      },
      {
        title: 'Cuando pasares por las aguas',
        readings: [r('isa', 43, 1, 7)],
        focus: '¿Qué significa para ti que Dios te llame por tu nombre?',
      },
      {
        title: 'Nada nos podrá apartar',
        readings: [r('rom', 8, 28, 39)],
        focus: '¿Qué miedo pondrías en la lista de Pablo?',
      },
      {
        title: 'La prueba de vuestra fe',
        readings: [r('jas', 1, 2, 12)],
        focus: '¿Para qué necesitas pedirle sabiduría a Dios?',
      },
    ],
  },
  {
    id: 'duelo',
    title: 'Duelo y esperanza',
    subtitle: 'Llorar con esperanza',
    description:
      'Para atravesar una pérdida sin respuestas fáciles: Jesús llora con Marta y María, y la promesa del sepulcro vacío.',
    premium: true,
    days: [
      {
        title: 'Jesús lloró',
        readings: [r('jhn', 11, 17, 44)],
        focus: 'Jesús llora contigo. ¿Qué le quieres contar?',
      },
      {
        title: 'Cercano a los quebrantados',
        readings: [r('psa', 34, 15, 22)],
        focus: '¿Dónde necesitas que Dios esté cerca hoy?',
      },
      {
        title: 'Nuevas cada mañana',
        readings: [r('lam', 3, 19, 26)],
        focus: '¿Qué misericordia pequeña puedes reconocer hoy?',
      },
      {
        title: 'El Dios de toda consolación',
        readings: [r('2co', 1, 3, 7)],
        focus: '¿Quién te acompaña en este tiempo? ¿A quién podrías acompañar?',
      },
      {
        title: 'No os entristezcáis como los otros',
        readings: [r('1th', 4, 13, 18)],
        focus: '¿Qué diferencia hace la esperanza en tu tristeza?',
      },
      {
        title: 'El sepulcro vacío',
        readings: [r('mat', 28, 1, 10)],
        focus: '¿Qué significa para ti que Jesús venció la muerte?',
      },
      {
        title: 'Todas las cosas nuevas',
        readings: [r('rev', 21, 1, 7)],
        focus: '¿Qué lágrima esperas que Dios limpie?',
      },
    ],
  },
  {
    id: 'juan',
    title: 'El Evangelio de Juan',
    subtitle: 'Un capítulo por día',
    description:
      'Veintiún días con el Evangelio de Juan, un capítulo por día, para conocer a Jesús de cerca. Gratis.',
    premium: false,
    days: Array.from({ length: 21 }, (_, i) => ({
      title: `Juan ${i + 1}`,
      readings: [r('jhn', i + 1)],
      focus: JUAN_FOCUS[i],
    })),
  },
];

export function getPlan(id: string | undefined): Plan | undefined {
  return PLANES.find((p) => p.id === id);
}

/** "Mateo 6:25-34", "Salmos 23", "Juan 1". */
export function readingLabel(bookName: string, r: Reading): string {
  if (!r.from) return `${bookName} ${r.chapter}`;
  return `${bookName} ${r.chapter}:${r.from}${r.to && r.to > r.from ? `-${r.to}` : ''}`;
}
