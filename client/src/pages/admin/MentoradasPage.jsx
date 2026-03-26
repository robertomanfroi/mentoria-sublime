import { useCallback, useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { adminApi } from '../../lib/api'
import { formatNumber } from '../../lib/utils'
import DataTable from '../../components/admin/DataTable'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Button from '../../components/ui/Button'

export default function MentoradasPage() {
  const [deleting, setDeleting] = useState(null)   // row sendo deletada
  const [confirm, setConfirm]   = useState(null)   // row aguardando confirmação

  const fn = useCallback(() => adminApi.getMentoradas(), [])
  const { data, loading, refetch } = useApi(fn)

  const mentoradas = data?.data || data?.mentoradas || data || []
  const totalMentoradas = data?.total ?? mentoradas.length

  async function handleDelete(row) {
    setConfirm(row)
  }

  async function confirmDelete() {
    if (!confirm) return
    setDeleting(confirm.id)
    try {
      await adminApi.deleteUser(confirm.id)
      refetch()
    } catch (err) {
      alert('Erro ao excluir: ' + (err?.response?.data?.error || err?.message))
    } finally {
      setDeleting(null)
      setConfirm(null)
    }
  }

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
      key: 'instagram_handle',
      label: 'Instagram',
      render: (val) => val ? `@${val}` : '—',
    },
    {
      key: 'checklist_pct',
      label: 'Checklist',
      render: (val) => (
        <span className="font-medium" style={{ color: val >= 60 ? '#8e7028' : val >= 25 ? '#C7AA89' : 'rgba(41,41,41,0.45)' }}>
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
            {totalMentoradas} mentoradas cadastradas
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={mentoradas}
        onDelete={handleDelete}
        emptyMessage="Nenhuma mentorada cadastrada ainda."
      />

      {/* Modal de confirmação de exclusão */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-display text-lg font-semibold text-dark mb-2">
              Excluir mentorada?
            </h3>
            <p className="font-body text-sm text-dark/60 mb-6">
              Tem certeza que deseja excluir <strong>{confirm.name}</strong>?
              Todos os dados dela (checklist, submissões, ranking) serão removidos permanentemente.
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => setConfirm(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                loading={deleting === confirm.id}
                onClick={confirmDelete}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
