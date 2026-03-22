import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/checklist': 'Checklist',
  '/monthly': 'Dados do Mês',
  '/ranking': 'Ranking',
  '/prizes': 'Premiações',
  '/admin/mentoradas': 'Mentoradas',
  '/admin/validations': 'Validações Pendentes',
  '/admin/checklist': 'Gerenciar Checklist',
  '/admin/prizes': 'Gerenciar Prêmios',
  '/admin/export': 'Exportar Dados',
}

export default function AppLayout() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Mentoria Sublime'

  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <Sidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={title} />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
