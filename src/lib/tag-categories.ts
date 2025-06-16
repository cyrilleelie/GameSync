// Fichier : src/lib/tag-categories.ts (CORRIGÉ)

import { cn } from '@/lib/utils';

export const TAG_CATEGORY_DETAILS = {
  theme: { name: 'Thème', colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  type: { name: 'Type de jeu', colorClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  mechanics: { name: 'Mécanique', colorClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
  interaction: { name: 'Interaction', colorClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
} as const;

export type TagCategoryKey = keyof typeof TAG_CATEGORY_DETAILS;

// L'interface à corriger
export interface TagDefinition {
  id?: string;
  name: string;
  // On s'assure que categoryKey utilise bien le type strict
  categoryKey: TagCategoryKey; 
}

export const getTranslatedTagCategory = (key: string | undefined): string => {
  if (key && key in TAG_CATEGORY_DETAILS) {
    return TAG_CATEGORY_DETAILS[key as TagCategoryKey].name;
  }
  return 'Inconnue';
};

export const getTagCategoryColorClass = (key: string | undefined): string => {
  if (key && key in TAG_CATEGORY_DETAILS) {
    return TAG_CATEGORY_DETAILS[key as TagCategoryKey].colorClass;
  }
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};