import { useState } from 'react'
import { CheckCircle, XCircle, ExternalLink, User } from 'lucide-react'
import { cn } from '../../lib/utils'
import { formatMonth, formatNumber } from '../../lib/utils'
import { adminApi } from '../../lib/api'
import Card from '../ui/Card'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

export default function ValidationCard({ submission, onValidated }) {
  const [loading, setLoading] = useState(null) // 'approve' | 'reject'
  const [done, setDone] = useState(false)

  async function handle(status) {
    setLoading(status)
    try {
      await adminApi.validateSubmission(submission.id, status === 'approved')
      setDone(true)
      onValidated?.(submission.id, status)
    } catch (err) {
      alert('Erro ao validar: ' + (err?.response?.data?.error || err?.response?.data?.message || err?.message))
    } finally {
      setLoading(null)
    }
  }

  if (done) {
    return (
      <Card className="opacity-50">
        <p className="text-sm font-body text-dark/50 text-center py-2">
          Validação concluída.
        </p>
      </Card>
    )
  }

  const gained = (submission.followers_count || submission.followers_current || 0) - (submission.followers_previous || 0)

  return (
    <Card variant="default" className="animate-fade-in-up">
      {/* Header: mentorada */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar
          src={submission.user?.avatar_url || submission.profile_photo}
          name={submission.user?.name || submission.name}
          size="md"
          gold
        />
        <div>
          <p className="font-body font-semibold text-dark">
            {submission.user?.name || submission.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {(submission.user?.instagram || submission.instagram_handle) && (
              <span className="text-xs font-body text-dark/50">
                @{submission.user?.instagram || submission.instagram_handle}
              </span>
            )}
            <Badge variant="warning">
              {formatMonth(submission.month)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Dados */}
      <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-nude-light rounded-xl">
        <div>
          <p className="text-xs font-body text-dark/50 mb-0.5">Seguidores anterior</p>
          <p className="text-sm font-body font-semibold text-dark">
            {formatNumber(submission.followers_previous || 0)}
          </p>
        </div>
        <div>
          <p className="text-xs font-body text-dark/50 mb-0.5">Seguidores atual</p>
          <p className="text-sm font-body font-semibold text-dark">
            {formatNumber(submission.followers_count || submission.followers_current || 0)}
          </p>
        </div>
        <div>
          <p className="text-xs font-body text-dark/50 mb-0.5">Crescimento</p>
          <p className={cn(
            'text-sm font-body font-semibold',
            gained >= 0 ? 'text-sage' : 'text-red-500'
          )}>
            {gained >= 0 ? '+' : ''}{formatNumber(gained)}
          </p>
        </div>
        <div>
          <p className="text-xs font-body text-dark/50 mb-0.5">Faturamento atual</p>
          <p className="text-sm font-body font-semibold text-dark">
            {(submission.revenue || submission.revenue_current)
              ? `R$ ${formatNumber(submission.revenue || submission.revenue_current)}`
              : '—'}
          </p>
        </div>
      </div>

      {/* Print/comprovante */}
      {(submission.instagram_proof_image || submission.print_url) && (
        <a
          href={submission.instagram_proof_image || submission.print_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-body text-gold hover:underline mb-4"
        >
          <ExternalLink size={13} />
          Ver comprovante (print)
        </a>
      )}

      {/* Ações */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          size="sm"
          loading={loading === 'approved'}
          disabled={!!loading}
          onClick={() => handle('approved')}
          className="flex-1 gap-1.5"
        >
          <CheckCircle size={15} />
          Aprovar
        </Button>
        <Button
          variant="danger"
          size="sm"
          loading={loading === 'rejected'}
          disabled={!!loading}
          onClick={() => handle('rejected')}
          className="flex-1 gap-1.5"
        >
          <XCircle size={15} />
          Rejeitar
        </Button>
      </div>
    </Card>
  )
}
