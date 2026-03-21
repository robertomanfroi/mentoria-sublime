import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Sparkles } from 'lucide-react'
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
      setError(
        err?.response?.data?.message ||
          'E-mail ou senha incorretos. Tente novamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-offwhite">
      {/* Painel esquerdo decorativo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gold/20 via-nude-light to-nude-medium flex-col items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_rgba(201,168,76,0.3)]">
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold text-dark mb-4 leading-tight">
            Mentoria<br />
            <span className="gold-text-gradient">Sublime</span>
          </h1>
          <p className="font-body text-dark/60 text-lg leading-relaxed">
            Acompanhe sua evolução, conecte-se com outras mulheres e celebre cada conquista juntas.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {['✦', '✦', '✦'].map((s, i) => (
                <span key={i} className="text-gold text-lg opacity-60" style={{ animationDelay: `${i * 200}ms` }}>{s}</span>
              ))}
            </div>
            <p className="text-sm font-body text-dark/40 italic">
              Sua jornada começa aqui.
            </p>
          </div>
        </div>
      </div>

      {/* Painel direito: formulário */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in-up">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold text-dark">Mentoria Sublime</span>
          </div>

          <h2 className="font-display text-3xl font-semibold text-dark mb-1">
            Bem-vinda de volta
          </h2>
          <p className="font-body text-dark/50 mb-8">
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Entrar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm font-body text-dark/50">
            Ainda não tem conta?{' '}
            <Link
              to="/register"
              className="text-gold font-medium hover:underline"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
