import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/dashboard'

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
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
      setError(err?.response?.data?.message || 'E-mail ou senha incorretos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-cream">
      {/* Painel esquerdo — identidade visual da marca */}
      <div className="hidden lg:flex lg:w-1/2 bg-dark flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Ornamento de fundo */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 30% 70%, #f2ea9c 0%, transparent 50%), radial-gradient(circle at 70% 30%, #bda788 0%, transparent 50%)',
          }}
        />
        <div className="relative z-10 max-w-md text-center flex flex-col items-center gap-8">
          {/* Logo principal */}
          <img
            src="/brand/logos/logo-principal.svg"
            alt="Mentoria Sublime"
            className="w-56 h-56 object-contain"
          />
          <p className="font-body text-cream/70 text-base leading-relaxed max-w-xs">
            Acompanhe sua evolução, conecte-se com outras mulheres e celebre cada conquista juntas.
          </p>
          <div className="flex gap-3 opacity-50">
            {['✦', '✦', '✦'].map((s, i) => (
              <span key={i} className="text-gold text-base">{s}</span>
            ))}
          </div>
          <p className="text-sm font-body text-cream/40 italic tracking-wide">
            Sua jornada começa aqui.
          </p>
        </div>
      </div>

      {/* Painel direito: formulário */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-cream">
        <div className="w-full max-w-sm animate-fade-in-up">
          {/* Logo mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <img
              src="/brand/logos/logo-principal.svg"
              alt="Mentoria Sublime"
              className="h-28 w-auto object-contain"
            />
          </div>

          <h2 className="font-display text-3xl font-semibold text-dark mb-1">
            Bem-vinda de volta
          </h2>
          <p className="font-body text-dark/50 mb-8 text-sm">
            Entre na sua conta para continuar sua jornada.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              icon={Mail}
              required
              autoComplete="email"
            />
            <Input
              label="Senha"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              icon={Lock}
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm font-body text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Entrar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm font-body text-dark/50">
            Ainda não tem conta?{' '}
            <Link to="/register" className="text-gold-dark font-semibold hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
