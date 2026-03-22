import { useState, useCallback, useMemo } from 'react'
import { ChevronsDown, ChevronsUp } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { checklistApi } from '../lib/api'
import ProgressBar from '../components/ui/ProgressBar'
import StageAccordion from '../components/checklist/StageAccordion'
import LoadingSpinner from '../components/ui/LoadingSpinner'

/* ─── Paleta oficial ──────────────────────────────────────────────────── */
const GOLD      = '#C7AA89'
const GOLD_DARK = '#8e7028'
const BROWN     = '#3D281C'
const MID       = '#604E44'
const CREAM     = '#F6F2E7'
const BEIGE     = '#D8D1C1'
const DARK      = '#292929'

export default function ChecklistPage() {
  const fn = useCallback(() => checklistApi.getItems(), [])
  const { data, loading, error, setData } = useApi(fn)
  const [forceOpen, setForceOpen] = useState(undefined)

  const stages = useMemo(() => {
    if (!data) return []
    const stagesMap   = {}
    const stagesOrder = []
    ;(data.items || data || []).forEach(item => {
      const stageName = item.stage || 'Sem Etapa'
      if (!stagesMap[stageName]) {
        stagesOrder.push(stageName)
        stagesMap[stageName] = {
          stage: { id: stageName, name: stageName, order: stagesOrder.length },
          items: [],
        }
      }
      stagesMap[stageName].items.push(item)
    })
    return stagesOrder.map(name => stagesMap[name])
  }, [data])

  const totalItems     = stages.reduce((acc, s) => acc + s.items.length, 0)
  const completedItems = stages.reduce((acc, s) => acc + s.items.filter(i => i.completed).length, 0)
  const pct            = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  function handleItemToggle(itemId, newState) {
    setData(prev => {
      if (!prev) return prev
      const items   = prev.items || prev
      const updated = items.map(item => item.id === itemId ? { ...item, completed: newState } : item)
      return prev.items ? { ...prev, items: updated } : updated
    })
  }

  if (loading) return <LoadingSpinner centered />

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <p className="font-body text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div
      className="max-w-2xl mx-auto space-y-5"
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >
      {/* ── Header com progresso geral ────────────────────────────── */}
      <div
        className="rounded-2xl p-6 animate-fade-in-up"
        style={{
          background: 'linear-gradient(160deg, rgba(199,170,137,0.08) 0%, #ffffff 70%)',
          border: `1px solid rgba(199,170,137,0.20)`,
          boxShadow: '0 2px 12px rgba(199,170,137,0.10)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className="font-display font-semibold leading-tight"
              style={{ fontFamily: 'Bride, Georgia, serif', fontSize: '20px', color: BROWN }}
            >
              Meu Checklist
            </h2>
            <p className="font-body mt-0.5" style={{ fontSize: '12px', color: `${MID}80` }}>
              {completedItems} de {totalItems} itens concluídos
            </p>
          </div>
          <span
            className="font-display font-bold"
            style={{ fontFamily: 'Bride, Georgia, serif', fontSize: '28px', color: GOLD_DARK }}
          >
            {pct}%
          </span>
        </div>

        <ProgressBar value={pct} showPercent={false} size="lg" />

        {/* Status das estrelas */}
        <div className="mt-4 flex gap-5 text-xs font-body">
          <div
            className="flex items-center gap-1.5"
            style={{ color: pct >= 25 ? GOLD_DARK : `${DARK}35` }}
          >
            <span>⭐</span>
            <span style={{ fontWeight: pct >= 25 ? '600' : '400' }}>
              25% — Estrela bege
            </span>
          </div>
          <div
            className="flex items-center gap-1.5"
            style={{ color: pct >= 60 ? GOLD_DARK : `${DARK}35` }}
          >
            <span>🌟</span>
            <span style={{ fontWeight: pct >= 60 ? '600' : '400' }}>
              60% — Estrela dourada
            </span>
          </div>
        </div>
      </div>

      {/* ── Controles ─────────────────────────────────────────────── */}
      <div className="flex gap-2 animate-fade-in-up-delay-1">
        <button
          onClick={() => setForceOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-sm transition-all duration-200"
          style={{
            background: 'transparent',
            border: `1px solid ${GOLD}`,
            color: MID,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(199,170,137,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <ChevronsDown size={14} />
          Expandir todos
        </button>
        <button
          onClick={() => setForceOpen(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-sm transition-all duration-200"
          style={{
            background: 'transparent',
            border: `1px solid ${GOLD}`,
            color: MID,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(199,170,137,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <ChevronsUp size={14} />
          Recolher todos
        </button>
      </div>

      {/* ── Acordeões ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        {stages.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-body" style={{ color: `${DARK}40` }}>
              Nenhum item no checklist ainda.
            </p>
          </div>
        ) : (
          stages.map(({ stage, items }, idx) => (
            <div
              key={stage.name}
              className="animate-fade-in-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <StageAccordion
                stage={stage}
                items={items}
                forceOpen={forceOpen}
                onToggle={handleItemToggle}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
