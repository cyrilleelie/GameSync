import { CreateSessionForm } from '@/components/sessions/create-session-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function CreateSessionPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Créer une Nouvelle Session de Jeu</CardTitle>
          <CardDescription>Remplissez les détails ci-dessous pour planifier votre prochaine aventure de jeu de société.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <CreateSessionForm />
        </CardContent>
      </Card>
    </div>
  );
}
