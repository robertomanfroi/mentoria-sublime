const TOKEN_KEY = 'mentoria_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Decodifica o payload do JWT sem verificar assinatura.
 * Usado apenas para leitura de dados do usuário no cliente.
 */
export function getUser() {
  const token = getToken()
  if (!token) return null

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    // Padding para base64
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4)
    const decoded = JSON.parse(atob(padded))
    return decoded
  } catch {
    return null
  }
}

/**
 * Verifica se o token está expirado.
 */
export function isExpired() {
  const user = getUser()
  if (!user || !user.exp) return true

  const now = Math.floor(Date.now() / 1000)
  return user.exp < now
}

/**
 * Verifica se o usuário está autenticado (token válido e não expirado).
 */
export function isAuthenticated() {
  return !!getToken() && !isExpired()
}
