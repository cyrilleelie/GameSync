
export const TAG_CATEGORIES = {
  type: 'Type de Jeu / Public Cible',
  theme: 'Thématique / Univers',
  mechanics: 'Mécaniques Principales',
  interaction: 'Interaction entre Joueurs',
} as const;

export type TagCategoryKey = keyof typeof TAG_CATEGORIES;

export interface TagDefinition {
  name: string;
  categoryKey: TagCategoryKey;
}

// Helper pour obtenir le nom traduit d'une catégorie de tag
export function getTranslatedTagCategory(categoryKey: TagCategoryKey): string {
  return TAG_CATEGORIES[categoryKey] || categoryKey;
}
