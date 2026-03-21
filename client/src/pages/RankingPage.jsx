import { useState, useCallback } from 'react'
import { ChevronDown, Info } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useApi } from '../hooks/useApi'
import { rankingApi } from '../lib/api'
import {
  getCurrentMonth,
  getLastNMonths,
  formatMonth,
} from '../lib/utils'
import PodiumCard from '../components/ranking/PodiumCard'
import RankingRow from '../components/ranking/RankingRow'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const months = getLastNMonths(6)

export default function RankingPage() {
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())

  const fn = useCallback(() => rankingApi.getRanking(selectedMonth), [selectedMonth])
  const { data, loading } = useApi(fn)

  const entries = Array.isArray(data) ? data : (data?.ranking || [])
  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Seletor de mês */}
      <div className="flex items-center gap-3 animate-fade-in-up">
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-nude-medium bg-white text-sm font-body text-dark focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {formatMonth(m)}
              </option>
            ))}
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/40 pointer-events-none" />
        </div>

        <h1 className="font-display text-xl font-semibold text-dark">
          Ranking
        </h1>
      </div>

      {/* Nota de privacidade */}
      <div className="flex items-start gap-2 p-3 bg-nude-light rounded-xl border border-nude-medium/40 animate-fade-in-up-delay-1">
        <Info size={15} className="text-dark/40 flex-shrink-0 mt-0.5" />
        <p className="text-xs font-body text-dark/50">
          Faturamento é privado — apenas a posição no ranking é exibida.
          As estrelas indicam desempenho em checklist, crescimento de seguidores e faturamento.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner centered />
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-nude-light flex items-center justify-center mb-4">
            <span className="text-3xl">🏆</span>
          </div>
          <h3 className="font-display text-xl font-semibold text-dark mb-2">
            Ranking não calculado
          </h3>
          <p className="font-body text-dark/50 max-w-xs">
            O ranking de {formatMonth(selectedMonth)} ainda não foi calculado.
            Aguarde o admin processar os dados.
          </p>
        </div>
      ) : (
        <>
          {/* Pódio */}
          {top3.length > 0 && (
            <div className="animate-fade-in-up-delay-2">
              <h2 className="font-display text-lg font-semibold text-dark mb-6 text-center">
                Pódio — {formatMonth(selectedMonth)}
              </h2>
              <div className="flex items-end justify-center gap-4 px-4">
                {/* 2º lugar (esquerda) */}
                {top3[1] && (
                  <PodiumCard entry={top3[1]} position={2} />
                )}
                {/* 1º lugar (centro, maior) */}
                {top3[0] && (
                  <PodiumCard entry={top3[0]} position={1} />
                )}
                {/* 3º lugar (direita) */}
                {top3[2] && (
                  <PodiumCard entry={top3[2]} position={3} />
                )}
              </div>
            </div>
          )}

          {/* Lista completa */}
          {rest.length > 0 && (
            <div className="bg-white rounded-2xl border border-nude-medium/40 shadow-soft overflow-hidden animate-fade-in-up-delay-3">
              <div className="px-4 py-3 border-b border-nude-medium/20">
                <div className="flex items-center justify-between text-xs font-body text-dark/40 uppercase tracking-wider">
                  <span>Mentorada</span>
                  <div className="flex items-center gap-8 pr-2">
                    <span className="hidden sm:block">Seguidores</span>
                    <span className="hidden md:block">Estrelas</span>
                    <span>Score</span>
                  </div>
                </div>
              </div>
              <div className="p-2 space-y-0.5">
                {rest.map((entry, idx) => (
                  <RankingRow
                    key={entry.user_id || idx}
                    entry={entry}
                    position={idx + 4}
                    isCurrentUser={entry.user_id === user?.id}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
