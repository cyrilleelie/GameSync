import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, PlusCircle, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="text-center space-y-6">
        <Image 
          src="https://placehold.co/600x300.png" 
          alt="Board games collage" 
          width={600} 
          height={300} 
          className="rounded-lg shadow-xl mx-auto"
          data-ai-hint="board games collage"
        />
        <h1 className="text-5xl font-bold tracking-tight text-primary">Welcome to GameSync!</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The ultimate platform for board game enthusiasts to connect, schedule, and play.
          Discover new games, find fellow players, and organize your next epic game night with ease.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/sessions">
              <Gamepad2 className="mr-2 h-5 w-5" />
              Browse Sessions
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/sessions/create">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create a Session
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-primary" />
              Discover Games
            </CardTitle>
            <CardDescription>Find upcoming game sessions for your favorite board games or explore new ones.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Browse a diverse list of sessions, filter by game, location, or date.</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Connect with Players
            </CardTitle>
            <CardDescription>Meet new people who share your passion for board gaming.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Join sessions, create your own, and build your gaming community.</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-6 w-6 text-primary" />
              Easy Scheduling
            </CardTitle>
            <CardDescription>Organize your game nights effortlessly with our intuitive tools.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Use our AI-powered Smart Scheduler to find the perfect time and place.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
