// Guion de los reels. Es la única fuente: de acá salen el texto para la voz y lo que se ve.
// Los versículos NO se escriben: se indica la cita y scripts/preparar-reels.mjs trae el texto
// de la Biblia de la app (Reina-Valera 1909).

export type Cita = { book: string; chapter: number; from: number; to?: number };
export type EscenaGuion =
  | { tipo: 'frase'; texto: string; destacar?: string[]; tono?: string }
  | { tipo: 'verso'; cita: Cita; tono?: string }
  | { tipo: 'chat'; texto: string; pregunta: string; tono?: string }
  | { tipo: 'pantalla'; texto: string; captura: string; destacar?: string[]; tono?: string }
  | { tipo: 'paso'; texto: string; paso: number; cita: Cita; destacar?: string[]; tono?: string }
  | { tipo: 'cierre'; texto: string; destacar?: string[]; boton: string; tono?: string };

export type ReelGuion = {
  id: string;
  titulo: string;
  musica: string; // tema de fondo propio de cada reel (Magnific, Lyria 3 Pro)
  escenas: EscenaGuion[];
  posteo: string; // texto para pegar en TikTok / Instagram (sin hashtags)
  hashtags: string[];
};

export const PASOS = ['Adorar', 'Confesar', 'Agradecer', 'Pedir'];

export const REELS: ReelGuion[] = [
  {
    id: 'ansiedad',
    titulo: '3 versículos para cuando la ansiedad no te deja dormir',
    musica: 'musica/lofi.mp3',
    escenas: [
      { tipo: 'frase', texto: '¿La ansiedad no te deja dormir? Guardá estos tres versículos.', destacar: ['ansiedad', 'tres'] },
      { tipo: 'verso', cita: { book: '1pe', chapter: 5, from: 7 } },
      { tipo: 'verso', cita: { book: 'isa', chapter: 41, from: 10 } },
      { tipo: 'verso', cita: { book: 'php', chapter: 4, from: 7 } },
      { tipo: 'cierre', texto: 'Guardalo para esta noche. Y si querés más, ¡probá Bereano gratis!', destacar: ['gratis'], boton: 'Link en la bio' },
    ],
    posteo: '3 versículos para cuando la ansiedad no te deja dormir. Guardalo y mandáselo a quien lo necesite. 1 Pedro 5:7 · Isaías 41:10 · Filipenses 4:7 (Reina-Valera 1909)',
    hashtags: ['ansiedad', 'versiculos', 'biblia', 'fe', 'paz', 'cristianos'],
  },
  {
    id: 'valle',
    titulo: 'Devocional en 30 segundos: Nada me faltará',
    musica: 'musica/cinematica.mp3',
    escenas: [
      { tipo: 'frase', texto: '¿Estás pasando por un valle oscuro? Escuchá esto.', destacar: ['valle', 'oscuro'] },
      { tipo: 'verso', cita: { book: 'psa', chapter: 23, from: 1 } },
      { tipo: 'verso', cita: { book: 'psa', chapter: 23, from: 4 } },
      { tipo: 'frase', texto: 'El salmo no esquiva el valle oscuro. Lo atraviesa. La promesa no es que no haya sombras, sino compañía en medio de ellas.', destacar: ['atraviesa', 'compañía'] },
      { tipo: 'frase', texto: '¿Qué valle estás atravesando hoy? Contalo en los comentarios.', destacar: ['comentarios'] },
      { tipo: 'cierre', texto: 'Un devocional nuevo cada día, gratis, en Bereano.', destacar: ['gratis'], boton: 'Link en la bio' },
    ],
    posteo: 'Devocional en 30 segundos: Nada me faltará. ¿Qué valle estás atravesando hoy? Te leo en los comentarios. Salmos 23:1, 4 (Reina-Valera 1909)',
    hashtags: ['devocional', 'salmo23', 'biblia', 'fe', 'dios', 'cristianos'],
  },
  {
    id: 'mansos',
    titulo: '¿Qué significa "bienaventurados los mansos"?',
    musica: 'musica/acustica.mp3',
    escenas: [
      { tipo: 'frase', texto: '¿Qué significa «bienaventurados los mansos»? Se lo preguntamos al compañero.', destacar: ['mansos'] },
      { tipo: 'chat', pregunta: '¿Qué significa “bienaventurados los mansos”?', texto: 'Ser manso no es ser débil: es tener fuerza y dejar que Dios la guíe.' },
      { tipo: 'verso', cita: { book: 'mat', chapter: 5, from: 5 } },
      { tipo: 'verso', cita: { book: 'mat', chapter: 11, from: 29 } },
      { tipo: 'cierre', texto: 'Preguntale lo que quieras: te responde con la Biblia abierta. ¡Probá Bereano gratis!', destacar: ['gratis'], boton: 'Link en la bio' },
    ],
    posteo: '¿Qué significa "bienaventurados los mansos"? Le preguntamos al compañero de Bereano: cada respuesta trae sus citas verificadas. Mateo 5:5 · Mateo 11:29 (Reina-Valera 1909)',
    hashtags: ['biblia', 'jesus', 'estudiobiblico', 'fe', 'mateo5', 'cristianos'],
  },
  {
    id: 'un-anio',
    titulo: 'Cómo leer la Biblia entera en un año',
    musica: 'musica.mp3',
    escenas: [
      { tipo: 'frase', texto: '¿Querés leer la Biblia entera? ¡Se puede en un año!', destacar: ['entera', 'año'] },
      { tipo: 'pantalla', captura: 'app/planes.png', texto: 'Quince minutos por día, con un plan que te dice qué leer.', destacar: ['quince', 'minutos'] },
      { tipo: 'pantalla', captura: 'app/racha.png', texto: 'Tu racha te ayuda a no cortar.', destacar: ['racha'] },
      { tipo: 'pantalla', captura: 'app/lector.png', texto: 'Y si un día no tenés tiempo de leer… ¡escuchala!', destacar: ['escuchala'] },
      { tipo: 'verso', cita: { book: 'psa', chapter: 119, from: 105 } },
      { tipo: 'cierre', texto: 'La Biblia en un año está en Bereano Plus. ¡Probalo siete días gratis!', destacar: ['gratis'], boton: 'Link en la bio' },
    ],
    posteo: 'Cómo leer la Biblia entera en un año: 15 minutos por día, un plan que te dice qué leer y tu racha para no cortar. Salmos 119:105 (Reina-Valera 1909)',
    hashtags: ['biblia', 'bibliaenunaño', 'lecturabiblica', 'habitos', 'fe', 'cristianos'],
  },
  {
    id: 'orar',
    titulo: 'Orá en 5 minutos',
    musica: 'musica/worship.mp3',
    escenas: [
      { tipo: 'frase', texto: '¿No sabés cómo orar? Probá esto: cuatro pasos, cinco minutos.', destacar: ['orar', 'cinco'] },
      { tipo: 'paso', paso: 0, cita: { book: 'psa', chapter: 100, from: 4 }, texto: 'Adorá: empezá mirando a Dios, no a tus problemas.', destacar: ['adorá'] },
      { tipo: 'paso', paso: 1, cita: { book: '1jn', chapter: 1, from: 9 }, texto: 'Confesá: contale con honestidad en qué fallaste. Él promete perdonar.', destacar: ['confesá'] },
      { tipo: 'paso', paso: 2, cita: { book: '1th', chapter: 5, from: 18 }, texto: 'Agradecé: nombrá tres cosas de hoy por las que podés dar gracias.', destacar: ['agradecé'] },
      { tipo: 'paso', paso: 3, cita: { book: 'php', chapter: 4, from: 6 }, texto: 'Pedí: presentale lo que te preocupa, por vos y por otros.', destacar: ['pedí'] },
      { tipo: 'cierre', texto: '¡La oración guiada está gratis en Bereano!', destacar: ['gratis'], boton: 'Link en la bio' },
    ],
    posteo: 'Orá en 5 minutos: adorar, confesar, agradecer, pedir. Cada paso con su versículo. Salmos 100:4 · 1 Juan 1:9 · 1 Tesalonicenses 5:18 · Filipenses 4:6 (Reina-Valera 1909)',
    hashtags: ['oracion', 'orar', 'biblia', 'fe', 'dios', 'cristianos'],
  },
];
