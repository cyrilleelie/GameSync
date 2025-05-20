
import type { GameCategory } from './types';

export const categoryTranslations: Record<GameCategory, string> = {
  Strategy: 'Stratégie',
  Party: 'Ambiance',
  Cooperative: 'Coopératif',
  Family: 'Familial',
  Abstract: 'Abstrait',
  Thematic: 'Thématique',
};

export const getTranslatedCategory = (category?: GameCategory): string | undefined => {
  if (!category) {
    return undefined;
  }
  return categoryTranslations[category] || category; // Fallback to original if no translation
};
