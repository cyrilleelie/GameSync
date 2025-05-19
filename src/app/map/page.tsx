import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapIcon } from 'lucide-react';

export default function MapPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <MapIcon className="h-8 w-8 text-primary" />
            Carte Interactive des Sessions
          </CardTitle>
          <CardDescription>
            Découvrez les sessions de jeu près de chez vous. (Fonctionnalité à venir !)
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg text-muted-foreground mb-6">
            Notre carte interactive vous aidera à visualiser les sessions de jeu à proximité.
            Restez à l'écoute pour cette fonctionnalité passionnante !
          </p>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            <Image 
              src="https://placehold.co/1200x600.png" 
              alt="Placeholder de carte d'une ville avec des épingles" 
              width={1200} 
              height={600}
              className="object-cover"
              data-ai-hint="map city"
            />
          </div>
           <p className="text-sm text-muted-foreground mt-2">
            Les données de la carte sont illustratives. La fonctionnalité réelle utilisera les emplacements des sessions en temps réel.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
