'use server'

import { fetchApi, fetchWithAuth } from '@/app/lib/api'
import { createSession, deleteSession, getSessionToken } from '@/app/lib/session'
import { redirect } from 'next/navigation'
import { isMockEnabled, MOCK_USER } from '@/app/lib/mock'

export type AuthState = {
  error?: string
  success?: boolean
  userId?: string
  email?: string
} | null

/**
 * Server Action for user login
 * @param prevState - Previous form state
 * @param formData - Form data containing email and password
 * @returns Error state or redirects to /me on success
 */
export async function login(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  try {
    const res = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      return { error: data.error || 'Invalid credentials' }
    }

    const { token } = await res.json()
    await createSession(token)
  } catch {
    return { error: 'Connection error. Please try again.' }
  }

  redirect('/me')
}

/**
 * Server Action for user registration
 * @param prevState - Previous form state
 * @param formData - Form data containing name, email and password
 * @returns Error state or success with userId/email to notification preferences
 */
export async function signup(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  try {
    // 1. Register user
    const resRegister = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })

    if (!resRegister.ok) {
      const data = await resRegister.json()
      return { error: data.error || 'Failed to create account' }
    }

    const registerData = await resRegister.json()

    // 2. Auto-login after registration
    const resLogin = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (!resLogin.ok) {
      return { error: 'Account created. Please sign in.' }
    }

    const { token, user } = await resLogin.json()
    await createSession(token)

    // Return success with userId and email for preferences
    return { 
      success: true, 
      userId: user?.id || registerData?.user?.id || registerData?.id,
      email 
    }
  } catch {
    return { error: 'Connection error. Please try again.' }
  }
}

/**
 * Server Action for user logout
 * Deletes the session and redirects to sign-in
 */
export async function logout() {
  await deleteSession()
  redirect('/sign-in')
}

/**
 * Server Action to update user profile
 * @param formData - Form data containing id and name
 * @returns Error state or null on success
 */
export async function updateProfile(formData: FormData): Promise<AuthState> {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const avatar = formData.get("avatar") as File | null

  if (!id || !name) {
    return { error: 'Invalid data' }
  }

  try {
    const res = await fetchWithAuth(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
      headers: { "Content-Type": "application/json" }
    })

    if (!res.ok) {
      const data = await res.json()
      return { error: data.error || 'Failed to update name' }
    }

    if (avatar) {
      const avatarForm = new FormData()
      avatarForm.append("avatar", avatar)
      const token = await getSessionToken()
      const BASE_URL = process.env.API_GATEWAY_URL!
      const resAvatar = await fetch(`${BASE_URL}/users/${id}/avatar`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: avatarForm
      })

      if (!resAvatar.ok) {
        const data = await resAvatar.json()
        return { error: data.error || "Failed to upload avatar" }
      }
    }


    return { success: true }
  } catch {
    return { error: 'Connection error. Please try again.' }
  }
}

