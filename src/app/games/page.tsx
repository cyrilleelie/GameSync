
'use client';

import { useState, useMemo, useEffect } from 'react';
import { mockBoardGames } from '@/lib/data';
import type { BoardGame } from '@/lib/types';
import { GameCard } from '@/components/games/game-card';
import { Button } from '@/components/ui/button';
import { LibraryBig, ListFilter, Loader2, X, PlusCircle, Check } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { RequestGameForm } from '@/components/games/request-game-form';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { TAG_CATEGORY_DETAILS, getTranslatedTagCategory, getTagCategoryColorClass, type TagCategoryKey } from '@/lib/tag-categories'; // Updated import
import { cn } from '@/lib/utils';


type SelectedFilters = Record<TagCategoryKey, string[]>;

const initialFilters = (): SelectedFilters => {
  const filters: Partial<SelectedFilters> = {};
  (Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).forEach(key => {
    filters[key] = [];
  });
  return filters as SelectedFilters;
};


export default function GamesPage() {
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(initialFilters());
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !authLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, authLoading, router, isMounted]);

  const allCategorizedTags = useMemo(() => {
    const categorized: Record<TagCategoryKey, Set<string>> = {} as Record<TagCategoryKey, Set<string>>;
    (Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).forEach(key => {
      categorized[key] = new Set<string>();
    });

    mockBoardGames.forEach(game => {
      game.tags?.forEach(tag => {
        if (tag.categoryKey in categorized) {
          categorized[tag.categoryKey].add(tag.name);
        }
      });
    });
    
    const result: Record<TagCategoryKey, string[]> = {} as Record<TagCategoryKey, string[]>;
    (Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).forEach(key => {
      result[key] = Array.from(categorized[key]).sort((a,b) => a.localeCompare(b, 'fr'));
    });
    return result;
  }, []);


  const activeSelectedTags = useMemo(() => {
    return Object.entries(selectedFilters).flatMap(([categoryKey, tags]) => 
      tags.map(tagName => ({
        categoryKey: categoryKey as TagCategoryKey,
        categoryName: getTranslatedTagCategory(categoryKey as TagCategoryKey),
        tagName: tagName
      }))
    );
  }, [selectedFilters]);

  const filteredGames = useMemo(() => {
    const allSelectedTagNames = Object.values(selectedFilters).flat();
    if (allSelectedTagNames.length === 0) {
      return mockBoardGames;
    }
    return mockBoardGames.filter(game => {
      if (!game.tags || game.tags.length === 0) return false;
      // Check if the game has at least one tag from EACH category that has active filters
      return (Object.keys(selectedFilters) as TagCategoryKey[]).every(categoryKey => {
        const categorySelectedTags = selectedFilters[categoryKey];
        if (categorySelectedTags.length === 0) return true; // No filter for this category, so it passes
        return game.tags.some(gameTag => gameTag.categoryKey === categoryKey && categorySelectedTags.includes(gameTag.name));
      });
    });
  }, [selectedFilters]);

  const handleTagSelection = (categoryKey: TagCategoryKey, tagName: string, isChecked: boolean) => {
    setSelectedFilters(prevFilters => {
      const currentTagsForCategory = prevFilters[categoryKey] || [];
      let newTagsForCategory;
      if (isChecked) {
        newTagsForCategory = [...currentTagsForCategory, tagName];
      } else {
        newTagsForCategory = currentTagsForCategory.filter(t => t !== tagName);
      }
      return {
        ...prevFilters,
        [categoryKey]: newTagsForCategory,
      };
    });
  };

  const resetFilters = () => {
    setSelectedFilters(initialFilters());
  };

  const removeTagFromFilter = (categoryKey: TagCategoryKey, tagName: string) => {
    handleTagSelection(categoryKey, tagName, false);
  };


  if (!isMounted || authLoading || (!currentUser && !authLoading && isMounted)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LibraryBig className="h-8 w-8 text-primary" />
            Bibliothèque de Jeux
          </h1>
          <p className="text-muted-foreground">Découvrez tous les jeux disponibles sur GameSync.</p>
        </div>
        <div className="flex gap-2">
            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" className="relative">
                        <ListFilter className="mr-2 h-4 w-4" />
                        Filtrer
                        {activeSelectedTags.length > 0 && (
                            <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-1">
                                {activeSelectedTags.length}
                            </Badge>
                        )}
                    </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md flex flex-col">
                    <SheetHeader>
                        <SheetTitle>Filtrer les Jeux</SheetTitle>
                        <SheetDescription>
                            Affinez votre recherche par catégories de tags.
                        </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="flex-grow my-4 pr-6 -mr-6">
                        <div className="space-y-6">
                            {(Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).map(categoryKey => {
                                const categoryName = getTranslatedTagCategory(categoryKey);
                                const tagsInCategory = allCategorizedTags[categoryKey];
                                if (!tagsInCategory || tagsInCategory.length === 0) return null;

                                return (
                                    <div key={categoryKey}>
                                        <h4 className="text-md font-semibold mb-2 text-primary">{categoryName}</h4>
                                        <div className="space-y-2">
                                            {tagsInCategory.map(tagName => (
                                                <div key={tagName} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`${categoryKey}-${tagName}`}
                                                        checked={selectedFilters[categoryKey]?.includes(tagName)}
                                                        onCheckedChange={(checked) => handleTagSelection(categoryKey, tagName, !!checked)}
                                                    />
                                                    <Label htmlFor={`${categoryKey}-${tagName}`} className="font-normal text-sm">
                                                        {tagName}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                    <SheetFooter className="mt-auto pt-4 border-t">
                        <Button variant="outline" onClick={resetFilters} className="w-full sm:w-auto">
                            <X className="mr-2 h-4 w-4" />
                            Réinitialiser les filtres
                        </Button>
                        <SheetClose asChild>
                            <Button className="w-full sm:w-auto">Appliquer</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
            <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Demander un jeu
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Demander l'ajout d'un jeu</DialogTitle>
                        <DialogDescription>
                            Le jeu que vous cherchez n'est pas dans la liste ? Remplissez ce formulaire pour nous le faire savoir.
                        </DialogDescription>
                    </DialogHeader>
                    <RequestGameForm onSubmitSuccess={() => setIsRequestDialogOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
      </div>
      
      {activeSelectedTags.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium mr-2 self-center">Filtres actifs:</p>
          {activeSelectedTags.map(({ categoryKey, categoryName, tagName }) => (
            <Badge 
              key={`${categoryKey}-${tagName}`} 
              className={cn("flex items-center gap-1 pr-1 font-normal", getTagCategoryColorClass(categoryKey))}
            >
              <span className="font-semibold opacity-80">{getTranslatedTagCategory(categoryKey)}:</span> {tagName}
              <button
                type="button"
                onClick={() => removeTagFromFilter(categoryKey, tagName)}
                className="ml-1 rounded-full hover:bg-black/20 dark:hover:bg-white/20 p-0.5"
                aria-label={`Retirer ${tagName} de la catégorie ${categoryName}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
           <Button variant="link" onClick={resetFilters} className="p-0 h-auto text-xs">Tout effacer</Button>
        </div>
      )}


      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} showCreateSessionButton={false} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            {activeSelectedTags.length > 0
              ? `Aucun jeu ne correspond aux filtres sélectionnés.`
              : "Aucun jeu dans la bibliothèque pour le moment."}
          </p>
          {activeSelectedTags.length > 0 && (
            <Button variant="link" onClick={resetFilters} className="mt-2">
              Voir tous les jeux
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
