import { getSessionToken } from '@/app/lib/session'
import 'server-only'

const API_URL = process.env.API_GATEWAY_URL

type FetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
}

/**
 * Fetch with automatic authentication
 * Adds the user's JWT token to requests
 * @param endpoint - API endpoint (e.g., '/users/me')
 * @param options - Fetch options (method, body, etc.)
 * @returns The fetch Response
 */
export async function fetchWithAuth(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const token = await getSessionToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_URL}/api/v1${endpoint}`

  return fetch(url, {
    ...options,
    headers,
  })
}

/**
 * Fetch without authentication (for login/register)
 * @param endpoint - API endpoint (e.g., '/auth/login')
 * @param options - Fetch options (method, body, etc.)
 * @returns The fetch Response
 */
export async function fetchApi(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_URL}/api/v1${endpoint}`

  return fetch(url, {
    ...options,
    headers,
  })
}

