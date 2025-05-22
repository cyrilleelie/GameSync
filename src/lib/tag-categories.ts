
export const TAG_CATEGORY_DETAILS = {
  type: {
    name: 'Type de Jeu / Public Cible',
    colorClass: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-700 dark:text-blue-200 dark:border-blue-500',
  },
  theme: {
    name: 'Thématique / Univers',
    colorClass: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-700 dark:text-emerald-200 dark:border-emerald-500',
  },
  mechanics: {
    name: 'Mécaniques Principales',
    colorClass: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-700 dark:text-amber-200 dark:border-amber-500',
  },
  interaction: {
    name: 'Interaction entre Joueurs',
    colorClass: 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-700 dark:text-rose-200 dark:border-rose-500',
  },
} as const;

export type TagCategoryKey = keyof typeof TAG_CATEGORY_DETAILS;

export interface TagDefinition {
  name: string;
  categoryKey: TagCategoryKey;
}

// Helper pour obtenir le nom traduit d'une catégorie de tag
export function getTranslatedTagCategory(categoryKey: TagCategoryKey): string {
  return TAG_CATEGORY_DETAILS[categoryKey]?.name || categoryKey;
}

// Helper pour obtenir les classes de couleur d'une catégorie de tag
export function getTagCategoryColorClass(categoryKey: TagCategoryKey): string {
  return TAG_CATEGORY_DETAILS[categoryKey]?.colorClass || 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500'; // Fallback
}
