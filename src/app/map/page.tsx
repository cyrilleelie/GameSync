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
            Interactive Session Map
          </CardTitle>
          <CardDescription>
            Discover gaming sessions happening near you. (Feature Coming Soon!)
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg text-muted-foreground mb-6">
            Our interactive map will help you visualize nearby game sessions.
            Stay tuned for this exciting feature!
          </p>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            <Image 
              src="https://placehold.co/1200x600.png" 
              alt="Placeholder map of a city with pins" 
              width={1200} 
              height={600}
              className="object-cover"
              data-ai-hint="map city"
            />
          </div>
           <p className="text-sm text-muted-foreground mt-2">
            Map data is illustrative. Actual feature will use real-time session locations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
