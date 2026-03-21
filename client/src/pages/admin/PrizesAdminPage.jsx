import { useState, useCallback } from 'react'
import { Trophy, Medal, Award, Save } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { prizesApi } from '../../lib/api'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const positionConfig = [
  { position: 1, icon: Trophy, label: '1º Lugar', color: 'text-gold' },
  { position: 2, icon: Medal, label: '2º Lugar', color: 'text-slate-400' },
  { position: 3, icon: Award, label: '3º Lugar', color: 'text-amber-700' },
]

function PrizeForm({ prize, config, onSaved }) {
  const [form, setForm] = useState({
    title: prize?.title || '',
    description: prize?.description || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const Icon = config.icon

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      await prizesApi.updatePrize(prize?.id || config.position, form)
      setSaved(true)
      onSaved?.()
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      alert(err?.response?.data?.message || 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card variant={config.position === 1 ? 'gold' : 'default'} className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl bg-nude-light flex items-center justify-center`}>
          <Icon size={18} className={config.color} />
        </div>
        <h3 className="font-display text-lg font-semibold text-dark">
          {config.label}
        </h3>
      </div>

      <Input
        label="Título do prêmio"
        value={form.title}
        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
      />

      <div className="relative">
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder="Descrição do prêmio..."
          rows={3}
          className="w-full rounded-xl border border-nude-medium bg-white px-4 py-3 text-sm font-body text-dark placeholder-dark/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 resize-none transition-all duration-200"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="md"
          loading={saving}
          onClick={handleSave}
          className="gap-2"
        >
          <Save size={15} />
          Salvar
        </Button>
        {saved && (
          <span className="text-sm font-body text-sage">✓ Salvo!</span>
        )}
      </div>
    </Card>
  )
}

export default function PrizesAdminPage() {
  const fn = useCallback(() => prizesApi.getPrizes(), [])
  const { data, loading, refetch } = useApi(fn)

  const prizes = data?.prizes || []

  if (loading) return <LoadingSpinner centered />

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-dark">
          Gerenciar Prêmios
        </h1>
        <p className="text-sm font-body text-dark/50 mt-0.5">
          Edite os prêmios para cada posição no ranking.
        </p>
      </div>

      <div className="space-y-4">
        {positionConfig.map((config) => {
          const prize = prizes.find((p) => p.position === config.position)
          return (
            <PrizeForm
              key={config.position}
              prize={prize}
              config={config}
              onSaved={refetch}
            />
          )
        })}
      </div>
    </div>
  )
}
