import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login } = useAuth()

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const from = location.state?.from?.pathname || '/dashboard'

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form.email, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || 'E-mail ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Montserrat, sans-serif' }}>

      {/* ── Painel esquerdo — identidade da marca ──────── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden"
        style={{ background: '#3D281C' }}
      >
        {/* Texture overlay — grain sutil */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />

        {/* Glow radial dourado */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(171,144,81,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col items-center text-center px-12 gap-7 max-w-sm">
          {/* Logo */}
          <div className="relative">
            <img
              src="/brand/logos/logo-principal.svg"
              alt="Mentoria Sublime"
              className="w-64 h-64 object-contain drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 8px 32px rgba(142,112,40,0.5))' }}
            />
          </div>

          {/* Linha ornamental dourada */}
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(199,170,137,0.4))' }} />
            <span style={{ color: 'rgba(199,170,137,0.5)', fontSize: '10px' }}>✦</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(199,170,137,0.4), transparent)' }} />
          </div>

          {/* Tagline */}
          <p
            className="text-base leading-relaxed"
            style={{
              fontFamily: 'Bride, Georgia, serif',
              fontStyle: 'italic',
              color: 'rgba(246,242,231,0.65)',
              letterSpacing: '0.02em',
            }}
          >
            Acompanhe sua evolução e celebre cada conquista.
          </p>

          {/* Detalhe tipográfico */}
          <p
            className="text-[10px] tracking-[0.28em] uppercase"
            style={{ color: 'rgba(199,170,137,0.4)' }}
          >
            Sua jornada começa aqui
          </p>
        </div>

        {/* Detalhe de canto */}
        <div
          className="absolute bottom-6 left-0 right-0 text-center text-[10px] tracking-[0.2em] uppercase"
          style={{ color: 'rgba(199,170,137,0.25)' }}
        >
          Mentoria Sublime © 2025
        </div>
      </div>

      {/* ── Painel direito — formulário ────────────────── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8 py-12 relative"
        style={{ background: '#F6F2E7' }}
      >
        {/* Logo mobile */}
        <div className="lg:hidden flex justify-center mb-10">
          <img
            src="/brand/logos/logo-principal.svg"
            alt="Mentoria Sublime"
            className="w-32 h-32 object-contain"
            style={{ filter: 'drop-shadow(0 4px 16px rgba(142,112,40,0.4))' }}
          />
        </div>

        <div className="w-full max-w-sm animate-fade-in-up">
          {/* Heading */}
          <div className="mb-8">
            <h1
              className="text-3xl font-semibold text-dark mb-2 leading-tight"
              style={{ fontFamily: 'Bride, Georgia, serif' }}
            >
              Bem-vinda<br />de volta
            </h1>
            <p className="text-sm text-dark/50 font-body">
              Entre na sua conta para continuar.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Formulário de login">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-body font-semibold tracking-[0.1em] uppercase mb-2"
                style={{ color: '#604E44' }}
              >
                E-mail
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: '#C7AA89' }}
                  aria-hidden="true"
                />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 text-sm font-body rounded-xl outline-none transition-all duration-200"
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(199,170,137,0.4)',
                    color: '#292929',
                  }}
                  onFocus={e => {
                    e.target.style.border = '1px solid #C7AA89'
                    e.target.style.boxShadow = '0 0 0 3px rgba(199,170,137,0.25)'
                  }}
                  onBlur={e => {
                    e.target.style.border = '1px solid rgba(199,170,137,0.4)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-body font-semibold tracking-[0.1em] uppercase mb-2"
                style={{ color: '#604E44' }}
              >
                Senha
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: '#C7AA89' }}
                  aria-hidden="true"
                />
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 text-sm font-body rounded-xl outline-none transition-all duration-200"
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(199,170,137,0.4)',
                    color: '#292929',
                  }}
                  onFocus={e => {
                    e.target.style.border = '1px solid #C7AA89'
                    e.target.style.boxShadow = '0 0 0 3px rgba(199,170,137,0.25)'
                  }}
                  onBlur={e => {
                    e.target.style.border = '1px solid rgba(199,170,137,0.4)'
                    e.target.style.boxShadow = 'none'
                  }}
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

            {/* Erro */}
            <div role="alert" aria-live="polite">
              {error && (
                <div
                  className="px-4 py-3 rounded-xl text-sm font-body"
                  style={{
                    background: 'rgba(192,57,43,0.07)',
                    border: '1px solid rgba(192,57,43,0.2)',
                    color: '#c0392b',
                  }}
                >
                  {error}
                </div>
              )}
            </div>

            {/* Botão submit */}
            <button
              type="submit"
              disabled={loading}
              aria-disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-body font-semibold tracking-[0.08em] transition-all duration-300 relative overflow-hidden mt-2 disabled:cursor-not-allowed disabled:opacity-70"
              style={{
                background: loading ? '#604E44' : '#3D281C',
                color: '#F6F2E7',
                letterSpacing: '0.08em',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #8e7028, #ab9051, #f2ea9c, #ab9051, #8e7028)'
                  e.currentTarget.style.color = '#292929'
                }
              }}
              onMouseLeave={e => {
                if (!loading) {
                  e.currentTarget.style.background = '#3D281C'
                  e.currentTarget.style.color = '#F6F2E7'
                }
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Entrando…
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Link cadastro */}
          <p className="mt-7 text-center text-sm font-body" style={{ color: 'rgba(41,41,41,0.5)' }}>
            Ainda não tem conta?{' '}
            <Link
              to="/register"
              className="font-semibold transition-colors"
              style={{ color: '#604E44' }}
              onMouseEnter={e => e.currentTarget.style.color = '#8e7028'}
              onMouseLeave={e => e.currentTarget.style.color = '#604E44'}
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
