export type Moment = 'alba' | 'dia' | 'tarde' | 'noche';

export function momentOf(date = new Date()): Moment {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'alba';
  if (h >= 12 && h < 17) return 'dia';
  if (h >= 17 && h < 20) return 'tarde';
  return 'noche';
}

export const GREETING: Record<Moment, string> = {
  alba: 'Buenos días',
  dia: 'Buenas tardes',
  tarde: 'Buenas tardes',
  noche: 'Buenas noches',
};
