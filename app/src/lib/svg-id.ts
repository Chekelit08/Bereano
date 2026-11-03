import { useId } from 'react';

/**
 * Id único para degradés de SVG. En la web las pantallas quedan montadas aunque estén ocultas: si dos
 * SVG usan el mismo id, Chrome toma el de la pantalla oculta y el degradé no se pinta.
 */
export function useSvgId(): string {
  return useId().replace(/[^a-zA-Z0-9]/g, '');
}
