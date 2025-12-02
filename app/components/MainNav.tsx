'use client'

import { cn } from '@/lib/utils'
import { Link } from 'next-view-transitions'
import { usePathname } from 'next/navigation'

type NavItem = {
  href: string
  label: string
  requiresAuth?: boolean
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard', requiresAuth: true },
  { href: '/docs', label: 'Docs' },
  { href: '/demo-components', label: 'Demo Components' },
  { href: '/plans', label: 'Plans', requiresAuth: true },
]

type MainNavProps = {
  isAuthenticated: boolean
}

export function MainNav({ isAuthenticated }: MainNavProps) {
  const pathname = usePathname()

  const visibleItems = navItems.filter(item => 
    !item.requiresAuth || isAuthenticated
  )

  return (
    <nav className="flex items-center gap-6">
      {visibleItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              isActive ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
