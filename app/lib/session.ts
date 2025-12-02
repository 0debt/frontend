import { cookies } from 'next/headers'
import 'server-only'

export type SessionPayload = {
  sub: string
  email: string
  plan?: string
  exp?: number
}

/**
 * Stores the backend JWT in a secure HttpOnly cookie
 * @param token - The JWT token from the backend
 */
export async function createSession(token: string) {
  const cookieStore = await cookies()
  
  // Set expiration to 1 hour (matching backend JWT expiry)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
  
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

/**
 * Retrieves and validates the current session from the cookie
 * @returns The JWT payload if valid, null if no session or expired
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) {
    return null
  }

  try {
    // Decode JWT without signature verification (backend already verified it)
    // We only extract the payload for internal use
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(atob(parts[1])) as SessionPayload
    
    // Check if token has expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      await deleteSession()
      return null
    }
    
    return payload
  } catch {
    return null
  }
}

/**
 * Gets the raw token from the cookie (for sending to the backend)
 * @returns The JWT token string or null if not found
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('session')?.value ?? null
}

/**
 * Deletes the session cookie (logout)
 */
export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

