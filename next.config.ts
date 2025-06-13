import type { NextConfig } from 'next';

const config: NextConfig = {
  // Vous pouvez avoir d'autres options ici, comme reactStrictMode
  reactStrictMode: true,

  // On ajoute la configuration pour les images externes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        // Le port et le pathname peuvent être laissés vides pour autoriser tout le domaine,
        // ou être plus spécifiques si vous le souhaitez.
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
};

export default config;