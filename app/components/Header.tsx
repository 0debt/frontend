'use client'

import { MainNav } from '@/app/components/MainNav'
import { useAuth } from '@/app/providers/AuthProvider'
import { Button } from '@/shadcn/components/ui/button'
import Image from 'next/image'
import { Link } from 'next-view-transitions'

export function Header() {
  const { isAuthenticated } = useAuth()

  return (
    <header className="border-b">
      <div className="container mx-auto relative flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/0debt-logo.svg"
            alt="0debt Logo"
            width={32}
            height={32}
          />
        </Link>
        <div className="absolute left-1/2 -translate-x-1/2">
          <MainNav isAuthenticated={isAuthenticated} />
        </div>
        {!isAuthenticated && (
          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        )}
        {isAuthenticated && (
          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/me">Profile</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
