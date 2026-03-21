import { useCallback } from 'react'
import { useApi } from '../../hooks/useApi'
import { adminApi } from '../../lib/api'
import { formatMonth, formatNumber } from '../../lib/utils'
import DataTable from '../../components/admin/DataTable'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function MentoradasPage() {
  const fn = useCallback(() => adminApi.getMentoradas(), [])
  const { data, loading } = useApi(fn)

  const mentoradas = data?.mentoradas || data || []

  const columns = [
    {
      key: 'name',
      label: 'Mentorada',
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <Avatar src={row.avatar_url} name={val} size="sm" />
          <div>
            <p className="font-medium text-dark">{val}</p>
            <p className="text-xs text-dark/50">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'instagram',
      label: 'Instagram',
      render: (val) => val ? `@${val}` : '—',
    },
    {
      key: 'checklist_pct',
      label: 'Checklist',
      render: (val) => (
        <span className={`font-medium ${val >= 60 ? 'text-gold' : val >= 25 ? 'text-amber-600' : 'text-dark/50'}`}>
          {val != null ? `${val}%` : '—'}
        </span>
      ),
    },
    {
      key: 'followers_current',
      label: 'Seguidores',
      render: (val) => val != null ? formatNumber(val) : '—',
    },
    {
      key: 'followers_gained',
      label: 'Ganhos',
      render: (val) => val != null ? (
        <span className={val >= 0 ? 'text-sage' : 'text-red-500'}>
          {val >= 0 ? '+' : ''}{formatNumber(val)}
        </span>
      ) : '—',
    },
    {
      key: 'revenue_current',
      label: 'Faturamento',
      render: (val) => val != null
        ? `R$ ${formatNumber(val)}`
        : '—',
    },
    {
      key: 'revenue_growth_pct',
      label: 'Cresc. Fat.',
      render: (val) => val != null ? (
        <span className={val >= 0 ? 'text-sage' : 'text-red-500'}>
          {val >= 0 ? '+' : ''}{val.toFixed(1)}%
        </span>
      ) : '—',
    },
    {
      key: 'score',
      label: 'Score',
      render: (val) => (
        <span className="font-semibold text-gold">
          {val != null ? val.toFixed(1) : '—'}
        </span>
      ),
    },
    {
      key: 'role',
      label: 'Papel',
      render: (val) => (
        <Badge variant={val === 'admin' ? 'gold' : 'default'}>
          {val || 'mentorada'}
        </Badge>
      ),
    },
  ]

  if (loading) return <LoadingSpinner centered />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-dark">Mentoradas</h1>
          <p className="text-sm font-body text-dark/50 mt-0.5">
            {mentoradas.length} mentoradas cadastradas
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={mentoradas}
        emptyMessage="Nenhuma mentorada cadastrada ainda."
      />
    </div>
  )
}
