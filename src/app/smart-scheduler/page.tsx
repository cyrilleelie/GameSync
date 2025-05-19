import { SmartSchedulerForm } from '@/components/smart-scheduler/smart-scheduler-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Wand2 } from 'lucide-react';

export default function SmartSchedulerPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
             <Wand2 className="h-8 w-8 text-primary" />
            Planificateur de Session Intelligent
          </CardTitle>
          <CardDescription>
            Laissez notre assistant IA vous aider à trouver le moment et le lieu parfaits pour votre prochaine session de jeu en fonction des préférences de chacun.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <SmartSchedulerForm />
        </CardContent>
      </Card>
    </div>
  );
}
