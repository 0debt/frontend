/**
 * Groups helper functions
 * Handles both mock data and real API calls
 */

import { fetchWithAuth } from '@/app/lib/api'
import { isMockGroupsEnabled, MOCK_GROUPS, type Group } from '@/app/lib/mock-data/groups'
import { MOCK_USERS } from '@/app/lib/mock-data/expenses'
import { getUsersByIds, type UserInfo } from '@/app/lib/users'

// ============ GET GROUPS ============

/**
 * Get all groups for the current user
 */
export async function getGroups(userId: string): Promise<Group[]> {
  if (isMockGroupsEnabled) {
    // Return groups where user is a member
    return MOCK_GROUPS.filter(g => g.members.includes(userId) || g.members.includes('mock-id'))
  }

  try {
    const res = await fetchWithAuth('/groups', {
      cache: 'no-store',
    })

    if (!res.ok) {
      if (isMockGroupsEnabled) {
        console.warn('Failed to fetch groups, using mock data')
        return MOCK_GROUPS.filter(g => g.members.includes(userId) || g.members.includes('mock-id'))
      }
      throw new Error(`Failed to fetch groups: ${res.status}`)
    }

    const data = await res.json()
    return data as Group[]
  } catch (error) {
    console.error('Error fetching groups:', error)
    if (isMockGroupsEnabled) {
      return MOCK_GROUPS.filter(g => g.members.includes(userId) || g.members.includes('mock-id'))
    }
    throw error
  }
}

/**
 * Get a single group by ID
 */
export async function getGroup(groupId: string): Promise<Group | null> {
  if (isMockGroupsEnabled) {
    return MOCK_GROUPS.find(g => g._id === groupId) || null
  }

  try {
    const res = await fetchWithAuth(`/groups/${groupId}/summary`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      if (isMockGroupsEnabled) {
        console.warn(`Failed to fetch group ${groupId}, using mock data`)
        return MOCK_GROUPS.find(g => g._id === groupId) || null
      }
      throw new Error(`Failed to fetch group ${groupId}: ${res.status}`)
    }

    const data = await res.json()
    return {
      _id: data.groupId || groupId,
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      members: data.members || [],
      ownerId: data.owner,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as Group
  } catch (error) {
    console.error('Error fetching group:', error)
    if (isMockGroupsEnabled) {
      return MOCK_GROUPS.find(g => g._id === groupId) || null
    }
    throw error
  }
}

/**
 * Get members of a group with user info from users-service
 */
export async function getGroupMembers(groupId: string): Promise<UserInfo[]> {
  if (isMockGroupsEnabled) {
    const group = MOCK_GROUPS.find(g => g._id === groupId)
    if (!group) return []

    // Return mock users that are in the group
    return MOCK_USERS.filter(u => group.members.includes(u._id))
  }

  try {
    // Get the group to get member IDs
    const group = await getGroup(groupId)
    if (!group || !group.members || group.members.length === 0) return []

    // Call users-service to get full user info for each member
    const users = await getUsersByIds(group.members)
    return users
  } catch (error) {
    console.error('Error fetching group members:', error)
    if (isMockGroupsEnabled) {
      const group = MOCK_GROUPS.find(g => g._id === groupId)
      if (group) {
        return MOCK_USERS.filter(u => group.members.includes(u._id))
      }
    }
    return []
  }
}

// ============ EXPORTS ============

export { isMockGroupsEnabled }
export type { Group, UserInfo }
