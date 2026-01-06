import { Button } from '@/shadcn/components/ui/button';
import Image from 'next/image';
import { Link } from 'next-view-transitions';
import { getSession } from '@/app/lib/session';
import { getUserById } from '@/app/lib/users';
import { isMockAuthEnabled, MOCK_USER } from '@/app/lib/mock-data/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar';

export default async function MarketingPage() {
  let user = null;

  if (isMockAuthEnabled) {
    user = MOCK_USER;
  } else {
    const session = await getSession();
    if (session) {
      user = await getUserById(session.sub);
    }
  }

  const userName = user?.name;

  return (
    <main className="flex min-h-full flex-col items-center justify-center p-24">
      <Image
        src="/0debt-logo.svg"
        alt="0debt Logo"
        width={100}
        height={100}
        draggable={false}
      />
      <div className="flex items-center gap-4 mt-8">
        <h1 className="text-4xl font-bold">
          Welcome to 0debt{userName ? ` ${userName}!` : ''}
        </h1>
        {user && (
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={userName || 'User'} />
            <AvatarFallback>
              {(userName || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      <p className="mt-4 text-muted-foreground">
        Your financial freedom starts here
      </p>
      <Button className="mt-8" asChild>
        <Link href={userName ? "/groups" : "/sign-in"}>
          {userName ? "Go to groups" : "Get started"}
        </Link>
      </Button>
      </main>
    );
}
