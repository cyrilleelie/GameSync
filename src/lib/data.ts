
import type { Player, GameSession, BoardGame } from './types';
import type { TagDefinition, TagCategoryKey } from './tag-categories';

export const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'Alice Wonderland',
    email: 'alice@example.com',
    avatarUrl: 'https://placehold.co/100x100.png?text=AW',
    gamePreferences: ['Terraforming Mars', 'Wingspan', 'Scythe', 'Azul'],
    ownedGames: ['Terraforming Mars', 'Wingspan', 'Catan', 'Gloomhaven: Les Mâchoires du Lion'],
    wishlist: ['Brass: Birmingham', 'Everdell'],
    availability: 'Weekends, soirs de semaine après 19h',
    role: 'Administrateur',
  },
  {
    id: '2',
    name: 'Bob Le Bricoleur',
    email: 'bob@example.com',
    avatarUrl: 'https://placehold.co/100x100.png?text=BB',
    gamePreferences: ['Catan', 'Les Aventuriers du Rail', 'Carcassonne', 'King of Tokyo'],
    ownedGames: ['Les Aventuriers du Rail', 'Carcassonne', 'Azul'],
    wishlist: ['Scythe', 'Root'],
    availability: 'Flexible, préfère les après-midis',
    role: 'Joueur',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    avatarUrl: 'https://placehold.co/100x100.png?text=CB',
    gamePreferences: ['Gloomhaven: Les Mâchoires du Lion', 'Pandemic Legacy', 'Spirit Island', 'Codenames'],
    ownedGames: ['Spirit Island', 'Codenames', 'Patchwork'],
    wishlist: ['Terraforming Mars', 'Wingspan', '7 Wonders Duel'],
    availability: 'Samedis uniquement',
    role: 'Joueur',
  },
];

export const mockBoardGames: BoardGame[] = [
  {
    id: 'bg1',
    name: 'Terraforming Mars',
    imageUrl: 'https://placehold.co/300x200.png?text=Terraforming+Mars',
    tags: [
      { name: 'Stratégie', categoryKey: 'mechanics' },
      { name: 'Science-Fiction', categoryKey: 'theme' },
      { name: 'Économie', categoryKey: 'theme' },
      { name: 'Construction de Moteur', categoryKey: 'mechanics' },
      { name: 'Placement de Tuiles', categoryKey: 'mechanics' },
      { name: 'Initié', categoryKey: 'type' },
    ],
    description: 'Colonisez Mars et transformez la planète rouge !',
  },
  {
    id: 'bg2',
    name: 'Wingspan',
    imageUrl: 'https://placehold.co/300x200.png?text=Wingspan',
    tags: [
      { name: 'Stratégie', categoryKey: 'mechanics' },
      { name: 'Collection', categoryKey: 'mechanics' },
      { name: 'Nature', categoryKey: 'theme' },
      { name: 'Animaux', categoryKey: 'theme' },
      { name: 'Construction de Moteur', categoryKey: 'mechanics' },
      { name: 'Initié', categoryKey: 'type' },
    ],
    description: 'Attirez une variété d\'oiseaux dans votre volière.',
  },
  {
    id: 'bg3',
    name: 'Catan',
    imageUrl: 'https://placehold.co/300x200.png?text=Catan',
    tags: [
      { name: 'Familial', categoryKey: 'type' },
      { name: 'Négociation', categoryKey: 'mechanics' },
      { name: 'Développement', categoryKey: 'theme' }, // ou mechanics?
      { name: 'Réseaux', categoryKey: 'mechanics' },
    ],
    description: 'Commercez et construisez pour devenir le maître de Catan.',
  },
  {
    id: 'bg4',
    name: 'Gloomhaven: Les Mâchoires du Lion',
    imageUrl: 'https://placehold.co/300x200.png?text=Gloomhaven+JOTL',
    tags: [
      { name: 'Coopératif', categoryKey: 'mechanics' },
      { name: 'Aventure', categoryKey: 'theme' },
      { name: 'Fantasy', categoryKey: 'theme' },
      { name: 'Campagne', categoryKey: 'mechanics' },
      { name: 'Legacy', categoryKey: 'mechanics' },
      { name: 'Expert', categoryKey: 'type' },
    ],
    description: 'Une aventure coopérative dans un monde fantastique.',
  },
  {
    id: 'bg5',
    name: 'Les Aventuriers du Rail',
    imageUrl: 'https://placehold.co/300x200.png?text=Aventuriers+Rail',
    tags: [
      { name: 'Familial', categoryKey: 'type' },
      { name: 'Trains', categoryKey: 'theme' },
      { name: 'Réseaux', categoryKey: 'mechanics' },
      { name: 'Collection', categoryKey: 'mechanics' },
    ],
    description: 'Construisez des liaisons ferroviaires à travers le pays.',
  },
  {
    id: 'bg6',
    name: 'Scythe',
    imageUrl: 'https://placehold.co/300x200.png?text=Scythe',
    tags: [
      { name: 'Stratégie', categoryKey: 'mechanics' },
      { name: 'Exploration', categoryKey: 'mechanics' },
      { name: 'Contrôle de Territoire', categoryKey: 'mechanics' },
      { name: 'Fantasy', categoryKey: 'theme' }, // Dieselpunk fantasy
      { name: 'Expert', categoryKey: 'type' },
    ],
    description: 'Menez votre faction à la victoire dans une Europe alternative des années 1920.',
  },
   {
    id: 'bg7',
    name: 'Pandemic Legacy',
    imageUrl: 'https://placehold.co/300x200.png?text=Pandemic+Legacy',
    tags: [
      { name: 'Coopératif', categoryKey: 'mechanics' },
      { name: 'Legacy', categoryKey: 'mechanics' },
      { name: 'Campagne', categoryKey: 'mechanics' },
      { name: 'Initié', categoryKey: 'type' },
    ],
    description: 'Sauvez le monde d\'une pandémie mondiale évolutive.',
  },
  {
    id: 'bg8',
    name: 'Spirit Island',
    imageUrl: 'https://placehold.co/300x200.png?text=Spirit+Island',
    tags: [
      { name: 'Coopératif', categoryKey: 'mechanics' },
      { name: 'Stratégie', categoryKey: 'mechanics' },
      { name: 'Expert', categoryKey: 'type' },
      { name: 'Asymétrique', categoryKey: 'mechanics' },
      { name: 'Gestion de main', categoryKey: 'mechanics' },
    ],
    description: 'Incarnez des esprits ancestraux pour défendre votre île.',
  },
  {
    id: 'bg9',
    name: 'Carcassonne',
    imageUrl: 'https://placehold.co/300x200.png?text=Carcassonne',
    tags: [
      { name: 'Familial', categoryKey: 'type' },
      { name: 'Placement de Tuiles', categoryKey: 'mechanics' },
      { name: 'Médiéval', categoryKey: 'theme' },
      { name: 'Contrôle de Territoire', categoryKey: 'mechanics' },
    ],
    description: 'Construisez un paysage médiéval tuile par tuile.',
  },
  {
    id: 'bg10',
    name: 'Azul',
    imageUrl: 'https://placehold.co/300x200.png?text=Azul',
    tags: [
      { name: 'Abstrait', categoryKey: 'type' },
      { name: 'Placement de Tuiles', categoryKey: 'mechanics' },
      { name: 'Puzzle', categoryKey: 'mechanics' },
      { name: 'Familial', categoryKey: 'type' },
    ],
    description: 'Décorez les murs du Palais Royal de Evora.',
  },
  {
    id: 'bg11',
    name: 'Everdell',
    imageUrl: 'https://placehold.co/300x200.png?text=Everdell',
    tags: [
      { name: 'Stratégie', categoryKey: 'mechanics' },
      { name: 'Placement d\'ouvriers', categoryKey: 'mechanics' },
      { name: 'Animaux', categoryKey: 'theme' },
      { name: 'Nature', categoryKey: 'theme' },
      { name: 'Construction de Moteur', categoryKey: 'mechanics' },
      { name: 'Initié', categoryKey: 'type' },
    ],
    description: 'Construisez une charmante ville de créatures forestières.',
  },
  {
    id: 'bg12',
    name: 'Root',
    imageUrl: 'https://placehold.co/300x200.png?text=Root',
    tags: [
      { name: 'Stratégie', categoryKey: 'mechanics' },
      { name: 'Asymétrique', categoryKey: 'mechanics' },
      { name: 'Contrôle de Territoire', categoryKey: 'mechanics' },
      { name: 'Interaction Directe', categoryKey: 'interaction' },
      { name: 'Animaux', categoryKey: 'theme' },
      { name: 'Expert', categoryKey: 'type' },
    ],
    description: 'Guidez votre faction asymétrique à la domination de la forêt.',
  },
  {
    id: 'bg13',
    name: 'The Quacks of Quedlinburg',
    imageUrl: 'https://placehold.co/300x200.png?text=Quacks+Of+Q',
    tags: [
      { name: 'Familial', categoryKey: 'type' },
      { name: 'Stop ou Encore', categoryKey: 'mechanics' },
      { name: 'Bag Building', categoryKey: 'mechanics' },
      { name: 'Initié', categoryKey: 'type' },
    ],
    description: 'Préparez des potions magiques en tirant des ingrédients d\'un sac.',
  },
  {
    id: 'bg14',
    name: '7 Wonders Duel',
    imageUrl: 'https://placehold.co/300x200.png?text=7+Wonders+Duel',
    tags: [
      { name: 'Stratégie', categoryKey: 'mechanics' },
      { name: 'Deux Joueurs', categoryKey: 'type' },
      { name: 'Draft', categoryKey: 'mechanics' },
      { name: 'Historique', categoryKey: 'theme' },
    ],
    description: 'Construisez des merveilles et menez votre civilisation à la victoire (pour 2 joueurs).',
  },
  {
    id: 'bg15',
    name: 'Codenames',
    imageUrl: 'https://placehold.co/300x200.png?text=Codenames',
    tags: [
      { name: 'Ambiance', categoryKey: 'type' },
      { name: 'Déduction', categoryKey: 'mechanics' },
      { name: 'Mots', categoryKey: 'mechanics' },
      { name: 'Familial', categoryKey: 'type' },
    ],
    description: 'Donnez des indices d\'un mot pour faire deviner vos agents secrets.',
  },
  {
    id: 'bg16',
    name: 'Cascadia',
    imageUrl: 'https://placehold.co/300x200.png?text=Cascadia',
    tags: [
      { name: 'Abstrait', categoryKey: 'type' },
      { name: 'Puzzle', categoryKey: 'mechanics' },
      { name: 'Nature', categoryKey: 'theme' },
      { name: 'Placement de Tuiles', categoryKey: 'mechanics' },
      { name: 'Familial', categoryKey: 'type' },
    ],
    description: 'Créez un écosystème diversifié dans le Nord-Ouest Pacifique.',
  },
  {
    id: 'bg17',
    name: 'Brass: Birmingham',
    imageUrl: 'https://placehold.co/300x200.png?text=Brass+Birmingham',
    tags: [
      { name: 'Stratégie', categoryKey: 'mechanics' },
      { name: 'Économie', categoryKey: 'theme' },
      { name: 'Expert', categoryKey: 'type' },
      { name: 'Réseaux', categoryKey: 'mechanics' },
      { name: 'Historique', categoryKey: 'theme' },
    ],
    description: 'Développez votre réseau industriel pendant la révolution industrielle anglaise.',
  },
  {
    id: 'bg18',
    name: 'Lost Ruins of Arnak',
    imageUrl: 'https://placehold.co/300x200.png?text=Arnak',
    tags: [
      { name: 'Stratégie', categoryKey: 'mechanics' },
      { name: 'Deck Building', categoryKey: 'mechanics' },
      { name: 'Exploration', categoryKey: 'mechanics' },
      { name: 'Placement d\'ouvriers', categoryKey: 'mechanics' },
      { name: 'Aventure', categoryKey: 'theme' },
      { name: 'Initié', categoryKey: 'type' },
    ],
    description: 'Explorez une île inhabitée, trouvez des artéfacts et affrontez des gardiens.',
  },
  {
    id: 'bg19',
    name: 'King of Tokyo',
    imageUrl: 'https://placehold.co/300x200.png?text=King+Of+Tokyo',
    tags: [
      { name: 'Ambiance', categoryKey: 'type' },
      { name: 'Dés', categoryKey: 'mechanics' },
      { name: 'Interaction Directe', categoryKey: 'interaction' },
      { name: 'Familial', categoryKey: 'type' },
    ],
    description: 'Incarnez des monstres gigantesques et battez-vous pour contrôler Tokyo.',
  },
  {
    id: 'bg20',
    name: 'Patchwork',
    imageUrl: 'https://placehold.co/300x200.png?text=Patchwork',
    tags: [
      { name: 'Abstrait', categoryKey: 'type' },
      { name: 'Deux Joueurs', categoryKey: 'type' },
      { name: 'Puzzle', categoryKey: 'mechanics' },
      { name: 'Placement de Tuiles', categoryKey: 'mechanics' },
    ],
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
    dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), 
    location: 'Chez Alice, Pays des Merveilles',
    maxPlayers: 4,
    currentPlayers: [mockPlayers[0]],
    host: mockPlayers[0],
    description: 'Recherche 3 autres joueurs pour une partie de Terraforming Mars. Débutants bienvenus !',
    duration: '3-4 heures',
  },
  {
    id: 's2',
    gameName: 'Wingspan',
    gameImageUrl: getBoardGameByName('Wingspan')?.imageUrl,
    dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), 
    location: 'La Boutique de Jeux Amicale, Centre-ville',
    maxPlayers: 5,
    currentPlayers: [mockPlayers[1], mockPlayers[0]],
    host: mockPlayers[1],
    description: 'Rejoignez-nous pour une partie relaxante de Wingspan. Nous avons des cookies !',
    duration: 'Environ 90 minutes',
  },
  {
    id: 's3',
    gameName: 'Catan',
    gameImageUrl: getBoardGameByName('Catan')?.imageUrl,
    dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
    location: 'Centre Communautaire, Salle B',
    maxPlayers: 4,
    currentPlayers: [mockPlayers[2]],
    host: mockPlayers[2],
    duration: '60-90 minutes',
  },
  {
    id: 's4',
    gameName: 'Gloomhaven: Les Mâchoires du Lion',
    gameImageUrl: getBoardGameByName('Gloomhaven: Les Mâchoires du Lion')?.imageUrl,
    dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 
    location: 'Sous-sol de Bob',
    maxPlayers: 4,
    currentPlayers: [mockPlayers[1], mockPlayers[0], mockPlayers[2]],
    host: mockPlayers[1],
    description: 'Continuons notre campagne des Mâchoires du Lion. Une place disponible !',
    duration: 'Par scénario ~2 heures',
  },
];

export const getMockSessionById = (id: string): GameSession | undefined => {
  const storedSessionsString = typeof window !== 'undefined' ? localStorage.getItem('gameSessions') : null;
  if (storedSessionsString) {
    try {
      const parsedSessions: GameSession[] = JSON.parse(storedSessionsString).map((s: any) => ({
        ...s,
        dateTime: new Date(s.dateTime) 
      }));
      const foundSession = parsedSessions.find(s => s.id === id);
      if (foundSession) return foundSession;
    } catch (e) {
      console.error("Failed to parse sessions from localStorage in getMockSessionById", e);
    }
  }
  const mockSession = mockSessions.find(session => session.id === id);
  if (mockSession) {
    return {...mockSession, dateTime: new Date(mockSession.dateTime)};
  }
  return undefined;
};


export const getMockPlayerById = (id: string): Player | undefined => {
  return mockPlayers.find(player => player.id === id);
};
