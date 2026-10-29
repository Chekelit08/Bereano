import type { ComponentType, Ref } from 'react';
import type { ViewInstance } from 'react-native';

import type { Design, DesignStyle } from '@/data/disenos';
import type { Marks } from '@/data/marcas';

import { type CardProps } from './cards/base';
import { Editorial, Neon, Noche, Papel } from './cards/clasicos';
import {
  Acuarela,
  Atardecer,
  Cuaderno,
  Dividido,
  Gigante,
  Marco,
  Minimal,
  Tipografico,
} from './cards/nuevos';

export { CARD_HEIGHT, CARD_WIDTH } from './cards/base';

const TEMPLATES: Record<DesignStyle, ComponentType<CardProps>> = {
  editorial: Editorial,
  noche: Noche,
  papel: Papel,
  neon: Neon,
  minimal: Minimal,
  gigante: Gigante,
  acuarela: Acuarela,
  marco: Marco,
  dividido: Dividido,
  cuaderno: Cuaderno,
  atardecer: Atardecer,
  tipografico: Tipografico,
};

type Props = { design: Design; text: string; reference: string; marks?: Marks; ref?: Ref<ViewInstance> };

/** Imagen de un versículo para historias. El texto siempre sale de la Biblia de la app. */
export function StoryCard({ design, ...props }: Props) {
  const Template = TEMPLATES[design.style];
  return <Template tone={design.tone} {...props} />;
}
