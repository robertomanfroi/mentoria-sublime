import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Hook genérico para chamadas de API.
 * @param {Function} fn - Função que retorna uma Promise (chamada de API)
 * @param {Array} deps - Dependências para re-executar (opcional)
 * @param {Object} options - { immediate: bool, initialData: any }
 */
export function useApi(fn, deps = [], options = {}) {
  const { immediate = true, initialData = null } = options

  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const execute = useCallback(
    async (...args) => {
      setLoading(true)
      setError(null)

      try {
        const res = await fn(...args)
        const result = res?.data ?? res
        if (mountedRef.current) {
          setData(result)
        }
        return result
      } catch (err) {
        if (mountedRef.current) {
          // 404 é tratado como "sem dados" (não como erro de tela)
          if (err?.response?.status === 404) {
            setData(null)
          } else {
            // Backend retorna { error: "..." }
            setError(err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Erro desconhecido')
          }
        }
        if (err?.response?.status !== 404) throw err
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn, ...deps]
  )

  useEffect(() => {
    if (immediate) {
      execute()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute])

  return {
    data,
    loading,
    error,
    refetch: execute,
    setData,
  }
}
