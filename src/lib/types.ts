
import type { TagDefinition } from './tag-categories';

export type UserRole = 'Administrateur' | 'Joueur';

export interface Player {
  id: string;
  name: string;
  email?: string; 
  avatarUrl?: string;
  gamePreferences: string[]; 
  ownedGames?: string[]; 
  wishlist?: string[]; 
  availability: string; 
  role: UserRole; 
}

export interface GameSession {
  id: string;
  gameName: string;
  gameImageUrl?: string;
  dateTime: Date;
  location: string;
  maxPlayers: number;
  currentPlayers: Player[];
  description?: string;
  host: Player;
  duration?: string; 
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

