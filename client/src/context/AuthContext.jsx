import { createContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../lib/api'
import { getToken, setToken, removeToken, getUser, isExpired } from '../lib/auth'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Inicializa: verifica se há token válido e carrega usuário
  useEffect(() => {
    async function init() {
      const token = getToken()
      if (!token || isExpired()) {
        removeToken()
        setIsLoading(false)
        return
      }

      try {
        const res = await authApi.me()
        setUser(res.data.user)
      } catch {
        removeToken()
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password)
    const { token, user: userData } = res.data
    setToken(token)
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    removeToken()
    setUser(null)
    window.location.href = '/login'
  }, [])

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        isAdmin,
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
