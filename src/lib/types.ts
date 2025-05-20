
export interface Player {
  id: string;
  name: string;
  email?: string; // Ajout de l'email
  avatarUrl?: string;
  gamePreferences: string[]; // list of game names
  availability: string; // textual description
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
  // category?: string; // Supprimé
  duration?: string; // Nouvelle propriété pour la durée
}

// export type GameCategory = "Strategy" | "Party" | "Cooperative" | "Family" | "Abstract" | "Thematic"; // Supprimé

// For Smart Scheduler form
// Commenté car la page smart-scheduler a été supprimée
// export interface SmartSchedulerFormData {
//   gameName: string;
//   playerPreferences: string; // Raw text input, each player on new line
//   suggestedLocations: string; // Raw text input, each location on new line
// }

export interface BoardGame {
  id: string;
  name: string;
  imageUrl: string;
  tags?: string[]; // Remplacé category par tags
  description?: string;
}
