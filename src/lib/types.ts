// Fichier : src/lib/types.ts (FINAL ET CORRIGÉ)

import type { TagDefinition } from './tag-categories';

export type UserRole = 'Administrateur' | 'Utilisateur';

// Le nouveau type Player qui correspond à nos données Firebase
export type Player = {
  uid: string; // L'ID de l'authentification, clé primaire
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  
  // Champs personnalisés du profil
  bio?: string;
  availability?: string;
  gamePreferences?: string[];
  ownedGames?: string[];
  wishlist?: string[];
  
  createdAt: any; // Peut être un Timestamp ou une string ISO
};

// On ajoute l'ID optionnel qui vient de la base de données
export interface GameSession {
  id: string; 
  gameName: string;
  gameImageUrl?: string;
  dateTime: Date | string; // Peut être une Date ou une string ISO
  location: string;
  maxPlayers: number;
  currentPlayers: Player[];
  description?: string;
  host: Player;
  duration?: string; 
  participantIds?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface BoardGame {
  id: string;
  name: string;
  imageUrl: string;
  tags?: TagDefinition[];
  description?: string;
  publisher?: string;
  publicationYear?: number;
}