
export const TAG_CATEGORY_DETAILS = {
  type: {
    name: 'Type de Jeu / Public Cible',
    colorClass: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-500',
  },
  theme: {
    name: 'Thématique / Univers',
    colorClass: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-700 dark:text-green-200 dark:border-green-500',
  },
  mechanics: {
    name: 'Mécaniques Principales',
    colorClass: 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-700 dark:text-sky-200 dark:border-sky-500',
  },
  interaction: {
    name: 'Interaction entre Joueurs',
    colorClass: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-700 dark:text-yellow-200 dark:border-yellow-500',
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
