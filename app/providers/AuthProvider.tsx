'use client'

import { createContext, useContext, ReactNode } from 'react'

type User = {
  id: string
  email: string
  name?: string
  avatar?: string
  plan?: string
} | null

type AuthContextType = {
  user: User
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
})

export function useAuth() {
  return useContext(AuthContext)
}

type AuthProviderProps = {
  children: ReactNode
  user: User
}

export function AuthProvider({ children, user }: AuthProviderProps) {
  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

