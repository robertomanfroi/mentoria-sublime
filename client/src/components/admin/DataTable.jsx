import { useState } from 'react'
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import Button from '../ui/Button'

const PAGE_SIZE = 10

export default function DataTable({
  columns,
  data = [],
  onEdit,
  onDelete,
  actions,
  emptyMessage = 'Nenhum dado encontrado.',
  className,
}) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE))
  const paginated = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className={cn('w-full', className)}>
      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-nude-medium/40 bg-white shadow-soft">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-nude-medium/30 bg-nude-light/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-dark/50 uppercase tracking-wider whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete || actions) && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-dark/50 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-nude-medium/20">
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-8 text-center text-dark/40"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className="hover:bg-nude-light/30 transition-colors duration-150"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-dark whitespace-nowrap">
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                  {(onEdit || onDelete || actions) && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {actions?.(row)}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="p-1.5 rounded-lg text-dark/40 hover:text-gold hover:bg-gold/10 transition-colors"
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="p-1.5 rounded-lg text-dark/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs font-body text-dark/50">
            {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, data.length)} de {data.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-nude-medium/40 text-dark/50 hover:text-dark hover:bg-nude-light disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-body text-dark">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-nude-medium/40 text-dark/50 hover:text-dark hover:bg-nude-light disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
