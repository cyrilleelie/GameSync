import { UserProfileDisplay } from '@/components/profile/user-profile-display';
import { mockPlayers } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// In a real app, you'd fetch the logged-in user's data
const currentUser = mockPlayers[0]; 

export default function ProfilePage() {
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>User not found. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">My Profile</CardTitle>
          <CardDescription>View and manage your GameSync profile details.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <UserProfileDisplay user={currentUser} />
        </CardContent>
      </Card>
    </div>
  );
}
