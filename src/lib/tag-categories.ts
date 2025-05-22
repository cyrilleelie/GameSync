
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
  categoryKey: TagCategoryKey | string; // Allow string for ad-hoc categories
}

// Helper pour obtenir le nom traduit d'une catégorie de tag
export function getTranslatedTagCategory(categoryKey: TagCategoryKey | string): string {
  if (categoryKey in TAG_CATEGORY_DETAILS) {
    return TAG_CATEGORY_DETAILS[categoryKey as TagCategoryKey]?.name || String(categoryKey);
  }
  return String(categoryKey); // Return the key itself if not found
}

// Helper pour obtenir les classes de couleur d'une catégorie de tag
export function getTagCategoryColorClass(categoryKey: TagCategoryKey | string): string {
  if (categoryKey in TAG_CATEGORY_DETAILS) {
    return TAG_CATEGORY_DETAILS[categoryKey as TagCategoryKey]?.colorClass || 'bg-gray-200 text-gray-800 border-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500'; // Fallback for known keys with missing colorClass
  }
  // Default color for ad-hoc/unknown categories
  return 'bg-muted text-muted-foreground border-border dark:bg-muted/50 dark:text-muted-foreground/70 dark:border-border';
}
