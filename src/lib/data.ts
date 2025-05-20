
import type { Player, GameSession, BoardGame, GameCategory } from './types';
import { fr } from 'date-fns/locale'; // Using fr for availability for consistency, can be adjusted

export const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'Alice Wonderland',
    email: 'alice@example.com',
    avatarUrl: 'https://placehold.co/100x100.png?text=AW',
    gamePreferences: ['Terraforming Mars', 'Wingspan', 'Scythe', 'Azul'],
    availability: 'Weekends, soirs de semaine après 19h',
  },
  {
    id: '2',
    name: 'Bob Le Bricoleur', // Example of a translated name
    email: 'bob@example.com',
    avatarUrl: 'https://placehold.co/100x100.png?text=BB',
    gamePreferences: ['Catan', 'Les Aventuriers du Rail', 'Carcassonne', 'King of Tokyo'],
    availability: 'Flexible, préfère les après-midis',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    avatarUrl: 'https://placehold.co/100x100.png?text=CB',
    gamePreferences: ['Gloomhaven: Les Mâchoires du Lion', 'Pandemic Legacy', 'Spirit Island', 'Codenames'],
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
   {
    id: 'bg7',
    name: 'Pandemic Legacy',
    imageUrl: 'https://placehold.co/300x200.png?text=Pandemic+Legacy',
    category: 'Cooperative',
    description: 'Sauvez le monde d\'une pandémie mondiale évolutive.',
  },
  {
    id: 'bg8',
    name: 'Spirit Island',
    imageUrl: 'https://placehold.co/300x200.png?text=Spirit+Island',
    category: 'Cooperative',
    description: 'Incarnez des esprits ancestraux pour défendre votre île.',
  },
  {
    id: 'bg9',
    name: 'Carcassonne',
    imageUrl: 'https://placehold.co/300x200.png?text=Carcassonne',
    category: 'Family',
    description: 'Construisez un paysage médiéval tuile par tuile.',
  },
  {
    id: 'bg10',
    name: 'Azul',
    imageUrl: 'https://placehold.co/300x200.png?text=Azul',
    category: 'Abstract',
    description: 'Décorez les murs du Palais Royal de Evora.',
  },
  {
    id: 'bg11',
    name: 'Everdell',
    imageUrl: 'https://placehold.co/300x200.png?text=Everdell',
    category: 'Strategy',
    description: 'Construisez une charmante ville de créatures forestières.',
  },
  {
    id: 'bg12',
    name: 'Root',
    imageUrl: 'https://placehold.co/300x200.png?text=Root',
    category: 'Strategy',
    description: 'Guidez votre faction asymétrique à la domination de la forêt.',
  },
  {
    id: 'bg13',
    name: 'The Quacks of Quedlinburg',
    imageUrl: 'https://placehold.co/300x200.png?text=Quacks+Of+Q',
    category: 'Family',
    description: 'Préparez des potions magiques en tirant des ingrédients d\'un sac.',
  },
  {
    id: 'bg14',
    name: '7 Wonders Duel',
    imageUrl: 'https://placehold.co/300x200.png?text=7+Wonders+Duel',
    category: 'Strategy',
    description: 'Construisez des merveilles et menez votre civilisation à la victoire (pour 2 joueurs).',
  },
  {
    id: 'bg15',
    name: 'Codenames',
    imageUrl: 'https://placehold.co/300x200.png?text=Codenames',
    category: 'Party',
    description: 'Donnez des indices d\'un mot pour faire deviner vos agents secrets.',
  },
  {
    id: 'bg16',
    name: 'Cascadia',
    imageUrl: 'https://placehold.co/300x200.png?text=Cascadia',
    category: 'Abstract',
    description: 'Créez un écosystème diversifié dans le Nord-Ouest Pacifique.',
  },
  {
    id: 'bg17',
    name: 'Brass: Birmingham',
    imageUrl: 'https://placehold.co/300x200.png?text=Brass+Birmingham',
    category: 'Strategy',
    description: 'Développez votre réseau industriel pendant la révolution industrielle anglaise.',
  },
  {
    id: 'bg18',
    name: 'Lost Ruins of Arnak',
    imageUrl: 'https://placehold.co/300x200.png?text=Arnak',
    category: 'Strategy', // Often Strategy/Deck-building/Worker Placement
    description: 'Explorez une île inhabitée, trouvez des artéfacts et affrontez des gardiens.',
  },
  {
    id: 'bg19',
    name: 'King of Tokyo',
    imageUrl: 'https://placehold.co/300x200.png?text=King+Of+Tokyo',
    category: 'Party',
    description: 'Incarnez des monstres gigantesques et battez-vous pour contrôler Tokyo.',
  },
  {
    id: 'bg20',
    name: 'Patchwork',
    imageUrl: 'https://placehold.co/300x200.png?text=Patchwork',
    category: 'Abstract',
    description: 'Créez la plus belle couverture en assemblant des pièces de tissu (pour 2 joueurs).',
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
    category: getBoardGameByName('Terraforming Mars')?.category,
    duration: '3-4 heures',
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
    category: getBoardGameByName('Wingspan')?.category,
    duration: 'Environ 90 minutes',
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
    category: getBoardGameByName('Catan')?.category,
    duration: '60-90 minutes',
  },
  {
    id: 's4',
    gameName: 'Gloomhaven: Les Mâchoires du Lion',
    gameImageUrl: getBoardGameByName('Gloomhaven: Les Mâchoires du Lion')?.imageUrl,
    dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    location: 'Sous-sol de Bob',
    maxPlayers: 4,
    currentPlayers: [mockPlayers[1], mockPlayers[0], mockPlayers[2]],
    host: mockPlayers[1],
    description: 'Continuons notre campagne des Mâchoires du Lion. Une place disponible !',
    category: getBoardGameByName('Gloomhaven: Les Mâchoires du Lion')?.category,
    duration: 'Par scénario ~2 heures',
  },
];

export const getMockSessionById = (id: string): GameSession | undefined => {
  // Attempt to load from localStorage first, then fall back to mockSessions
  // This is a simplified approach; a real app would fetch from a DB
  const storedSessionsString = typeof window !== 'undefined' ? localStorage.getItem('gameSessions') : null;
  if (storedSessionsString) {
    try {
      const parsedSessions: GameSession[] = JSON.parse(storedSessionsString).map((s: any) => ({
        ...s,
        dateTime: new Date(s.dateTime) // Ensure dateTime is a Date object
      }));
      const foundSession = parsedSessions.find(s => s.id === id);
      if (foundSession) return foundSession;
    } catch (e) {
      console.error("Failed to parse sessions from localStorage in getMockSessionById", e);
    }
  }
  return mockSessions.find(session => session.id === id);
};

export const getMockPlayerById = (id: string): Player | undefined => {
  return mockPlayers.find(player => player.id === id);
};

