// Fichier : src/app/sessions/[id]/edit/page.tsx (VERSION DE TEST MINIMALISTE)

// On définit le type des props de manière simple et explicite
type Props = {
  params: { id: string };
};

export default async function EditSessionPage({ params }: Props) {
  // On ne fait aucun appel à la base de données pour ce test.
  // On n'importe et n'affiche aucun composant complexe.

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Page de Test pour la Modification de Session</h1>
      <p>L'ID de la session est : {params.id}</p>
      <p>Si vous voyez cette page sans erreur de build, le problème vient d'un des composants importés.</p>
    </div>
  );
}