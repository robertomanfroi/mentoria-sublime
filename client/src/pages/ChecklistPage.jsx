import { useState, useCallback, useMemo } from 'react'
import { ChevronsDown, ChevronsUp } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { checklistApi } from '../lib/api'
import ProgressBar from '../components/ui/ProgressBar'
import StageAccordion from '../components/checklist/StageAccordion'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'

export default function ChecklistPage() {
  const fn = useCallback(() => checklistApi.getItems(), [])
  const { data, loading, error, setData } = useApi(fn)

  const [forceOpen, setForceOpen] = useState(undefined)

  // Agrupar itens por etapa (stage é string vinda da API)
  const stages = useMemo(() => {
    if (!data) return []
    const stagesMap = {}
    const stagesOrder = []

    ;(data.items || data || []).forEach((item) => {
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

    return stagesOrder.map((name) => stagesMap[name])
  }, [data])

  // Calcular totais
  const totalItems = stages.reduce((acc, s) => acc + s.items.length, 0)
  const completedItems = stages.reduce(
    (acc, s) => acc + s.items.filter((i) => i.completed).length,
    0
  )
  const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  function handleItemToggle(itemId, newState) {
    setData((prev) => {
      if (!prev) return prev
      const items = prev.items || prev
      const updated = items.map((item) =>
        item.id === itemId ? { ...item, completed: newState } : item
      )
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
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header com progresso geral */}
      <div className="bg-white rounded-2xl p-5 border border-nude-medium/40 shadow-soft animate-fade-in-up">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-dark">
              Meu Checklist
            </h2>
            <p className="text-sm font-body text-dark/50 mt-0.5">
              {completedItems} de {totalItems} itens concluídos
            </p>
          </div>
          <span className="font-display text-2xl font-bold text-gold">
            {pct}%
          </span>
        </div>
        <ProgressBar value={pct} showPercent={false} size="lg" />

        {/* Status da estrela */}
        <div className="mt-3 flex gap-4 text-xs font-body">
          <span className={pct >= 25 ? 'text-gold font-medium' : 'text-dark/40'}>
            ⭐ 25% — Estrela bege
          </span>
          <span className={pct >= 60 ? 'text-gold font-medium' : 'text-dark/40'}>
            🌟 60% — Estrela dourada
          </span>
        </div>
      </div>

      {/* Controles */}
      <div className="flex gap-2 animate-fade-in-up-delay-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setForceOpen(true)}
          className="gap-1.5"
        >
          <ChevronsDown size={15} />
          Expandir todos
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setForceOpen(false)}
          className="gap-1.5"
        >
          <ChevronsUp size={15} />
          Recolher todos
        </Button>
      </div>

      {/* Acordeões por etapa */}
      <div className="space-y-3">
        {stages.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-body text-dark/40">
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
