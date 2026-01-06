/**
 * Users helper functions
 * Handles fetching user information from users-service
 */

import { fetchWithAuth } from '@/app/lib/api'
import { getDefaultAvatar } from '@/lib/utils'

export type UserInfo = {
  _id: string
  name: string
  email: string
  avatar: string
}

/**
 * Get user info by ID from users-service
 */
export async function getUserById(userId: string): Promise<UserInfo | null> {
  try {
    // Use internal endpoint to bypass "own profile only" restriction
    const res = await fetchWithAuth(`/users/internal/users/${userId}`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      console.warn(`Failed to fetch user ${userId}`)
      return null
    }

    const data = await res.json()
    return {
      _id: data._id || data.id || userId,
      name: data.name || userId,
      email: data.email || '',
      avatar: data.avatar || getDefaultAvatar(userId),
    }
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error)
    return null
  }
}

/**
 * Get multiple users by their IDs
 */
export async function getUsersByIds(userIds: string[]): Promise<UserInfo[]> {
  const users = await Promise.all(
    userIds.map(async (userId) => {
      const user = await getUserById(userId)
      // Fallback if user not found
      return user || {
        _id: userId,
        name: userId,
        email: '',
        avatar: getDefaultAvatar(userId),
      }
    })
  )

  return users
}
