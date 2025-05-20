
export type UserRole = 'Administrateur' | 'Joueur';

export interface Player {
  id: string;
  name: string;
  email?: string; // Ajout de l'email
  avatarUrl?: string;
  gamePreferences: string[]; // list of game names
  availability: string; // textual description
  role: UserRole; // Ajout du champ role
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
  duration?: string; // Nouvelle propriété pour la durée
}

export interface BoardGame {
  id: string;
  name: string;
  imageUrl: string;
  tags?: string[]; // Remplacé category par tags
  description?: string;
}
