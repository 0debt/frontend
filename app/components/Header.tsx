'use client'

import { MainNav } from '@/app/components/MainNav'
import { useAuth } from '@/app/providers/AuthProvider'
import { Button } from '@/shadcn/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar'
import { Link } from 'next-view-transitions'
import Image from 'next/image'
// 👇 1. IMPORT NOTIFICATION BELL
import { NotificationBell } from './NotificationBell'

export function Header() {
  const { isAuthenticated, user } = useAuth()

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
        
        {/* User NOT logged in */}
        {!isAuthenticated && (
          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        )}

        {/* User LOGGED IN */}
        {isAuthenticated && (
          <div className="ml-auto flex items-center gap-4">
            {/* 👇 2. PLACE BELL HERE (before profile) */}
            <NotificationBell />
            
            <Button variant="ghost" className="h-8 w-8 rounded-full" asChild>
              <Link href="/me">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name || user?.email || 'User avatar'} />
                  <AvatarFallback>
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}