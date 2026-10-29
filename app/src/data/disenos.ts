// Diseños para compartir versículos en historias. Cada día se proponen 3 distintos (como Holy
// Bible): el primero es gratis y los otros dos son de Bereano Plus. Cada diseño tiene 3 tonos.
// Sin imports de React Native: lo prueba test/disenos.test.ts.

export const DESIGN_STYLES = [
  { id: 'editorial', name: 'Editorial' },
  { id: 'noche', name: 'Noche' },
  { id: 'papel', name: 'Papel' },
  { id: 'neon', name: 'Neón' },
  { id: 'minimal', name: 'Minimal' },
  { id: 'gigante', name: 'Gigante' },
  { id: 'acuarela', name: 'Acuarela' },
  { id: 'marco', name: 'Clásico' },
  { id: 'dividido', name: 'Dividido' },
  { id: 'cuaderno', name: 'Cuaderno' },
  { id: 'atardecer', name: 'Atardecer' },
  { id: 'tipografico', name: 'Tipográfico' },
] as const;

export type DesignStyle = (typeof DESIGN_STYLES)[number]['id'];
export type Design = { style: DesignStyle; tone: number };
export const TONES = 3;

/** El diseño gratis para compartir cualquier versículo sin Plus. */
export const FREE_DESIGN: Design = { style: 'minimal', tone: 0 };

export function designName(d: Design): string {
  return DESIGN_STYLES.find((s) => s.id === d.style)!.name;
}

export function sameDesign(a: Design, b: Design): boolean {
  return a.style === b.style && a.tone === b.tone;
}

/** Número entero pseudoaleatorio fijo a partir de una semilla (siempre el mismo resultado). */
function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function dayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

/**
 * Los 3 diseños del día. Cada 4 días se recorren los 12 estilos sin repetir (mezclados distinto
 * en cada vuelta) y el tono cambia según el día: el mismo día siempre da lo mismo.
 */
export function designsForDay(date = new Date()): Design[] {
  const day = dayNumber(date);
  const round = Math.floor(day / 4);
  const order = DESIGN_STYLES.map((s, i) => ({ id: s.id, k: rand(round * 31 + i) }))
    .sort((a, b) => a.k - b.k)
    .map((s) => s.id);
  const slot = ((day % 4) + 4) % 4;
  return order
    .slice(slot * 3, slot * 3 + 3)
    .map((style, i) => ({ style, tone: Math.floor(rand(day * 7 + i) * TONES) }));
}

/** Todos los diseños (estilo y tono), para la galería de Plus. */
export const ALL_DESIGNS: Design[] = DESIGN_STYLES.flatMap((s) =>
  Array.from({ length: TONES }, (_, tone) => ({ style: s.id, tone })),
);
