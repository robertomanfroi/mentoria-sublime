import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Instagram, Camera, Sparkles } from 'lucide-react'
import { authApi, userApi } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import { setToken } from '../../lib/auth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Avatar from '../../components/ui/Avatar'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    instagram: '',
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        instagram_handle: form.instagram,
      }

      const res = await authApi.register(payload)
      const { token, user } = res.data
      setToken(token)

      if (avatarFile) {
        try {
          const formData = new FormData()
          formData.append('photo', avatarFile)
          const photoRes = await userApi.uploadAvatar(formData)
          setUser(photoRes.data.user || user)
        } catch (_) {
          setUser(user)
        }
      } else {
        setUser(user)
      }

      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Erro ao criar conta. Tente novamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-offwhite px-6 py-12">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold text-dark">Mentoria Sublime</span>
        </div>

        <h2 className="font-display text-3xl font-semibold text-dark mb-1">
          Crie sua conta
        </h2>
        <p className="font-body text-dark/50 mb-8">
          Junte-se à comunidade e comece sua transformação.
        </p>

        {/* Avatar upload */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="relative cursor-pointer group"
            onClick={() => fileRef.current?.click()}
          >
            <Avatar
              src={avatarPreview}
              name={form.name || 'Foto'}
              size="xl"
            />
            <div className="absolute inset-0 rounded-full bg-dark/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Camera size={20} className="text-white" />
            </div>
          </div>
          <p className="mt-2 text-xs font-body text-dark/40">
            Clique para adicionar foto (opcional)
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Seu nome"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            icon={User}
            required
          />

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
            autoComplete="new-password"
          />

          <Input
            label="@ do Instagram (sem @)"
            type="text"
            name="instagram"
            value={form.instagram}
            onChange={handleChange}
            icon={Instagram}
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
            Criar conta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm font-body text-dark/50">
          Já tem conta?{' '}
          <Link to="/login" className="text-gold font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
