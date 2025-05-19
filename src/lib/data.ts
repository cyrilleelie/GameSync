import type { Player, GameSession } from './types';

export const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'Alice Wonderland',
    avatarUrl: 'https://placehold.co/100x100.png',
    gamePreferences: ['Terraforming Mars', 'Wingspan', 'Scythe'],
    availability: 'Weekends, weekday evenings after 7 PM',
  },
  {
    id: '2',
    name: 'Bob The Builder',
    avatarUrl: 'https://placehold.co/100x100.png',
    gamePreferences: ['Catan', 'Ticket to Ride', 'Carcassonne'],
    availability: 'Flexible, prefers afternoons',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    gamePreferences: ['Gloomhaven', 'Pandemic Legacy', 'Spirit Island'],
    availability: 'Saturdays only',
  },
];

export const mockSessions: GameSession[] = [
  {
    id: 's1',
    gameName: 'Terraforming Mars',
    gameImageUrl: 'https://placehold.co/300x200.png',
    dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    location: 'Alice\'s Place, Wonderland',
    maxPlayers: 4,
    currentPlayers: [mockPlayers[0]],
    host: mockPlayers[0],
    description: 'Looking for 3 more players for a game of Terraforming Mars. Beginners welcome!',
    category: 'Strategy',
  },
  {
    id: 's2',
    gameName: 'Wingspan',
    gameImageUrl: 'https://placehold.co/300x200.png',
    dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    location: 'The Friendly LGS, Downtown',
    maxPlayers: 5,
    currentPlayers: [mockPlayers[1], mockPlayers[0]],
    host: mockPlayers[1],
    description: 'Join us for a relaxing game of Wingspan. We have cookies!',
    category: 'Strategy',
  },
  {
    id: 's3',
    gameName: 'Catan',
    gameImageUrl: 'https://placehold.co/300x200.png',
    dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    location: 'Community Center, Room B',
    maxPlayers: 4,
    currentPlayers: [mockPlayers[2]],
    host: mockPlayers[2],
    category: 'Family',
  },
  {
    id: 's4',
    gameName: 'Gloomhaven: Jaws of the Lion',
    gameImageUrl: 'https://placehold.co/300x200.png',
    dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    location: 'Bob\'s Basement',
    maxPlayers: 4,
    currentPlayers: [mockPlayers[1], mockPlayers[0], mockPlayers[2]],
    host: mockPlayers[1],
    description: 'Continuing our Jaws of the Lion campaign. One spot open!',
    category: 'Cooperative',
  },
];

export const getMockSessionById = (id: string): GameSession | undefined => {
  return mockSessions.find(session => session.id === id);
};

export const getMockPlayerById = (id: string): Player | undefined => {
  return mockPlayers.find(player => player.id === id);
};
