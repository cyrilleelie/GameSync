import { SessionCard } from '@/components/sessions/session-card';
import { mockSessions } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Filter } from 'lucide-react';

export default function SessionsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Game Sessions</h1>
          <p className="text-muted-foreground">Browse upcoming board game sessions or create your own.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button asChild>
            <Link href="/sessions/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Session
            </Link>
          </Button>
        </div>
      </div>

      {mockSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No sessions found.</p>
          <Button asChild className="mt-4">
            <Link href="/sessions/create">Be the first to create one!</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
