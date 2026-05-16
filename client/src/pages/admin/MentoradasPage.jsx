import { useCallback, useEffect, useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { adminApi } from '../../lib/api'
import { formatNumber } from '../../lib/utils'
import DataTable from '../../components/admin/DataTable'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Button from '../../components/ui/Button'
import { Eye, EyeOff, X, KeyRound } from 'lucide-react'

export default function MentoradasPage() {
  const [deleting, setDeleting] = useState(null)   // row sendo deletada
  const [confirm, setConfirm]   = useState(null)   // row aguardando confirmação

  // Password reset
  const [passwordResetRequests, setPasswordResetRequests] = useState([])
  const [resetModal, setResetModal]     = useState(null)   // row para redefinir senha
  const [newPassword, setNewPassword]   = useState('')
  const [confirmPwd,  setConfirmPwd]    = useState('')
  const [showNewPwd,  setShowNewPwd]    = useState(false)
  const [showCfmPwd,  setShowCfmPwd]    = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError,   setResetError]   = useState('')
  const [resetSuccess, setResetSuccess] = useState('')

  const fn = useCallback(() => adminApi.getMentoradas(), [])
  const { data, loading, refetch } = useApi(fn)

  useEffect(() => {
    adminApi.getPasswordResetRequests()
      .then(res => setPasswordResetRequests(res.data || []))
      .catch(() => {})
  }, [])

  function hasPendingReset(userId) {
    return passwordResetRequests.some(r => r.user_id === userId)
  }

  function openResetModal(row) {
    setResetModal(row)
    setNewPassword('')
    setConfirmPwd('')
    setResetError('')
    setResetSuccess('')
  }

  function closeResetModal() {
    setResetModal(null)
    setNewPassword('')
    setConfirmPwd('')
    setResetError('')
    setResetSuccess('')
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    if (newPassword !== confirmPwd) {
      setResetError('As senhas não coincidem.')
      return
    }
    setResetLoading(true)
    setResetError('')
    try {
      const res = await adminApi.resetUserPassword(resetModal.id, newPassword)
      setResetSuccess(res.data?.message || 'Senha redefinida com sucesso.')
      // Atualiza lista de solicitações pendentes
      setPasswordResetRequests(prev => prev.filter(r => r.user_id !== resetModal.id))
    } catch (err) {
      setResetError(err?.response?.data?.error || err?.response?.data?.message || 'Erro ao redefinir senha.')
    } finally {
      setResetLoading(false)
    }
  }

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
            <p className="font-medium text-dark flex items-center gap-1.5">
              {val}
              {hasPendingReset(row.id) && (
                <span
                  title="Solicitação de redefinição de senha pendente"
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold"
                  style={{ background: '#c0392b', color: '#fff' }}
                >
                  !
                </span>
              )}
            </p>
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
            {passwordResetRequests.length > 0 && (
              <span className="ml-2 font-semibold" style={{ color: '#c0392b' }}>
                · {passwordResetRequests.length} solicitação{passwordResetRequests.length > 1 ? 'ões' : ''} de senha pendente{passwordResetRequests.length > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={mentoradas}
        onDelete={handleDelete}
        actions={(row) => (
          <button
            type="button"
            title="Definir nova senha"
            onClick={() => openResetModal(row)}
            className="p-1.5 rounded-lg transition-colors"
            style={hasPendingReset(row.id)
              ? { color: '#c0392b', background: 'rgba(192,57,43,0.07)' }
              : { color: 'rgba(41,41,41,0.4)' }}
          >
            <KeyRound size={14} />
          </button>
        )}
        emptyMessage="Nenhuma mentorada cadastrada ainda."
      />

      {/* Modal de redefinição de senha */}
      {resetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) closeResetModal() }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-dark">
                Definir nova senha
              </h3>
              <button type="button" onClick={closeResetModal} className="p-1 text-dark/40 hover:text-dark/70">
                <X size={18} />
              </button>
            </div>
            <p className="font-body text-sm text-dark/60 mb-4">
              Redefinindo senha de <strong>{resetModal.name}</strong>.
            </p>

            {!resetSuccess ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* Nova senha */}
                <div>
                  <label className="block text-xs font-body font-semibold tracking-[0.1em] uppercase mb-2" style={{ color: '#604E44' }}>
                    Nova senha
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setResetError('') }}
                      required
                      minLength={6}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-4 pr-11 py-3 text-sm font-body rounded-xl outline-none transition-all duration-200"
                      style={{ background: '#F6F2E7', border: '1px solid rgba(199,170,137,0.4)', color: '#292929' }}
                      onFocus={e => { e.target.style.border = '1px solid #C7AA89'; e.target.style.boxShadow = '0 0 0 3px rgba(199,170,137,0.25)' }}
                      onBlur={e => { e.target.style.border = '1px solid rgba(199,170,137,0.4)'; e.target.style.boxShadow = 'none' }}
                    />
                    <button type="button" onClick={() => setShowNewPwd(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(199,170,137,0.6)' }} aria-label={showNewPwd ? 'Ocultar' : 'Mostrar'}>
                      {showNewPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirmar senha */}
                <div>
                  <label className="block text-xs font-body font-semibold tracking-[0.1em] uppercase mb-2" style={{ color: '#604E44' }}>
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <input
                      type={showCfmPwd ? 'text' : 'password'}
                      value={confirmPwd}
                      onChange={e => { setConfirmPwd(e.target.value); setResetError('') }}
                      required
                      placeholder="Repita a senha"
                      className="w-full pl-4 pr-11 py-3 text-sm font-body rounded-xl outline-none transition-all duration-200"
                      style={{ background: '#F6F2E7', border: '1px solid rgba(199,170,137,0.4)', color: '#292929' }}
                      onFocus={e => { e.target.style.border = '1px solid #C7AA89'; e.target.style.boxShadow = '0 0 0 3px rgba(199,170,137,0.25)' }}
                      onBlur={e => { e.target.style.border = '1px solid rgba(199,170,137,0.4)'; e.target.style.boxShadow = 'none' }}
                    />
                    <button type="button" onClick={() => setShowCfmPwd(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(199,170,137,0.6)' }} aria-label={showCfmPwd ? 'Ocultar' : 'Mostrar'}>
                      {showCfmPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {resetError && (
                  <div className="px-4 py-3 rounded-xl text-sm font-body" style={{ background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.2)', color: '#c0392b' }}>
                    {resetError}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={closeResetModal} type="button">
                    Cancelar
                  </Button>
                  <Button variant="primary" size="sm" className="flex-1" loading={resetLoading} type="submit">
                    Redefinir
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="px-4 py-3 rounded-xl text-sm font-body" style={{ background: 'rgba(142,112,40,0.08)', border: '1px solid rgba(142,112,40,0.25)', color: '#8e7028' }}>
                  {resetSuccess}
                </div>
                <Button variant="ghost" size="sm" className="w-full" onClick={closeResetModal}>
                  Fechar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

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
