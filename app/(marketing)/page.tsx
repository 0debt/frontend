import { Button } from '@/shadcn/components/ui/button';
import Image from 'next/image';
import { Link } from 'next-view-transitions';

export default function MarketingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-24">
      <Image
        src="/0debt-logo.svg"
        alt="0debt Logo"
        width={100}
        height={100}
        draggable={false}
      />
      <h1 className="mt-8 text-4xl font-bold">Welcome to 0debt</h1>
      <p className="mt-4 text-muted-foreground">
        Your financial freedom starts here
      </p>
      <Button className="mt-8" asChild>
        <Link href="/sign-in">Get Started</Link>
      </Button>
      </main>
    );
  }
