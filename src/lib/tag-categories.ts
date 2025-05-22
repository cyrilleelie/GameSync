
export const TAG_CATEGORY_DETAILS = {
  type: {
    name: 'Type de Jeu / Public Cible',
    colorClass: 'bg-[var(--color-1)] text-neutral-800 border-[var(--color-1)] dark:bg-neutral-800 dark:text-[var(--color-1)] dark:border-[var(--color-1)]',
  },
  theme: {
    name: 'Thématique / Univers',
    colorClass: 'bg-[var(--color-2)] text-neutral-800 border-[var(--color-2)] dark:bg-neutral-800 dark:text-[var(--color-2)] dark:border-[var(--color-2)]',
  },
  mechanics: {
    name: 'Mécaniques Principales',
    colorClass: 'bg-[var(--color-3)] text-neutral-800 border-[var(--color-3)] dark:bg-neutral-800 dark:text-[var(--color-3)] dark:border-[var(--color-3)]',
  },
  interaction: {
    name: 'Interaction entre Joueurs',
    colorClass: 'bg-[var(--color-4)] text-neutral-800 border-[var(--color-4)] dark:bg-neutral-800 dark:text-[var(--color-4)] dark:border-[var(--color-4)]',
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
