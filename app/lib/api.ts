import { API_GATEWAY_URL, withApiBase } from '@/app/lib/config'
import { deleteSession, getSessionToken } from '@/app/lib/session'
import { redirect } from 'next/navigation'
import 'server-only'

type FetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
}

/**
 * Logs API requests to console
 */
function logRequest(method: string, endpoint: string, status: number, duration: number, error?: string) {
  const icon = status >= 400 ? '✗' : '→'
  const displayUrl = endpoint.startsWith('http') 
    ? endpoint.replace(API_GATEWAY_URL || '', '') 
    : endpoint
  const errorMsg = error ? ` - ${error}` : ''
  console.log(`${icon} [API] ${method} ${displayUrl} ${status} (${duration}ms)${errorMsg}`)
}

/**
 * Safely extracts error message from response
 */
async function extractError(response: Response): Promise<string | undefined> {
  if (response.status < 400) return undefined
  try {
    const cloned = response.clone()
    const text = await cloned.text()
    console.log('[API DEBUG] Error response body:', text)
    try {
      const data = JSON.parse(text)
      return data.error || data.message || text
    } catch {
      return text || `Status ${response.status}`
    }
  } catch (e) {
    console.log('[API DEBUG] Failed to extract error:', e)
    return `Status ${response.status}`
  }
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

  const url = withApiBase(endpoint, API_GATEWAY_URL)

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })
    
    const duration = Date.now() - startTime
    const errorMsg = await extractError(response)
    logRequest(method, endpoint, response.status, duration, errorMsg)
    
    // Auto-logout on token expiration
    if (response.status === 401) {
      await deleteSession()
      redirect('/sign-in')
    }
    
    return response
  } catch (error) {
    const duration = Date.now() - startTime
    logRequest(method, endpoint, 0, duration, String(error))
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

  const url = withApiBase(endpoint, API_GATEWAY_URL)

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })
    
    const duration = Date.now() - startTime
    const errorMsg = await extractError(response)
    logRequest(method, endpoint, response.status, duration, errorMsg)
    
    return response
  } catch (error) {
    const duration = Date.now() - startTime
    logRequest(method, endpoint, 0, duration, String(error))
    throw error
  }
}

