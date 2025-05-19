
export interface Player {
  id: string;
  name: string;
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
  category?: string; // e.g., Strategy, Party, Co-op. For potential future filtering.
}

export type GameCategory = "Strategy" | "Party" | "Cooperative" | "Family" | "Abstract" | "Thematic";

// For Smart Scheduler form
export interface SmartSchedulerFormData {
  gameName: string;
  playerPreferences: string; // Raw text input, each player on new line
  suggestedLocations: string; // Raw text input, each location on new line
}
