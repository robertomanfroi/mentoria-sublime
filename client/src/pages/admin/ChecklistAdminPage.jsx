import { useState, useCallback } from 'react'
import { Plus, ChevronDown } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { checklistApi } from '../../lib/api'
import DataTable from '../../components/admin/DataTable'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Badge from '../../components/ui/Badge'

export default function ChecklistAdminPage() {
  const [modal, setModal] = useState(null) // null | { mode: 'create'|'edit', item?: any }
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ description: '', stage: '', sort_order: '' })

  const fn = useCallback(() => checklistApi.getItems(), [])
  const { data, loading, refetch } = useApi(fn)

  const items = data?.items || data || []

  function openCreate() {
    setForm({ description: '', stage: '', sort_order: '' })
    setModal({ mode: 'create' })
  }

  function openEdit(item) {
    setForm({
      description: item.description || '',
      stage: item.stage || '',
      sort_order: String(item.sort_order ?? ''),
    })
    setModal({ mode: 'edit', item })
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (modal.mode === 'create') {
        await checklistApi.createItem(form)
      } else {
        await checklistApi.updateItem(modal.item.id, form)
      }
      setModal(null)
      refetch()
    } catch (err) {
      alert(err?.response?.data?.message || 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Remover item "${item.description}"?`)) return
    try {
      await checklistApi.deleteItem(item.id)
      refetch()
    } catch (err) {
      alert(err?.response?.data?.message || 'Erro ao remover.')
    }
  }

  const columns = [
    {
      key: 'stage',
      label: 'Etapa',
      render: (val) => (
        <Badge variant="gold">{val || '—'}</Badge>
      ),
    },
    { key: 'description', label: 'Descrição' },
    {
      key: 'sort_order',
      label: 'Ordem',
      render: (val) => val ?? '—',
    },
  ]

  if (loading) return <LoadingSpinner centered />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-dark">
            Gerenciar Checklist
          </h1>
          <p className="text-sm font-body text-dark/50 mt-0.5">
            {items.length} itens cadastrados
          </p>
        </div>
        <Button variant="primary" size="md" onClick={openCreate} className="gap-2">
          <Plus size={16} />
          Novo Item
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        onEdit={openEdit}
        onDelete={handleDelete}
        emptyMessage="Nenhum item no checklist ainda."
      />

      {/* Modal criar/editar */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'create' ? 'Novo Item' : 'Editar Item'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Descrição do item"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            required
          />
          <Input
            label="Etapa (ex: Fundamentos, Conteúdo)"
            value={form.stage}
            onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value }))}
            required
          />
          <Input
            label="Ordem (número)"
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm((p) => ({ ...p, sort_order: e.target.value }))}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" size="md" onClick={() => setModal(null)} className="flex-1">
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={saving}
              onClick={handleSave}
              className="flex-1"
            >
              Salvar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
