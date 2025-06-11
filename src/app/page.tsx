// Fichier : app/sessions/page.tsx (MIS À JOUR)

import SessionsPageClient from '../components/sessions/sessions-page-client';

const SessionsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Toutes les sessions</h1>

      {/* On appelle le composant client qui fera le travail de connexion */}
      <SessionsPageClient />
    </div>
  );
};

export default SessionsPage;