import type { Player, GameSession } from './types';
import { fr } from 'date-fns/locale'; // Using fr for availability for consistency, can be adjusted

export const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'Alice Wonderland',
    avatarUrl: 'https://placehold.co/100x100.png',
    gamePreferences: ['Terraforming Mars', 'Wingspan', 'Scythe'],
    availability: 'Weekends, soirs de semaine après 19h',
  },
  {
    id: '2',
    name: 'Bob Le Bricoleur', // Example of a translated name
    avatarUrl: 'https://placehold.co/100x100.png',
    gamePreferences: ['Catan', 'Les Aventuriers du Rail', 'Carcassonne'], // Ticket to Ride translated
    availability: 'Flexible, préfère les après-midis',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    gamePreferences: ['Gloomhaven', 'Pandemic Legacy', 'Spirit Island'],
    availability: 'Samedis uniquement',
  },
];

export const mockSessions: GameSession[] = [
  {
    id: 's1',
    gameName: 'Terraforming Mars',
    gameImageUrl: 'https://placehold.co/300x200.png',
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
    gameImageUrl: 'https://placehold.co/300x200.png',
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
    gameImageUrl: 'https://placehold.co/300x200.png',
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
    gameImageUrl: 'https://placehold.co/300x200.png',
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
