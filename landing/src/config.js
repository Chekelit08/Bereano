// Datos de negocio que se muestran en la landing. Cambiarlos acá y no en el HTML.

export const PRICES = {
  monthly: '6,99',
  yearly: '39,99',
};

// Orden: público prioritario primero (EE.UU., España), después LATAM alfabético.
// "ZZ" es el código ISO reservado para uso propio: lo usamos como "Otro país".
export const COUNTRIES = [
  ['US', 'Estados Unidos'],
  ['ES', 'España'],
  ['AR', 'Argentina'],
  ['BO', 'Bolivia'],
  ['CL', 'Chile'],
  ['CO', 'Colombia'],
  ['CR', 'Costa Rica'],
  ['CU', 'Cuba'],
  ['EC', 'Ecuador'],
  ['SV', 'El Salvador'],
  ['GT', 'Guatemala'],
  ['HN', 'Honduras'],
  ['MX', 'México'],
  ['NI', 'Nicaragua'],
  ['PA', 'Panamá'],
  ['PY', 'Paraguay'],
  ['PE', 'Perú'],
  ['PR', 'Puerto Rico'],
  ['DO', 'República Dominicana'],
  ['UY', 'Uruguay'],
  ['VE', 'Venezuela'],
  ['ZZ', 'Otro país'],
];

// Cada puerta falsa: id que se guarda en Supabase (source) y evento de PostHog.
export const DOORS = {
  companero: {
    event: 'puerta_falsa_companero',
    title: 'Tu compañero de estudio está casi listo',
    text: 'Podrás preguntarle sobre cualquier pasaje y te responderá citando la Biblia. Déjanos tu email y te avisamos apenas esté disponible.',
  },
  planes_tema: {
    event: 'puerta_falsa_planes_tema',
    title: 'Los planes por tema llegan pronto',
    text: 'Estamos armando planes sobre ansiedad, perdón, familia y más. Déjanos tu email y te avisamos.',
  },
  modo_grupo: {
    event: 'puerta_falsa_modo_grupo',
    title: 'El modo grupo está en camino',
    text: 'Pronto vas a poder compartir un plan con tu iglesia o tu grupo. Déjanos tu email y te avisamos.',
  },
};

export const SHARE_TEXT =
  'Me sumé a la lista de espera de Bereano, un compañero de estudio bíblico con IA en español. ¡Súmate tú también!';
