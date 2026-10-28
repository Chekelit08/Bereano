// Devocionales diarios (borrador: Ezequiel tiene que revisarlos antes de publicar).
//
// Reglas:
// - El pasaje se toma SIEMPRE de la Biblia de la app (book/chapter/from/to). Nunca se copia a mano.
// - Lo que va entre «comillas» en la reflexión tiene que aparecer tal cual en el pasaje: lo
//   verifica test/devocionales.test.ts. Así no se cuela una cita inventada o mal copiada.
// - Tono pastoral, corto, en español neutro (tú). Una pregunta concreta para aplicar.

export type Devocional = {
  id: string;
  title: string;
  book: string; // código del libro, como en las rutas: 'jhn'
  chapter: number;
  from: number;
  to: number;
  reflection: string; // párrafos separados por una línea en blanco
  question: string;
  /** Versículos para la imagen de historias, si el pasaje es muy largo para que entre. */
  share?: [number, number];
};

export const DEVOCIONALES: Devocional[] = [
  {
    id: 'pastor',
    title: 'Nada me faltará',
    book: 'psa',
    chapter: 23,
    from: 1,
    to: 4,
    reflection:
      'David no dice que nunca le va a faltar nada porque la vida sea fácil. Lo dice porque sabe quién lo cuida: «Jehová es mi pastor».\n\nEl salmo no esquiva el valle oscuro. Lo atraviesa. La promesa no es que no haya sombras, sino compañía en medio de ellas: «porque tú estarás conmigo».',
    question: '¿Qué valle estás atravesando hoy en el que necesitas recordar que no caminas solo?',
    share: [4, 4],
  },
  {
    id: 'descanso',
    title: 'Venid a mí',
    book: 'mat',
    chapter: 11,
    from: 28,
    to: 30,
    reflection:
      'Jesús no invita a los que ya tienen todo resuelto. Llama a los cansados: «Venid á mí todos los que estáis trabajados y cargados».\n\nSu descanso no es dejar de vivir, sino aprender a vivir con Él. Un yugo se lleva de a dos. Él camina a tu lado y dice de sí mismo que es «manso y humilde de corazón».',
    question: '¿Qué carga estás llevando solo que podrías entregarle hoy en oración?',
  },
  {
    id: 'afan',
    title: 'La paz que guarda',
    book: 'php',
    chapter: 4,
    from: 6,
    to: 7,
    reflection:
      'Pablo escribe esto desde la cárcel. No es una frase de alguien sin problemas. Su receta para la ansiedad es concreta: convertir cada preocupación en oración, y hacerlo «con hacimiento de gracias».\n\nLa paz que promete no depende de entender todo. Es una paz que «sobrepuja todo entendimiento» y que cuida el corazón como un guardia.',
    question: '¿Qué te preocupa hoy? Escríbelo como una oración y agrega algo por lo que puedas dar gracias.',
  },
  {
    id: 'de-tal-manera',
    title: 'De tal manera',
    book: 'jhn',
    chapter: 3,
    from: 16,
    to: 17,
    reflection:
      'Es tal vez el versículo más conocido de la Biblia, y por eso es fácil leerlo rápido. Detente en la medida del amor: «de tal manera amó Dios al mundo» que dio a su Hijo.\n\nEl versículo siguiente aclara la intención: Dios no envió a su Hijo para condenar, sino «para que el mundo sea salvo por él». El primer movimiento de Dios hacia ti es de amor.',
    question: '¿Cómo cambiaría tu día si lo vivieras sabiendo que Dios te mira con amor y no con condena?',
  },
  {
    id: 'cada-manana',
    title: 'Nuevas cada mañana',
    book: 'lam',
    chapter: 3,
    from: 22,
    to: 23,
    reflection:
      'Lamentaciones fue escrito sobre las ruinas de Jerusalén. En medio del dolor, el autor se acuerda de algo que le devuelve la esperanza: las misericordias de Dios «Nuevas son cada mañana».\n\nAyer no agotó la bondad de Dios. Lo que salió mal no cierra la historia. Hoy empieza con una provisión fresca de su fidelidad.',
    question: '¿Qué necesitas dejar en el ayer para recibir hoy la misericordia nueva de Dios?',
  },
  {
    id: 'alas-como-aguilas',
    title: 'Nuevas fuerzas',
    book: 'isa',
    chapter: 40,
    from: 29,
    to: 31,
    reflection:
      'Isaías reconoce algo muy humano: hasta los jóvenes se cansan y caen. Nadie tiene energía infinita. Pero Dios «multiplica las fuerzas al que no tiene ningunas».\n\nLa clave está en esperar en Él. No es una espera pasiva, sino confiada. Los que esperan en Jehová «tendrán nuevas fuerzas»: a veces para volar, a veces solo para seguir caminando.',
    question: '¿En qué área de tu vida te sientes sin fuerzas? ¿Cómo puedes esperar en Dios ahí hoy?',
  },
  {
    id: 'nada-nos-separa',
    title: 'Nada nos podrá apartar',
    book: 'rom',
    chapter: 8,
    from: 38,
    to: 39,
    reflection:
      'Pablo hace una lista de todo lo que podría asustarnos: la muerte, la vida, lo presente, lo que vendrá. Y concluye que ninguna de esas cosas «nos podrá apartar del amor de Dios».\n\nTu seguridad no depende de cómo te sientes hoy ni de lo que pase mañana. Está anclada en Cristo, y desde ahí nada la mueve.',
    question: '¿Qué miedo concreto pondrías hoy en la lista de Pablo?',
  },
  {
    id: 'fiate',
    title: 'Fíate de todo corazón',
    book: 'pro',
    chapter: 3,
    from: 5,
    to: 6,
    reflection:
      'Confiar en Dios no significa dejar de pensar. Significa no apoyarse solo en lo que uno entiende: «no estribes en tu prudencia».\n\nLa promesa es para quien lo tiene en cuenta en todo, no solo en lo espiritual: «Reconócelo en todos tus caminos». Las decisiones del trabajo, la familia y el dinero también son caminos donde Él guía.',
    question: '¿Qué decisión que tienes por delante todavía no pusiste en manos de Dios?',
  },
  {
    id: 'caridad',
    title: 'El amor es sufrido',
    book: '1co',
    chapter: 13,
    from: 4,
    to: 7,
    reflection:
      'La Reina-Valera usa la palabra caridad para el amor que se entrega. Pablo no lo define con sentimientos, sino con acciones: «La caridad es sufrida, es benigna».\n\nUn ejercicio sencillo: lee el pasaje poniendo tu nombre en lugar de la palabra caridad. Donde te cueste leerlo, ahí está la invitación de hoy.',
    question: '¿Con quién te pide Dios hoy un amor más paciente y más amable?',
  },
  {
    id: 'primeramente',
    title: 'Buscad primeramente',
    book: 'mat',
    chapter: 6,
    from: 31,
    to: 34,
    reflection:
      'Jesús conoce nuestras preocupaciones de todos los días: qué comer, qué vestir. No las desprecia; nos recuerda que el Padre «sabe que de todas estas cosas habéis menester».\n\nLa salida a la ansiedad es un cambio de orden: «buscad primeramente el reino de Dios». Y vivir un día a la vez, porque «basta al día su afán».',
    question: '¿Qué preocupación de mañana estás cargando hoy?',
    share: [33, 33],
  },
  {
    id: 'esfuerzate',
    title: 'Esfuérzate y sé valiente',
    book: 'jos',
    chapter: 1,
    from: 9,
    to: 9,
    reflection:
      'Josué tenía que reemplazar a Moisés. Una tarea enorme. Dios no le promete que será fácil; le da una razón para no tener miedo: estará con él «en donde quiera que fueres».\n\nEl valor no es ausencia de miedo. Es avanzar sabiendo que Dios va contigo.',
    question: '¿Qué paso valiente te está pidiendo Dios dar esta semana?',
  },
  {
    id: 'amparo',
    title: 'Nuestro amparo',
    book: 'psa',
    chapter: 46,
    from: 1,
    to: 3,
    reflection:
      'El salmo imagina lo peor: la tierra que se mueve, los montes que caen al mar. Y aun así dice: «no temeremos».\n\nNo porque no haya temblor, sino porque hay refugio. Dios es «nuestro pronto auxilio en las tribulaciones»: no llega tarde ni de lejos.',
    question: '¿Dónde buscas refugio primero cuando algo se sacude en tu vida?',
    share: [2, 3],
  },
  {
    id: 'la-vid',
    title: 'Permanecer en la vid',
    book: 'jhn',
    chapter: 15,
    from: 4,
    to: 5,
    reflection:
      'Una rama no se esfuerza por dar uvas. Simplemente está unida a la planta. Jesús usa esa imagen para hablar de nuestra vida con Él: «Yo soy la vid, vosotros los pámpanos».\n\nEl fruto no sale de la presión, sino de la cercanía. Y Jesús es honesto: «sin mí nada podéis hacer».',
    question: '¿Qué puedes hacer hoy para quedarte cerca de Jesús en medio de tus tareas?',
  },
  {
    id: 'fruto',
    title: 'El fruto del Espíritu',
    book: 'gal',
    chapter: 5,
    from: 22,
    to: 23,
    reflection:
      'Pablo habla de fruto, en singular: no es una lista para elegir, sino un solo carácter que crece entero: «caridad, gozo, paz, tolerancia, benignidad, bondad, fe».\n\nEl fruto no se fabrica, se cultiva. Crece despacio, con tiempo, cuando dejamos que el Espíritu trabaje en nosotros.',
    question: '¿Cuál de estas virtudes notas que más necesitas hoy? Pídela en oración.',
  },
  {
    id: 'por-gracia',
    title: 'Por gracia',
    book: 'eph',
    chapter: 2,
    from: 8,
    to: 10,
    reflection:
      'La salvación no es un premio por portarse bien: «por gracia sois salvos por la fe». Es un regalo, y por eso nadie puede presumir.\n\nPero la gracia no nos deja quietos. Somos «hechura suya», una obra de Dios, creados para buenas obras que Él ya preparó.',
    question: '¿Qué buena obra sencilla podrías hacer hoy como respuesta a la gracia que recibiste?',
  },
  {
    id: 'pruebas',
    title: 'Cuando llega la prueba',
    book: 'jas',
    chapter: 1,
    from: 2,
    to: 5,
    reflection:
      'Santiago no dice que la prueba sea buena en sí misma. Dice que Dios puede usarla: «la prueba de vuestra fe obra paciencia».\n\nY si no sabes cómo atravesarla, hay una invitación directa: pedir sabiduría a Dios, que la da a todos «abundantemente, y no zahiere», es decir, sin reproches.',
    question: '¿Para qué situación concreta necesitas pedirle sabiduría a Dios hoy?',
    share: [5, 5],
  },
  {
    id: 'confesar',
    title: 'Fiel para perdonar',
    book: '1jn',
    chapter: 1,
    from: 8,
    to: 9,
    reflection:
      'Fingir que estamos bien nos aleja de la verdad. Juan lo dice sin vueltas: si negamos el pecado, «nos engañamos á nosotros mismos».\n\nLa buena noticia viene enseguida. Dios no está esperando para castigar, sino para limpiar: «él es fiel y justo para que nos perdone».',
    question: '¿Hay algo que necesitas confesarle a Dios hoy, con la confianza de que te va a perdonar?',
  },
  {
    id: 'lo-bueno',
    title: 'Lo que Dios pide',
    book: 'mic',
    chapter: 6,
    from: 8,
    to: 8,
    reflection:
      'A veces complicamos la fe. Miqueas la resume en tres cosas: «hacer juicio, y amar misericordia, y humillarte para andar con tu Dios».\n\nJusticia hacia los demás, misericordia en el corazón y humildad delante de Dios. Es simple de decir y desafiante de vivir.',
    question: '¿Cuál de las tres te cuesta más hoy: la justicia, la misericordia o la humildad?',
  },
  {
    id: 'el-padre-corre',
    title: 'El padre que corre',
    book: 'luk',
    chapter: 15,
    from: 20,
    to: 24,
    reflection:
      'El hijo vuelve con un discurso preparado. Pero el padre lo ve de lejos, se conmueve, «y corrió». No espera explicaciones; lo abraza primero.\n\nAsí presenta Jesús a Dios: un Padre que sale al encuentro y que hace fiesta, porque su hijo «habíase perdido, y es hallado».',
    question: '¿Qué imagen de Dios tienes cuando te alejas? ¿Se parece a este padre?',
    share: [20, 20],
  },
  {
    id: 'formado',
    title: 'Formado por Dios',
    book: 'psa',
    chapter: 139,
    from: 13,
    to: 16,
    reflection:
      'Antes de que nadie te conociera, Dios ya te estaba formando. El salmista se maravilla: «maravillosas son tus obras».\n\nTu vida no es un accidente ni un borrador. Dios te conoce desde el principio, y nada de ti está oculto para Él.',
    question: '¿Qué parte de ti te cuesta aceptar? ¿Cómo la verías si recordaras que Dios te formó?',
    share: [14, 14],
  },
  {
    id: 'luz',
    title: 'La luz del mundo',
    book: 'mat',
    chapter: 5,
    from: 14,
    to: 16,
    reflection:
      'Jesús no dice "traten de ser luz". Dice «Vosotros sois la luz del mundo». Es una identidad antes que una tarea.\n\nLa luz no existe para que la miren a ella, sino para que se vea lo demás. Nuestras buenas obras apuntan a otro: que los demás glorifiquen al Padre.',
    question: '¿Dónde puedes encender un poco de luz hoy: en tu casa, tu trabajo o tu barrio?',
    share: [16, 16],
  },
  {
    id: 'la-carrera',
    title: 'Los ojos en Jesús',
    book: 'heb',
    chapter: 12,
    from: 1,
    to: 2,
    reflection:
      'La fe se parece más a una carrera larga que a una carrera corta. Por eso el autor habla de correr «con paciencia».\n\nPara no perder el rumbo, hay que mirar a Jesús, el «autor y consumador de la fe». Él empezó la carrera y la va a terminar.',
    question: '¿Qué peso podrías soltar para correr con más libertad?',
    share: [1, 1],
  },
  {
    id: 'renovacion',
    title: 'Una mente renovada',
    book: 'rom',
    chapter: 12,
    from: 1,
    to: 2,
    reflection:
      'Pablo nos invita a no amoldarnos a la forma de pensar de nuestro tiempo: «no os conforméis á este siglo».\n\nEl cambio empieza adentro, en la manera de pensar. Cuando la mente se renueva con la Palabra, empezamos a reconocer la voluntad de Dios, que es «buena», «agradable y perfecta».',
    question: '¿Qué pensamiento repetido necesitas cambiar por una verdad de la Biblia?',
    share: [2, 2],
  },
  {
    id: 'bastate',
    title: 'Bástate mi gracia',
    book: '2co',
    chapter: 12,
    from: 9,
    to: 10,
    reflection:
      'Pablo le pidió a Dios que le quitara un sufrimiento. La respuesta fue otra: «Bástate mi gracia».\n\nDios no siempre quita la debilidad. A veces la usa para mostrar su fuerza. Por eso Pablo puede decir algo que parece al revés: «cuando soy flaco, entonces soy poderoso».',
    question: '¿Qué debilidad tuya podría ser el lugar donde Dios quiere mostrar su gracia?',
    share: [9, 9],
  },
  {
    id: 'no-se-turbe',
    title: 'No se turbe tu corazón',
    book: 'jhn',
    chapter: 14,
    from: 1,
    to: 3,
    reflection:
      'Jesús dice estas palabras la noche antes de la cruz. Sus discípulos estaban por pasar el peor momento de sus vidas, y Él les habla de un lugar preparado para ellos.\n\nSu promesa es personal: «vendré otra vez». La historia no termina en la angustia de hoy.',
    question: '¿Qué te inquieta hoy? ¿Cómo te ayuda saber que Jesús prepara un lugar para ti?',
    share: [1, 1],
  },
  {
    id: 'lampara',
    title: 'Lámpara a mis pies',
    book: 'psa',
    chapter: 119,
    from: 105,
    to: 105,
    reflection:
      'Una lámpara de aceite no iluminaba todo el camino. Alcanzaba para dar el próximo paso. Así describe el salmista la Palabra: «Lámpara es á mis pies tu palabra».\n\nNo siempre vas a ver el panorama completo. Pero vas a tener luz suficiente para el paso de hoy.',
    question: '¿Cuál es el próximo paso que ya sabes que tienes que dar?',
  },
  {
    id: 'vestios',
    title: 'Vestirse de amor',
    book: 'col',
    chapter: 3,
    from: 12,
    to: 14,
    reflection:
      'Así como cada mañana elegimos qué ropa ponernos, Pablo nos invita a vestirnos de misericordia, humildad y paciencia.\n\nY sobre todo, de amor: «el vínculo de la perfección». El perdón tiene un modelo claro: perdonar «de la manera que Cristo os perdonó».',
    question: '¿A quién te cuesta perdonar? ¿Qué pequeño paso podrías dar hoy?',
    share: [13, 13],
  },
  {
    id: 'bereanos',
    title: 'Escudriñar cada día',
    book: 'act',
    chapter: 17,
    from: 11,
    to: 11,
    reflection:
      'Los creyentes de Berea recibieron el mensaje con entusiasmo, pero no lo creyeron a ciegas. Lo compararon con la Biblia, «escudriñando cada día las Escrituras».\n\nDe ellos viene el nombre de esta app. La fe y las preguntas no se pelean: buscar en la Palabra es una forma de amar a Dios con la mente.',
    question: '¿Qué pregunta sobre tu fe te gustaría estudiar en la Biblia esta semana?',
  },
  {
    id: 'la-roca',
    title: 'Sobre la peña',
    book: 'mat',
    chapter: 7,
    from: 24,
    to: 25,
    reflection:
      'Las dos casas de la parábola recibieron la misma tormenta. La diferencia no estuvo en el clima, sino en los cimientos.\n\nJesús es claro: el prudente es el que oye sus palabras «y las hace». Escuchar es importante. Ponerlo en práctica es lo que sostiene la casa.',
    question: '¿Qué enseñanza de Jesús que ya conoces necesitas empezar a practicar?',
  },
  {
    id: 'mi-socorro',
    title: 'El que te guarda',
    book: 'psa',
    chapter: 121,
    from: 1,
    to: 4,
    reflection:
      'Los peregrinos subían a Jerusalén cantando este salmo. Miraban los montes y se preguntaban de dónde vendría la ayuda. La respuesta: «Mi socorro viene de Jehová».\n\nTú te cansas y duermes. Dios no: «ni se dormirá el que te guarda». Puedes descansar porque Él sigue despierto.',
    question: '¿Qué te quita el sueño? Entrégaselo a Dios antes de dormir esta noche.',
  },
  {
    id: 'todo-nuevo',
    title: 'Todas las cosas nuevas',
    book: 'rev',
    chapter: 21,
    from: 3,
    to: 5,
    reflection:
      'La Biblia termina con una promesa: Dios vivirá con su pueblo y «limpiará Dios toda lágrima».\n\nEl dolor de hoy es real, pero no es definitivo. El que está sentado en el trono dice: «yo hago nuevas todas las cosas». Esa esperanza cambia la manera de vivir el presente.',
    question: '¿Qué dolor de tu vida necesita hoy la esperanza de que Dios hará todo nuevo?',
    share: [4, 4],
  },
];

/** El devocional de una fecha (local). Rota día a día y es el mismo para todos ese día. */
export function devocionalDelDia(date = new Date()): Devocional {
  const start = Date.UTC(2026, 0, 1);
  const today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const day = Math.floor((today - start) / 86_400_000);
  const n = DEVOCIONALES.length;
  return DEVOCIONALES[((day % n) + n) % n];
}

/**
 * Letra hebrea al principio de cada estrofa del Salmo 119 ("NUN. Lámpara es…"): es un título,
 * no parte del versículo, así que no va en la imagen.
 */
export function shareText(verses: string[]): string {
  return verses.join(' ').replace(/^[A-ZÑ]{2,}\. /, '');
}

/** Los versículos que van en la imagen para compartir. */
export function shareRange(d: Devocional): [number, number] {
  return d.share ?? [d.from, d.to];
}

export function getDevocional(id: string | undefined): Devocional | undefined {
  return DEVOCIONALES.find((d) => d.id === id);
}
