import { NextRequest, NextResponse } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/me', '/budgets']

// Auth routes (redirect to /me if already authenticated)
const authRoutes = ['/sign-in', '/sign-up']

/**
 * Proxy middleware for route protection
 * Handles authentication redirects for protected and auth routes
 * @param req - The incoming request
 * @returns NextResponse (redirect or next)
 */
export default async function proxy(req: NextRequest) {
  // Skip auth checks in mock mode
  if (process.env.MOCK_AUTH === 'true') {
    return NextResponse.next()
  }

  const path = req.nextUrl.pathname
  
  // Get token from cookie
  const token = req.cookies.get('session')?.value
  const isAuthenticated = !!token

  // If accessing protected route without auth → redirect to sign-in
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  )
  
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/sign-in', req.nextUrl))
  }

  // If authenticated and accessing auth routes → redirect to /me
  const isAuthRoute = authRoutes.includes(path)
  
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/me', req.nextUrl))
  }

  return NextResponse.next()
}

// Configure which routes the proxy runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public files (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)',
  ],
}

