import { useState, useRef } from 'react'
import { Camera, Save, User, Instagram, Mail } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { userApi } from '../lib/api'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

/* ─── Paleta oficial ──────────────────────────────────────────────── */
const BROWN = '#3D281C'
const GOLD  = '#C7AA89'
const MID   = '#604E44'
const BEIGE = '#D8D1C1'

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const fileRef = useRef(null)

  const [form, setForm]         = useState({ name: user?.name || '', instagram: user?.instagram || '' })
  const [saving, setSaving]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess]   = useState('')
  const [error, setError]       = useState('')
  const [preview, setPreview]   = useState(null)

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setSuccess('')
    setError('')
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await userApi.updateProfile({
        name: form.name,
        instagram_handle: form.instagram,
      })
      setUser(prev => ({ ...prev, name: res.data.name, instagram: res.data.instagram }))
      setSuccess('Perfil atualizado com sucesso!')
    } catch (err) {
      setError(err?.response?.data?.error || 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview imediato
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(file)

    setUploading(true)
    setError('')
    setSuccess('')
    try {
      const formData = new FormData()
      formData.append('photo', file)
      const res = await userApi.uploadAvatar(formData)
      setUser(prev => ({ ...prev, avatar_url: res.data.user?.avatar_url || prev.avatar_url }))
      setSuccess('Foto atualizada com sucesso!')
    } catch (err) {
      setError(err?.response?.data?.error || 'Erro ao enviar foto.')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>

      {/* ── Foto de perfil ───────────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 flex flex-col items-center gap-4"
        style={{ background: '#ffffff', border: `1px solid ${BEIGE}`, boxShadow: '0 2px 12px rgba(41,41,41,0.05)' }}
      >
        <div className="relative cursor-pointer group" onClick={() => fileRef.current?.click()}>
          <Avatar
            src={preview || user?.avatar_url}
            name={user?.name}
            size="2xl"
            gold
          />
          <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {uploading
              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Camera size={22} className="text-white" />
            }
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
        <div className="text-center">
          <p className="font-display font-semibold text-lg" style={{ color: BROWN, fontFamily: 'Bride, Georgia, serif' }}>
            {user?.name}
          </p>
          {user?.instagram && (
            <p className="text-sm font-body mt-0.5" style={{ color: GOLD }}>
              @{user.instagram}
            </p>
          )}
          <p className="text-xs font-body mt-1" style={{ color: `${MID}70` }}>
            Clique na foto para alterar
          </p>
        </div>
      </div>

      {/* ── Formulário ───────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-6"
        style={{ background: '#ffffff', border: `1px solid ${BEIGE}`, boxShadow: '0 2px 12px rgba(41,41,41,0.05)' }}
      >
        {/* Título */}
        <div className="flex items-center gap-3 mb-6">
          <User size={16} style={{ color: GOLD }} />
          <h2
            className="font-display font-semibold"
            style={{ fontFamily: 'Bride, Georgia, serif', fontSize: '17px', color: BROWN }}
          >
            Dados do Perfil
          </h2>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${GOLD}40, transparent)` }} />
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Email — só leitura */}
          <div>
            <label className="block text-xs font-body font-semibold tracking-[0.1em] uppercase mb-2" style={{ color: MID }}>
              E-mail
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: GOLD }} />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-10 pr-4 py-3 text-sm font-body rounded-xl"
                style={{
                  background: 'rgba(216,209,193,0.2)',
                  border: `1px solid ${BEIGE}`,
                  color: `#292929`,
                  cursor: 'not-allowed',
                }}
              />
            </div>
          </div>

          <Input
            label="Nome"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            icon={User}
            required
          />

          <Input
            label="@ do Instagram (sem @)"
            name="instagram"
            type="text"
            value={form.instagram}
            onChange={handleChange}
            icon={Instagram}
          />

          {/* Feedback */}
          {success && (
            <div className="px-4 py-3 rounded-xl text-sm font-body"
              style={{ background: 'rgba(58,128,64,0.07)', border: '1px solid rgba(58,128,64,0.2)', color: '#3a8040' }}>
              {success}
            </div>
          )}
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm font-body"
              style={{ background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.2)', color: '#c0392b' }}>
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={saving}
            className="w-full gap-2 mt-2"
          >
            <Save size={15} />
            Salvar alterações
          </Button>
        </form>
      </div>

    </div>
  )
}
