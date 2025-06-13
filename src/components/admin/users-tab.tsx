// Fichier : src/components/admin/users-tab.tsx (CORRIGÉ)

'use client';

import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { Player } from '@/lib/types';

// Imports Firebase
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

// Imports UI et icônes
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
// === LA CORRECTION EST ICI ===
import { Edit, Trash2, PlusCircle, Loader2, UserCog } from 'lucide-react'; 
import { cn } from '@/lib/utils';
import { EditUserForm, type UserFormValues } from '@/components/admin/edit-user-form';


export function UsersTab() {
  const { toast } = useToast();
  const [users, setUsers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<Player | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersFromDb = usersSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id }) as Player);
      setUsers(usersFromDb);
    } catch (error) {
      console.error("Erreur de chargement des utilisateurs:", error);
      toast({ title: "Erreur de chargement des utilisateurs", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditDialog = (user: Player) => {
    setUserToEdit(user);
    setIsFormOpen(true);
  };

  const handleSaveUser = async (userData: UserFormValues) => {
    if (!userData.uid) return;
    
    const userDocRef = doc(db, 'users', userData.uid);
    try {
      await setDoc(userDocRef, { role: userData.role }, { merge: true });
      await fetchUsers();
      toast({ title: "Rôle de l'utilisateur mis à jour !" });
    } catch (e) {
      toast({ title: "Erreur lors de la mise à jour", variant: "destructive" });
    } finally {
      setIsFormOpen(false);
      setUserToEdit(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
        await deleteDoc(doc(db, 'users', userId));
        await fetchUsers();
        toast({ title: 'Utilisateur supprimé', description: `${userName} a été supprimé de Firestore.` });
    } catch(e) {
        toast({ title: 'Erreur', description: 'Impossible de supprimer le profil.', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin"/></div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestion des Utilisateurs</CardTitle>
              <CardDescription>Visualiser et gérer les utilisateurs enregistrés.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Avatar</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL} alt={user.displayName} />
                      <AvatarFallback>{(user.displayName || 'U').substring(0,1)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{user.displayName}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'Administrateur' ? 'default' : 'secondary'} className={cn(user.role === 'Administrateur' && 'bg-primary/80 hover:bg-primary/70')}>
                      {user.role || 'Utilisateur'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(user)}>
                      <UserCog className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDeleteUser(user.uid, user.displayName)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur : {userToEdit?.displayName}</DialogTitle>
          </DialogHeader>
          {userToEdit && <EditUserForm userToEdit={userToEdit} onSave={handleSaveUser} onCancel={() => setIsFormOpen(false)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}