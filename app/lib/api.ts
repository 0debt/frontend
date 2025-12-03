import { getSessionToken } from '@/app/lib/session'
import 'server-only'

const API_URL = process.env.API_GATEWAY_URL

type FetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
}

/**
 * Logs API requests to console
 */
function logRequest(method: string, endpoint: string, status: number, duration: number) {
  const icon = status >= 400 ? '✗' : '→'
  const displayUrl = endpoint.startsWith('http') 
    ? endpoint.replace(API_URL || '', '') 
    : endpoint
  console.log(`${icon} [API] ${method} ${displayUrl} ${status} (${duration}ms)`)
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
  const startTime = Date.now()
  const method = options.method || 'GET'
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

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })
    
    const duration = Date.now() - startTime
    logRequest(method, endpoint, response.status, duration)
    
    return response
  } catch (error) {
    const duration = Date.now() - startTime
    logRequest(method, endpoint, 0, duration)
    throw error
  }
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
  const startTime = Date.now()
  const method = options.method || 'GET'
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_URL}/api/v1${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })
    
    const duration = Date.now() - startTime
    logRequest(method, endpoint, response.status, duration)
    
    return response
  } catch (error) {
    const duration = Date.now() - startTime
    logRequest(method, endpoint, 0, duration)
    throw error
  }
}

