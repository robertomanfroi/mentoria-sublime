import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { authApi } from '../../lib/api'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword]  = useState('')
  const [showPwd,         setShowPwd]         = useState(false)
  const [error,           setError]           = useState('')
  const [loading,         setLoading]         = useState(false)
  const [success,         setSuccess]         = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Link inválido. Solicite uma nova redefinição de senha.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      await authApi.resetPassword(token, password)
      setSuccess(true)
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Não foi possível redefinir a senha. O link pode ter expirado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-8 py-12" style={{ fontFamily: 'Montserrat, sans-serif', background: '#F6F2E7' }}>
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="flex justify-center mb-6">
          <img
            src="/brand/logos/logo-principal.svg"
            alt="Mentoria Sublime"
            className="w-[220px] h-[220px] object-contain"
            style={{ filter: 'drop-shadow(0 4px 16px rgba(142,112,40,0.4))' }}
          />
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-dark mb-2 leading-tight" style={{ fontFamily: 'Bride, Georgia, serif' }}>
            Criar nova senha
          </h1>
          <p className="text-sm text-dark/50 font-body">
            Escolha uma nova senha para acessar sua conta.
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Formulário de redefinição de senha">
            <div>
              <label htmlFor="password" className="block text-xs font-body font-semibold tracking-[0.1em] uppercase mb-2" style={{ color: '#604E44' }}>
                Nova senha
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#C7AA89' }} aria-hidden="true" />
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 text-sm font-body rounded-xl outline-none transition-all duration-200"
                  style={{ background: '#ffffff', border: '1px solid rgba(199,170,137,0.4)', color: '#292929' }}
                  onFocus={e => { e.target.style.border = '1px solid #C7AA89'; e.target.style.boxShadow = '0 0 0 3px rgba(199,170,137,0.25)' }}
                  onBlur={e => { e.target.style.border = '1px solid rgba(199,170,137,0.4)'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(199,170,137,0.6)' }}
                  aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={showPwd}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-body font-semibold tracking-[0.1em] uppercase mb-2" style={{ color: '#604E44' }}>
                Confirmar nova senha
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#C7AA89' }} aria-hidden="true" />
                <input
                  id="confirmPassword"
                  type={showPwd ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError('') }}
                  required
                  autoComplete="new-password"
                  placeholder="Repita a senha"
                  className="w-full pl-10 pr-4 py-3 text-sm font-body rounded-xl outline-none transition-all duration-200"
                  style={{ background: '#ffffff', border: '1px solid rgba(199,170,137,0.4)', color: '#292929' }}
                  onFocus={e => { e.target.style.border = '1px solid #C7AA89'; e.target.style.boxShadow = '0 0 0 3px rgba(199,170,137,0.25)' }}
                  onBlur={e => { e.target.style.border = '1px solid rgba(199,170,137,0.4)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            <div role="alert" aria-live="polite">
              {error && (
                <div className="px-4 py-3 rounded-xl text-sm font-body" style={{ background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.2)', color: '#c0392b' }}>
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-body font-semibold tracking-[0.08em] transition-all duration-300 mt-2 disabled:cursor-not-allowed disabled:opacity-70"
              style={{ background: loading ? '#604E44' : '#3D281C', color: '#F6F2E7' }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'linear-gradient(135deg, #8e7028, #ab9051, #f2ea9c, #ab9051, #8e7028)'; e.currentTarget.style.color = '#292929' } }}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = '#3D281C'; e.currentTarget.style.color = '#F6F2E7' } }}
            >
              {loading ? 'Salvando…' : 'Salvar nova senha'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="px-4 py-3 rounded-xl text-sm font-body" style={{ background: 'rgba(46,125,50,0.08)', border: '1px solid rgba(46,125,50,0.2)', color: '#2e7d32' }}>
              Senha redefinida com sucesso! Você já pode entrar com a nova senha.
            </div>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-3.5 rounded-xl text-sm font-body font-semibold tracking-[0.08em] transition-all duration-300"
              style={{ background: '#3D281C', color: '#F6F2E7' }}
            >
              Ir para o login
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-sm font-body" style={{ color: 'rgba(41,41,41,0.5)' }}>
          <Link to="/login" className="font-semibold" style={{ color: '#8e7028' }}>
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  )
}
