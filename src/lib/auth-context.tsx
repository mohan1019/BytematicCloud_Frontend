'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

interface User {
  id: number
  name: string
  email: string
  phone?: string
  two_factor_enabled?: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, twoFactorCode?: string) => Promise<{ requires2FA?: boolean }>
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.get('/api/auth/me')
        .then(response => {
          setUser(response.data.user)
        })
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string, twoFactorCode?: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password, twoFactorCode })
      
      if (response.data.requires2FA) {
        return { requires2FA: true }
      }
      
      const { token, user } = response.data
      localStorage.setItem('token', token)
      setUser(user)
      return {}
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed')
    }
  }

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const response = await api.post('/api/auth/register', { name, email, password, phone })
      const { token, user } = response.data
      localStorage.setItem('token', token)
      setUser(user)
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { api }