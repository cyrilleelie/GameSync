
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ShieldAlert, ShieldCheck, ListOrdered, Tags, Users, PlusCircle, Edit, Trash2, Gamepad2, Columns, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { mockBoardGames } from '@/lib/data';
import type { BoardGame } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { getTagCategoryColorClass, getTranslatedTagCategory } from '@/lib/tag-categories';
import { cn } from '@/lib/utils';
import { EditGameForm, type GameFormValues } from '@/components/admin/edit-game-form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


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
  });

  const [descriptionFilter, setDescriptionFilter] = useState<'all' | 'with' | 'without'>('all');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !authLoading) {
      if (!currentUser) {
        router.push('/login');
      } else if (currentUser.role !== 'Administrateur') {
        setAccessDenied(true);
      }
    }
  }, [currentUser, authLoading, router, isMounted]);

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
      };
      setAdminGamesList(prevGames => [newGame, ...prevGames]);
      toast({
        title: "Jeu Ajouté",
        description: `Le jeu "${newGame.name}" a été ajouté à la liste.`,
      });
    } else { 
      setAdminGamesList(prevGames =>
        prevGames.map(g => (g.id === gameData.id ? { ...g, ...gameData, description: gameData.description || g.description || '' } as BoardGame : g))
      );
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

  const displayedGames = useMemo(() => {
    return adminGamesList.filter(game => {
      if (descriptionFilter === 'with') {
        return !!game.description && game.description.trim() !== '';
      }
      if (descriptionFilter === 'without') {
        return !game.description || game.description.trim() === '';
      }
      return true; // 'all'
    });
  }, [adminGamesList, descriptionFilter]);


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
            <CardDescription>
              Gérez les données de l'application GameSync.
            </CardDescription>
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
                      <div>
                        <CardTitle>Gestion des Jeux</CardTitle>
                        <CardDescription>Ajoutez, modifiez ou supprimez des jeux de société.</CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
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
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Filter className="mr-2 h-4 w-4" />
                              Filtrer
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filtrer par description</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={descriptionFilter} onValueChange={(value) => setDescriptionFilter(value as 'all' | 'with' | 'without')}>
                              <DropdownMenuRadioItem value="all">Tous</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="with">Avec description</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="without">Sans description</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={handleOpenAddGameDialog} size="sm">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px] py-3">Image</TableHead>
                          <TableHead className="min-w-[200px] py-3">Nom</TableHead>
                          {visibleColumns.tags && <TableHead className="py-3">Tags</TableHead>}
                          {visibleColumns.description && <TableHead className="min-w-[250px] max-w-[350px] py-3">Description</TableHead>}
                          <TableHead className="w-[150px] text-right py-3">Actions</TableHead>
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
                          : "Aucun jeu ne correspond à vos filtres."}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="tags">
                <Card>
                  <CardHeader>
                    <CardTitle>Gestion des Tags</CardTitle>
                    <CardDescription>CRUD pour les tags et leurs catégories.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-muted-foreground">Fonctionnalité à venir...</p>
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
      </div>
    </TooltipProvider>
  );
}

    