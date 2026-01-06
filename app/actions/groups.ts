'use server'

import { fetchWithAuth } from '@/app/lib/api'
import { isMockGroupsEnabled } from '@/app/lib/mock-data/groups'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionState = {
  error?: string
  success?: boolean
} | null

/**
 * Create a new group
 */
export async function createGroup(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name || name.trim().length === 0) {
    return { error: 'Group name is required' }
  }

  if (isMockGroupsEnabled) {
    // In mock mode, just redirect (can't actually create)
    redirect('/groups')
  }

  try {
    const res = await fetchWithAuth('/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), description: description?.trim() }),
    })

    if (!res.ok) {
      const data = await res.json()
      return { error: data.error || 'Failed to create group' }
    }
  } catch {
    return { error: 'Connection error. Please try again.' }
  }

  revalidatePath('/groups')
  redirect('/groups')
}

/**
 * Update group details
 */
export async function updateGroup(
  groupId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name || name.trim().length === 0) {
    return { error: 'Group name is required' }
  }

  if (isMockGroupsEnabled) {
    redirect(`/groups/${groupId}`)
  }

  try {
    const res = await fetchWithAuth(`/groups/${groupId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    })

    if (!res.ok) {
      const data = await res.json()
      return { error: data.error || 'Failed to update group' }
    }
  } catch {
    return { error: 'Connection error. Please try again.' }
  }

  revalidatePath('/groups')
  revalidatePath(`/groups/${groupId}`)
  redirect(`/groups/${groupId}`)
}

/**
 * Delete a group
 */
export async function deleteGroup(groupId: string): Promise<ActionState> {
  if (isMockGroupsEnabled) {
    redirect('/groups')
  }

  try {
    const res = await fetchWithAuth(`/groups/${groupId}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const data = await res.json()
      return { error: data.error || 'Failed to delete group' }
    }
  } catch {
    return { error: 'Connection error. Please try again.' }
  }

  revalidatePath('/groups')
  redirect('/groups')
}

/**
 * Add a member to group (by email)
 */
export async function addMember(
  groupId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get('email') as string

  if (!email || !email.includes('@')) {
    return { error: 'Valid email is required' }
  }

  if (isMockGroupsEnabled) {
    return { success: true }
  }

  try {
    const res = await fetchWithAuth('/groups/updateMember', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId,
        members: [email, ''], // [emailToAdd, memberToRemove]
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      return { error: data.error || 'Failed to add member' }
    }
  } catch {
    return { error: 'Connection error. Please try again.' }
  }

  revalidatePath(`/groups/${groupId}`)
  revalidatePath('/groups')
  return { success: true }
}

/**
 * Remove a member from group
 */
export async function removeMember(
  groupId: string,
  memberEmail: string
): Promise<ActionState> {
  if (isMockGroupsEnabled) {
    return { success: true }
  }

  try {
    const res = await fetchWithAuth('/groups/updateMember', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId,
        members: ['', memberEmail], // [emailToAdd, memberToRemove]
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      return { error: data.error || 'Failed to remove member' }
    }
  } catch {
    return { error: 'Connection error. Please try again.' }
  }

  revalidatePath(`/groups/${groupId}`)
  revalidatePath('/groups')
  return { success: true }
}
