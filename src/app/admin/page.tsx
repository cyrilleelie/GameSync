
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ShieldAlert, ShieldCheck, ListOrdered, Tags, Users, PlusCircle, Edit, Trash2, Gamepad2, Columns, Filter, X, Search, Building, CalendarDays, Check as CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockBoardGames } from '@/lib/data';
import type { BoardGame, TagDefinition } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { TAG_CATEGORY_DETAILS, getTagCategoryColorClass, getTranslatedTagCategory, type TagCategoryKey } from '@/lib/tag-categories';
import { cn } from '@/lib/utils';
import { EditGameForm, type GameFormValues } from '@/components/admin/edit-game-form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger as SelectTriggerPrimitive, SelectValue } from "@/components/ui/select";


const initialTagFilters = (): Record<TagCategoryKey, string[]> => {
  const filters: Partial<Record<TagCategoryKey, string[]>> = {};
  (Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).forEach(key => {
    filters[key] = [];
  });
  return filters as Record<TagCategoryKey, string[]>;
};

const calculateUniqueTags = (games: BoardGame[]): TagDefinition[] => {
  const tagSet = new Set<string>();
  const uniqueTags: TagDefinition[] = [];
  games.forEach(game => {
    game.tags?.forEach(tag => {
      const tagKey = `${tag.categoryKey}::${tag.name}`;
      if (!tagSet.has(tagKey)) {
        tagSet.add(tagKey);
        uniqueTags.push(tag);
      }
    });
  });
  return uniqueTags.sort((a, b) => {
    const categoryComparison = String(a.categoryKey).localeCompare(String(b.categoryKey));
    if (categoryComparison !== 0) return categoryComparison;
    return a.name.localeCompare(b.name);
  });
};

const CREATE_NEW_CATEGORY_VALUE = "--create-new-category--";

export default function AdminPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const [adminGamesList, setAdminGamesList] = useState<BoardGame[]>(mockBoardGames);
  const [isGameFormDialogOpen, setIsGameFormDialogOpen] = useState(false);
  const [currentGameToEdit, setCurrentGameToEdit] = useState<BoardGame | null>(null);
  const [isAddingGame, setIsAddingGame] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState({
    tags: true,
    description: true,
    publisher: true,
    publicationYear: true,
  });

  // Filters state
  const [adminGameSearchQuery, setAdminGameSearchQuery] = useState('');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [descriptionFilter, setDescriptionFilter] = useState<'all' | 'with' | 'without'>('all');
  const [selectedTagFilters, setSelectedTagFilters] = useState<Record<string, string[]>>(initialTagFilters());

  // Tag Management State
  const [managedUniqueTags, setManagedUniqueTags] = useState<TagDefinition[]>([]);
  const [editingTagKey, setEditingTagKey] = useState<string | null>(null);
  const [editedTagName, setEditedTagName] = useState('');
  const [editedTagCategory, setEditedTagCategory] = useState<TagCategoryKey | string>('');
  
  const [isAddTagDialogOpen, setIsAddTagDialogOpen] = useState(false);
  const [newTagNameInput, setNewTagNameInput] = useState('');
  const [newTagCategoryInput, setNewTagCategoryInput] = useState<TagCategoryKey | string>('');
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryNameInput, setNewCategoryNameInput] = useState('');
  const [tagCategoryFilter, setTagCategoryFilter] = useState<string>('all');


  useEffect(() => {
    setIsMounted(true);
    setManagedUniqueTags(calculateUniqueTags(adminGamesList));
  }, [adminGamesList]); 

  useEffect(() => {
    if (isMounted && !authLoading) {
      if (!currentUser) {
        router.push('/login');
      } else if (currentUser.role !== 'Administrateur') {
        setAccessDenied(true);
      }
    }
  }, [currentUser, authLoading, router, isMounted]);

  const allCategorizedTagsForGames = useMemo(() => {
    const categorized: Record<string, Set<string>> = {};
    (Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).forEach(key => {
      categorized[key] = new Set<string>();
    });

    adminGamesList.forEach(game => {
      game.tags?.forEach(tag => {
        if (tag.categoryKey in categorized) {
          categorized[tag.categoryKey].add(tag.name);
        }
      });
    });
    
    const result: Record<string, string[]> = {};
    (Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).forEach(key => {
      result[key] = Array.from(categorized[key]).sort((a,b) => a.localeCompare(b, 'fr'));
    });
    return result;
  }, [adminGamesList]);

  const activeTagFilterBadges = useMemo(() => {
    return Object.entries(selectedTagFilters).flatMap(([categoryKey, tags]) => 
      tags.map(tagName => ({
        categoryKey: categoryKey as TagCategoryKey, // Cast for display purposes
        categoryName: getTranslatedTagCategory(categoryKey),
        tagName: tagName
      }))
    );
  }, [selectedTagFilters]);
  
  const handleTagSelection = (categoryKey: string, tagName: string, isChecked: boolean) => {
    setSelectedTagFilters(prevFilters => {
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

  const removeTagFromFilterBadge = (categoryKey: string, tagName: string) => {
    handleTagSelection(categoryKey, tagName, false);
  };

  const resetAllFilters = () => {
    setAdminGameSearchQuery('');
    setDescriptionFilter('all');
    setSelectedTagFilters(initialTagFilters() as Record<string, string[]>);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (adminGameSearchQuery) count++;
    if (descriptionFilter !== 'all') count++;
    if (activeTagFilterBadges.length > 0) count++; 
    return count;
  }, [adminGameSearchQuery, descriptionFilter, activeTagFilterBadges]);


  const displayedGames = useMemo(() => {
    let games = [...adminGamesList];

    if (adminGameSearchQuery) {
      games = games.filter(game => 
        game.name.toLowerCase().includes(adminGameSearchQuery.toLowerCase())
      );
    }
    
    games = games.filter(game => {
      if (descriptionFilter === 'with') {
        return !!game.description && game.description.trim() !== '';
      }
      if (descriptionFilter === 'without') {
        return !game.description || game.description.trim() === '';
      }
      return true; 
    });

    const anyTagFilterActive = Object.values(selectedTagFilters).some(tags => tags.length > 0);
    if (anyTagFilterActive) {
      games = games.filter(game => {
        if (!game.tags || game.tags.length === 0) return false;
        return (Object.keys(selectedTagFilters) as string[]).every(categoryKey => {
          const categorySelectedTags = selectedTagFilters[categoryKey];
          if (categorySelectedTags.length === 0) return true; 
          return game.tags!.some(gameTag => 
            gameTag.categoryKey === categoryKey && categorySelectedTags.includes(gameTag.name)
          );
        });
      });
    }
    return games;
  }, [adminGamesList, adminGameSearchQuery, descriptionFilter, selectedTagFilters]);


  const handleOpenAddGameDialog = () => {
    setIsAddingGame(true);
    setCurrentGameToEdit(null); 
    setIsGameFormDialogOpen(true);
  };

  const handleOpenEditGameDialog = (game: BoardGame) => {
    setIsAddingGame(false);
    setCurrentGameToEdit(game);
    setIsGameFormDialogOpen(true);
  };

  const handleSaveGame = (gameData: GameFormValues) => {
    if (isAddingGame || !gameData.id) { 
      const newGame: BoardGame = {
        id: 'bg' + Date.now().toString(), 
        name: gameData.name,
        imageUrl: gameData.imageUrl || `https://placehold.co/300x200.png?text=${encodeURIComponent(gameData.name)}`,
        tags: gameData.tags || [],
        description: gameData.description || '',
        publisher: gameData.publisher || '',
        publicationYear: gameData.publicationYear === undefined ? undefined : Number(gameData.publicationYear),
      };
      setAdminGamesList(prevGames => {
        const updatedGames = [newGame, ...prevGames];
        setManagedUniqueTags(calculateUniqueTags(updatedGames));
        return updatedGames;
      });
      toast({
        title: "Jeu Ajouté",
        description: `Le jeu "${newGame.name}" a été ajouté à la liste.`,
      });
    } else { 
      setAdminGamesList(prevGames => {
        const updatedGames = prevGames.map(g => (g.id === gameData.id ? { 
          ...g, 
          ...gameData, 
          description: gameData.description || g.description || '',
          publisher: gameData.publisher || g.publisher || '',
          publicationYear: gameData.publicationYear === undefined ? g.publicationYear : Number(gameData.publicationYear),
        } as BoardGame : g));
        setManagedUniqueTags(calculateUniqueTags(updatedGames));
        return updatedGames;
      });
      toast({
        title: "Jeu Modifié",
        description: `Les données du jeu "${gameData.name}" ont été mises à jour.`,
      });
    }
    setIsGameFormDialogOpen(false);
    setCurrentGameToEdit(null);
    setIsAddingGame(false);
  };

  const handleCloseGameFormDialog = () => {
    setIsGameFormDialogOpen(false);
    setCurrentGameToEdit(null);
    setIsAddingGame(false);
  };

  const handleDeleteGame = (gameName: string) => {
    toast({
      title: "Fonctionnalité à venir",
      description: `La suppression du jeu "${gameName}" sera bientôt disponible.`,
    });
  };

  const handleOpenAddTagDialog = () => {
    setNewTagNameInput('');
    setNewTagCategoryInput('');
    setNewCategoryNameInput('');
    setIsCreatingNewCategory(false);
    setIsAddTagDialogOpen(true);
  };

  const handleConfirmAddTag = () => {
    if (!newTagNameInput.trim()) {
      toast({ title: "Nom du Tag Requis", description: "Veuillez entrer un nom pour le nouveau tag.", variant: "destructive" });
      return;
    }

    let finalCategoryKey = newTagCategoryInput;
    let finalCategoryName = newTagCategoryInput;

    if (newTagCategoryInput === CREATE_NEW_CATEGORY_VALUE) {
      if (!newCategoryNameInput.trim()) {
        toast({ title: "Nom de Catégorie Requis", description: "Veuillez entrer un nom pour la nouvelle catégorie.", variant: "destructive" });
        return;
      }
      finalCategoryKey = newCategoryNameInput.trim().toLowerCase().replace(/\s+/g, '-'); // Simple slugification
      finalCategoryName = newCategoryNameInput.trim();
    } else if (!newTagCategoryInput) {
       toast({ title: "Catégorie Requise", description: "Veuillez sélectionner ou créer une catégorie pour le nouveau tag.", variant: "destructive" });
      return;
    }

    const existingTag = managedUniqueTags.find(
      tag => tag.name.toLowerCase() === newTagNameInput.trim().toLowerCase() && tag.categoryKey === finalCategoryKey
    );

    if (existingTag) {
      toast({
        title: "Tag Existant",
        description: `Un tag nommé "${newTagNameInput.trim()}" dans la catégorie "${getTranslatedTagCategory(finalCategoryKey)}" existe déjà.`,
        variant: "destructive",
      });
      return;
    }

    const newTag: TagDefinition = { name: newTagNameInput.trim(), categoryKey: finalCategoryKey };
    setManagedUniqueTags(prevTags => [...prevTags, newTag].sort((a, b) => {
      const categoryComparison = String(a.categoryKey).localeCompare(String(b.categoryKey));
      if (categoryComparison !== 0) return categoryComparison;
      return a.name.localeCompare(b.name);
    }));
    
    toast({
      title: "Tag Ajouté (Simulation)",
      description: `Le tag "${newTag.name}" (cat: ${getTranslatedTagCategory(finalCategoryKey)}) a été ajouté à cette liste. Note: Cela n'affecte pas les jeux existants et les nouvelles catégories sont temporaires.`,
    });
    setIsAddTagDialogOpen(false);
  };
  
  const handleStartEditTag = (tag: TagDefinition) => {
    setEditingTagKey(`${tag.categoryKey}::${tag.name}`);
    setEditedTagName(tag.name);
    setEditedTagCategory(tag.categoryKey);
  };

  const handleCancelEditTag = () => {
    setEditingTagKey(null);
    setEditedTagName('');
    setEditedTagCategory('');
  };

  const handleSaveTagEdit = () => {
    if (!editedTagName.trim() || !editedTagCategory) {
      toast({ title: "Erreur", description: "Le nom et la catégorie du tag ne peuvent pas être vides.", variant: "destructive" });
      return;
    }

    const originalTagKey = editingTagKey;
    if (!originalTagKey) return;

    const [originalCategory, originalName] = originalTagKey.split('::');

    // Cannot change category to a new, non-predefined one during edit in this simplified version
    if (!Object.keys(TAG_CATEGORY_DETAILS).includes(editedTagCategory as TagCategoryKey) && editedTagCategory !== originalCategory) {
         toast({
            title: "Modification de catégorie limitée",
            description: "La modification vers une catégorie entièrement nouvelle n'est pas prise en charge ici. Veuillez utiliser les catégories existantes ou annuler.",
            variant: "destructive",
        });
        return;
    }


    const conflict = managedUniqueTags.find(
      (t) => t.name === editedTagName && t.categoryKey === editedTagCategory && 
             (t.name !== originalName || t.categoryKey !== originalCategory)
    );

    if (conflict) {
      toast({
        title: "Conflit de Tag",
        description: `Un tag nommé "${editedTagName}" dans la catégorie "${getTranslatedTagCategory(editedTagCategory)}" existe déjà.`,
        variant: "destructive",
      });
      return;
    }
    
    setManagedUniqueTags(prevTags => 
      prevTags.map(t => 
        (t.name === originalName && t.categoryKey === originalCategory) 
        ? { name: editedTagName, categoryKey: editedTagCategory } 
        : t
      ).sort((a, b) => {
        const categoryComparison = String(a.categoryKey).localeCompare(String(b.categoryKey));
        if (categoryComparison !== 0) return categoryComparison;
        return a.name.localeCompare(b.name);
      })
    );

    toast({
      title: "Tag Modifié (Simulation)",
      description: `Le tag "${originalName}" a été modifié en "${editedTagName}" (cat: ${getTranslatedTagCategory(editedTagCategory)}). Note : Cette modification est visuelle et n'affecte pas les jeux existants.`,
    });
    setEditingTagKey(null);
  };

  const handleDeleteTag = (tagToDelete: TagDefinition) => {
    setManagedUniqueTags(prevTags => prevTags.filter(t => !(t.name === tagToDelete.name && t.categoryKey === tagToDelete.categoryKey)));
    toast({
      title: "Tag Supprimé (Simulation)",
      description: `Le tag "${tagToDelete.name}" a été supprimé de cette liste. Note : Cette suppression est visuelle et n'affecte pas les jeux existants.`,
    });
  };

  const displayedManagedTags = useMemo(() => {
    if (tagCategoryFilter === 'all') {
      return managedUniqueTags;
    }
    return managedUniqueTags.filter(tag => tag.categoryKey === tagCategoryFilter);
  }, [managedUniqueTags, tagCategoryFilter]);


  if (!isMounted || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
              <ShieldAlert className="h-8 w-8" /> Accès Refusé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <Button onClick={() => router.push('/')} className="mt-6">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!currentUser || currentUser.role !== 'Administrateur') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p>Vérification des permissions...</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-primary" />
              Panneau d'Administration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="games" className="w-full">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6">
                <TabsTrigger value="games" className="text-base py-2 sm:text-sm">
                  <ListOrdered className="mr-2 h-5 w-5 sm:h-4 sm:w-4" /> Jeux
                </TabsTrigger>
                <TabsTrigger value="tags" className="text-base py-2 sm:text-sm">
                  <Tags className="mr-2 h-5 w-5 sm:h-4 sm:w-4" /> Tags
                </TabsTrigger>
                <TabsTrigger value="users" className="text-base py-2 sm:text-sm">
                  <Users className="mr-2 h-5 w-5 sm:h-4 sm:w-4" /> Utilisateurs
                </TabsTrigger>
              </TabsList>
              <TabsContent value="games">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-grow">
                        <CardTitle>Gestion des Jeux</CardTitle>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Rechercher un jeu..."
                            className="pl-8 w-full"
                            value={adminGameSearchQuery}
                            onChange={(e) => setAdminGameSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2 justify-end sm:justify-start">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Columns className="mr-2 h-4 w-4" />
                                Colonnes
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Colonnes Visibles</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuCheckboxItem
                                checked={visibleColumns.tags}
                                onCheckedChange={(checked) =>
                                  setVisibleColumns((prev) => ({ ...prev, tags: !!checked }))
                                }
                              >
                                Tags
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem
                                checked={visibleColumns.description}
                                onCheckedChange={(checked) =>
                                  setVisibleColumns((prev) => ({ ...prev, description: !!checked }))
                                }
                              >
                                Description
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem
                                checked={visibleColumns.publisher}
                                onCheckedChange={(checked) =>
                                  setVisibleColumns((prev) => ({ ...prev, publisher: !!checked }))
                                }
                              >
                                Éditeur
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem
                                checked={visibleColumns.publicationYear}
                                onCheckedChange={(checked) =>
                                  setVisibleColumns((prev) => ({ ...prev, publicationYear: !!checked }))
                                }
                              >
                                Année
                              </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                              <SheetTrigger asChild>
                                  <Button variant="outline" size="sm" className="relative">
                                      <Filter className="mr-2 h-4 w-4" />
                                      Filtrer
                                      {activeFilterCount > 0 && (
                                          <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-1 text-xs">
                                              {activeFilterCount}
                                          </Badge>
                                      )}
                                  </Button>
                              </SheetTrigger>
                              <SheetContent className="w-full sm:max-w-md flex flex-col">
                                  <SheetHeader>
                                      <SheetTitle>Filtrer les Jeux</SheetTitle>
                                      <SheetDescription>
                                          Affinez votre recherche par description et par tags.
                                      </SheetDescription>
                                  </SheetHeader>
                                  <ScrollArea className="flex-grow my-4 pr-6 -mr-6">
                                      <div className="space-y-6">
                                          <div>
                                              <h4 className="text-md font-semibold mb-2 text-primary">Filtrer par description</h4>
                                              <RadioGroup value={descriptionFilter} onValueChange={(value) => setDescriptionFilter(value as 'all' | 'with' | 'without')}>
                                                  <div className="flex items-center space-x-2">
                                                      <RadioGroupItem value="all" id="desc-all" />
                                                      <Label htmlFor="desc-all" className="font-normal">Tous</Label>
                                                  </div>
                                                  <div className="flex items-center space-x-2">
                                                      <RadioGroupItem value="with" id="desc-with" />
                                                      <Label htmlFor="desc-with" className="font-normal">Avec description</Label>
                                                  </div>
                                                  <div className="flex items-center space-x-2">
                                                      <RadioGroupItem value="without" id="desc-without" />
                                                      <Label htmlFor="desc-without" className="font-normal">Sans description</Label>
                                                  </div>
                                              </RadioGroup>
                                          </div>
                                          <DropdownMenuSeparator/>
                                          {(Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).map(categoryKey => {
                                              const categoryName = getTranslatedTagCategory(categoryKey);
                                              const tagsInCategory = allCategorizedTagsForGames[categoryKey];
                                              if (!tagsInCategory || tagsInCategory.length === 0) return null;

                                              return (
                                                  <div key={categoryKey}>
                                                      <h4 className="text-md font-semibold mb-2 text-primary">{categoryName}</h4>
                                                      <div className="space-y-2">
                                                          {tagsInCategory.map(tagName => (
                                                              <div key={tagName} className="flex items-center space-x-2">
                                                                  <Checkbox
                                                                      id={`admin-filter-${categoryKey}-${tagName.replace(/\s+/g, '-')}`}
                                                                      checked={(selectedTagFilters[categoryKey] || []).includes(tagName)}
                                                                      onCheckedChange={(checked) => handleTagSelection(categoryKey, tagName, !!checked)}
                                                                  />
                                                                  <Label htmlFor={`admin-filter-${categoryKey}-${tagName.replace(/\s+/g, '-')}`} className="font-normal text-sm">
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
                                      <Button variant="outline" onClick={resetAllFilters} className="w-full sm:w-auto">
                                          <X className="mr-2 h-4 w-4" />
                                          Réinitialiser
                                      </Button>
                                      <SheetClose asChild>
                                          <Button className="w-full sm:w-auto">Appliquer</Button>
                                      </SheetClose>
                                  </SheetFooter>
                              </SheetContent>
                          </Sheet>

                          <Button onClick={handleOpenAddGameDialog} size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Ajouter
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {activeTagFilterBadges.length > 0 && (
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium mr-2 self-center text-muted-foreground">Filtres de tags actifs:</p>
                        {activeTagFilterBadges.map(({ categoryKey, tagName }) => (
                          <Badge 
                            key={`${categoryKey}-${tagName}`} 
                            variant="customColor"
                            className={cn("flex items-center gap-1 pr-1 font-normal text-xs", getTagCategoryColorClass(categoryKey))}
                          >
                            <span className="font-semibold opacity-80">{getTranslatedTagCategory(categoryKey)}:</span> {tagName}
                            <button
                              type="button"
                              onClick={() => removeTagFromFilterBadge(categoryKey, tagName)}
                              className="ml-1 rounded-full hover:bg-black/20 dark:hover:bg-white/20 p-0.5"
                              aria-label={`Retirer ${tagName} de la catégorie ${getTranslatedTagCategory(categoryKey)}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px] py-3 font-semibold">Image</TableHead>
                          <TableHead className="min-w-[150px] py-3 font-semibold">Nom</TableHead>
                          {visibleColumns.publisher && <TableHead className="min-w-[120px] py-3 font-semibold">Éditeur</TableHead>}
                          {visibleColumns.publicationYear && <TableHead className="w-[80px] text-center py-3 font-semibold">Année</TableHead>}
                          {visibleColumns.tags && <TableHead className="py-3 font-semibold">Tags</TableHead>}
                          {visibleColumns.description && <TableHead className="min-w-[200px] max-w-[300px] py-3 font-semibold">Description</TableHead>}
                          <TableHead className="w-[100px] text-right py-3 font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayedGames.map((game) => (
                          <TableRow key={game.id}>
                            <TableCell>
                              <div className="relative h-12 w-12 rounded overflow-hidden bg-muted">
                                {game.imageUrl ? (
                                  <Image
                                    src={game.imageUrl}
                                    alt={`Image de ${game.name}`}
                                    fill
                                    sizes="50px"
                                    className="object-cover"
                                    data-ai-hint="board game box"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full w-full">
                                    <Gamepad2 className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{game.name}</TableCell>
                            {visibleColumns.publisher && (
                              <TableCell className="text-xs text-muted-foreground">
                                {game.publisher || <span className="italic">N/A</span>}
                              </TableCell>
                            )}
                            {visibleColumns.publicationYear && (
                              <TableCell className="text-xs text-muted-foreground text-center">
                                {game.publicationYear || <span className="italic">N/A</span>}
                              </TableCell>
                            )}
                            {visibleColumns.tags && (
                              <TableCell>
                                {game.tags && game.tags.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {game.tags.slice(0, 3).map(tag => ( 
                                      <Badge
                                        key={`${tag.categoryKey}-${tag.name}`}
                                        variant="customColor"
                                        className={cn("font-normal text-xs px-1.5 py-0.5", getTagCategoryColorClass(tag.categoryKey))}
                                        title={`${getTranslatedTagCategory(tag.categoryKey)}: ${tag.name}`}
                                      >
                                        {tag.name}
                                      </Badge>
                                    ))}
                                    {game.tags.length > 3 && (
                                      <Badge variant="outline" className="text-xs px-1.5 py-0.5">+{game.tags.length - 3}</Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-xs">Aucun tag</span>
                                )}
                              </TableCell>
                            )}
                            {visibleColumns.description && (
                              <TableCell>
                                {game.description ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <p className="text-xs text-muted-foreground line-clamp-2 cursor-default">
                                        {game.description}
                                      </p>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" align="start" className="max-w-xs break-words">
                                      <p className="text-xs">{game.description}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <span className="text-muted-foreground text-xs italic">N/A</span>
                                )}
                              </TableCell>
                            )}
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleOpenEditGameDialog(game)} title={`Modifier ${game.name}`}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDeleteGame(game.name)} title={`Supprimer ${game.name}`}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {displayedGames.length === 0 && (
                       <p className="text-muted-foreground text-center py-4">
                        {adminGamesList.length === 0 
                          ? "Aucun jeu dans la base de données pour le moment."
                          : "Aucun jeu ne correspond à vos filtres ou à votre recherche."}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="tags">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="flex-grow">
                             <CardTitle>Gestion des Tags</CardTitle>
                             <CardDescription>Gérez les tags et leurs catégories.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-48"> {/* Adjust width as needed */}
                                <Select value={tagCategoryFilter} onValueChange={setTagCategoryFilter}>
                                    <SelectTriggerPrimitive className="h-9 text-sm">
                                        <SelectValue placeholder="Filtrer par catégorie" />
                                    </SelectTriggerPrimitive>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes les catégories</SelectItem>
                                        {(Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).map(catKey => (
                                        <SelectItem key={catKey} value={catKey}>
                                            {getTranslatedTagCategory(catKey)}
                                        </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleOpenAddTagDialog} size="sm">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Ajouter un Tag
                            </Button>
                        </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {displayedManagedTags.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-semibold">Nom du Tag</TableHead>
                            <TableHead className="font-semibold">Catégorie</TableHead>
                            <TableHead className="text-right font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {displayedManagedTags.map((tag) => {
                            const currentTagKey = `${tag.categoryKey}::${tag.name}`;
                            const isEditing = editingTagKey === currentTagKey;
                            return (
                              <TableRow key={currentTagKey}>
                                <TableCell>
                                  {isEditing ? (
                                    <Input
                                      value={editedTagName}
                                      onChange={(e) => setEditedTagName(e.target.value)}
                                      className="h-8 text-sm"
                                    />
                                  ) : (
                                    tag.name
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isEditing ? (
                                    <Select 
                                      value={editedTagCategory} 
                                      onValueChange={(value) => setEditedTagCategory(value as TagCategoryKey | string)}
                                    >
                                      <SelectTriggerPrimitive className="h-8 text-sm">
                                        <SelectValue placeholder="Choisir catégorie" />
                                      </SelectTriggerPrimitive>
                                      <SelectContent>
                                        {(Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).map(catKey => (
                                          <SelectItem key={catKey} value={catKey}>
                                            {getTranslatedTagCategory(catKey)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Badge
                                      variant="customColor"
                                      className={cn("font-normal text-xs px-1.5 py-0.5", getTagCategoryColorClass(tag.categoryKey))}
                                    >
                                      {getTranslatedTagCategory(tag.categoryKey)}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {isEditing ? (
                                    <>
                                      <Button variant="ghost" size="icon" onClick={handleSaveTagEdit} title="Sauvegarder">
                                        <CheckIcon className="h-4 w-4 text-green-600" />
                                      </Button>
                                      <Button variant="ghost" size="icon" onClick={handleCancelEditTag} title="Annuler">
                                        <X className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button variant="ghost" size="icon" onClick={() => handleStartEditTag(tag)} title={`Modifier le tag ${tag.name}`}>
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDeleteTag(tag)} title={`Supprimer le tag ${tag.name}`}>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        {tagCategoryFilter === 'all' && managedUniqueTags.length === 0 
                          ? "Aucun tag utilisé dans les jeux pour le moment."
                          : `Aucun tag ne correspond à la catégorie "${getTranslatedTagCategory(tagCategoryFilter)}".`}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>Gestion des Utilisateurs</CardTitle>
                    <CardDescription>Visualiser et gérer les utilisateurs.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-muted-foreground">Fonctionnalité à venir...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Dialog open={isGameFormDialogOpen} onOpenChange={setIsGameFormDialogOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {isAddingGame ? "Ajouter un nouveau jeu" : `Modifier le jeu : ${currentGameToEdit?.name || ''}`}
              </DialogTitle>
              <DialogDescription>
                {isAddingGame ? "Remplissez les informations du nouveau jeu ci-dessous." : "Modifiez les informations du jeu ci-dessous."}
              </DialogDescription>
            </DialogHeader>
            <EditGameForm
              gameToEdit={isAddingGame ? null : currentGameToEdit}
              onSave={handleSaveGame}
              onCancel={handleCloseGameFormDialog}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isAddTagDialogOpen} onOpenChange={setIsAddTagDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un Nouveau Tag</DialogTitle>
              <DialogDescription>
                Entrez le nom et sélectionnez ou créez la catégorie pour le nouveau tag.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-tag-name" className="text-right">
                  Nom du Tag
                </Label>
                <Input
                  id="new-tag-name"
                  value={newTagNameInput}
                  onChange={(e) => setNewTagNameInput(e.target.value)}
                  className="col-span-3"
                  placeholder="Nom du tag"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-tag-category-select" className="text-right">
                  Catégorie
                </Label>
                <Select 
                    value={newTagCategoryInput} 
                    onValueChange={(value) => {
                        setNewTagCategoryInput(value);
                        setIsCreatingNewCategory(value === CREATE_NEW_CATEGORY_VALUE);
                        if (value !== CREATE_NEW_CATEGORY_VALUE) {
                            setNewCategoryNameInput('');
                        }
                    }}
                >
                  <SelectTriggerPrimitive id="new-tag-category-select" className="col-span-3 h-9">
                    <SelectValue placeholder="Choisir Catégorie" />
                  </SelectTriggerPrimitive>
                  <SelectContent>
                    {(Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).map(key => (
                      <SelectItem key={key} value={key}>
                        {getTranslatedTagCategory(key)}
                      </SelectItem>
                    ))}
                    <SelectItem value={CREATE_NEW_CATEGORY_VALUE}>-- Créer une nouvelle catégorie --</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {isCreatingNewCategory && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="new-category-name-input" className="text-right">
                        Nom Nv. Cat.
                    </Label>
                    <Input
                        id="new-category-name-input"
                        value={newCategoryNameInput}
                        onChange={(e) => setNewCategoryNameInput(e.target.value)}
                        className="col-span-3"
                        placeholder="Nom de la nouvelle catégorie"
                    />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddTagDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="button" onClick={handleConfirmAddTag}>
                Confirmer l'Ajout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </TooltipProvider>
  );
}
