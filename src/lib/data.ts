
import type { Player, GameSession, BoardGame, GameCategory } from './types';
import { fr } from 'date-fns/locale'; // Using fr for availability for consistency, can be adjusted

export const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'Alice Wonderland',
    email: 'alice@example.com',
    avatarUrl: 'https://placehold.co/100x100.png?text=AW',
    gamePreferences: ['Terraforming Mars', 'Wingspan', 'Scythe'],
    availability: 'Weekends, soirs de semaine après 19h',
  },
  {
    id: '2',
    name: 'Bob Le Bricoleur', // Example of a translated name
    email: 'bob@example.com',
    avatarUrl: 'https://placehold.co/100x100.png?text=BB',
    gamePreferences: ['Catan', 'Les Aventuriers du Rail', 'Carcassonne'], // Ticket to Ride translated
    availability: 'Flexible, préfère les après-midis',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    avatarUrl: 'https://placehold.co/100x100.png?text=CB',
    gamePreferences: ['Gloomhaven', 'Pandemic Legacy', 'Spirit Island'],
    availability: 'Samedis uniquement',
  },
];

export const mockBoardGames: BoardGame[] = [
  {
    id: 'bg1',
    name: 'Terraforming Mars',
    imageUrl: 'https://placehold.co/300x200.png?text=Terraforming+Mars',
    category: 'Strategy',
    description: 'Colonisez Mars et transformez la planète rouge !',
  },
  {
    id: 'bg2',
    name: 'Wingspan',
    imageUrl: 'https://placehold.co/300x200.png?text=Wingspan',
    category: 'Strategy',
    description: 'Attirez une variété d\'oiseaux dans votre volière.',
  },
  {
    id: 'bg3',
    name: 'Catan',
    imageUrl: 'https://placehold.co/300x200.png?text=Catan',
    category: 'Family',
    description: 'Commercez et construisez pour devenir le maître de Catan.',
  },
  {
    id: 'bg4',
    name: 'Gloomhaven: Les Mâchoires du Lion',
    imageUrl: 'https://placehold.co/300x200.png?text=Gloomhaven+JOTL',
    category: 'Cooperative',
    description: 'Une aventure coopérative dans un monde fantastique.',
  },
  {
    id: 'bg5',
    name: 'Les Aventuriers du Rail',
    imageUrl: 'https://placehold.co/300x200.png?text=Aventuriers+Rail',
    category: 'Family',
    description: 'Construisez des liaisons ferroviaires à travers le pays.',
  },
  {
    id: 'bg6',
    name: 'Scythe',
    imageUrl: 'https://placehold.co/300x200.png?text=Scythe',
    category: 'Strategy',
    description: 'Menez votre faction à la victoire dans une Europe alternative des années 1920.',
  },
];

export const getBoardGameByName = (name: string): BoardGame | undefined => {
  return mockBoardGames.find(game => game.name === name);
};


export const mockSessions: GameSession[] = [
  {
    id: 's1',
    gameName: 'Terraforming Mars',
    gameImageUrl: getBoardGameByName('Terraforming Mars')?.imageUrl,
    dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    location: 'Chez Alice, Pays des Merveilles',
    maxPlayers: 4,
    currentPlayers: [mockPlayers[0]],
    host: mockPlayers[0],
    description: 'Recherche 3 autres joueurs pour une partie de Terraforming Mars. Débutants bienvenus !',
    category: 'Stratégie',
  },
  {
    id: 's2',
    gameName: 'Wingspan',
    gameImageUrl: getBoardGameByName('Wingspan')?.imageUrl,
    dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    location: 'La Boutique de Jeux Amicale, Centre-ville',
    maxPlayers: 5,
    currentPlayers: [mockPlayers[1], mockPlayers[0]],
    host: mockPlayers[1],
    description: 'Rejoignez-nous pour une partie relaxante de Wingspan. Nous avons des cookies !',
    category: 'Stratégie',
  },
  {
    id: 's3',
    gameName: 'Catan',
    gameImageUrl: getBoardGameByName('Catan')?.imageUrl,
    dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    location: 'Centre Communautaire, Salle B',
    maxPlayers: 4,
    currentPlayers: [mockPlayers[2]],
    host: mockPlayers[2],
    category: 'Famille',
  },
  {
    id: 's4',
    gameName: 'Gloomhaven: Les Mâchoires du Lion', // Translated game name
    gameImageUrl: getBoardGameByName('Gloomhaven: Les Mâchoires du Lion')?.imageUrl,
    dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    location: 'Sous-sol de Bob',
    maxPlayers: 4,
    currentPlayers: [mockPlayers[1], mockPlayers[0], mockPlayers[2]],
    host: mockPlayers[1],
    description: 'Continuons notre campagne des Mâchoires du Lion. Une place disponible !',
    category: 'Coopératif',
  },
];

export const getMockSessionById = (id: string): GameSession | undefined => {
  return mockSessions.find(session => session.id === id);
};

export const getMockPlayerById = (id: string): Player | undefined => {
  return mockPlayers.find(player => player.id === id);
};
