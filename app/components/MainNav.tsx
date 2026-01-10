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
  { href: '/', label: 'Home', requiresAuth: true },
  { href: '/groups', label: 'Groups', requiresAuth: true },
  { href: '/expenses', label: 'Expenses', requiresAuth: true },
  { href: '/budgets', label: 'Budgets', requiresAuth: true },
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
            onClick={() => window.dispatchEvent(new CustomEvent('refresh-notifications'))}
            className={cn(
              'text-sm font-medium transition-colors rounded-full px-4 py-2',
              isActive 
                ? 'bg-muted text-white' 
                : 'text-muted-foreground hover:bg-primary hover:text-black'
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}