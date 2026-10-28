// Líneas de ayuda en crisis. IMPORTANTE (CLAUDE.md): verificar cada número antes de publicar.
// Última revisión: pendiente (Ezequiel).
export type HelpLine = { name: string; phone: string; note?: string };

export const HELP_LINES: Record<string, { country: string; lines: HelpLine[] }> = {
  US: {
    country: 'Estados Unidos',
    lines: [
      {
        name: '988 Línea de Prevención del Suicidio y Crisis',
        phone: '988',
        note: 'Marcá 2 para español. También por SMS al 988.',
      },
    ],
  },
  ES: { country: 'España', lines: [{ name: 'Línea de atención a la conducta suicida', phone: '024' }] },
  AR: {
    country: 'Argentina',
    lines: [
      {
        name: 'Centro de Asistencia al Suicida',
        phone: '135',
        note: 'Gratis desde CABA y Gran Buenos Aires. Desde el resto del país: (011) 5275-1135.',
      },
    ],
  },
  MX: { country: 'México', lines: [{ name: 'Línea de la Vida', phone: '800 911 2000' }] },
  CL: { country: 'Chile', lines: [{ name: 'Línea de prevención del suicidio', phone: '*4141' }] },
};

export const EMERGENCY = { US: '911', MX: '911', AR: '911', CL: '131', ES: '112' } as Record<string, string>;
