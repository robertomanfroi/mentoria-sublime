import { createBrowserRouter, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AdminRoute from './AdminRoute'
import AppLayout from '../components/layout/AppLayout'

// Auth pages
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'

// App pages
import DashboardPage from '../pages/DashboardPage'
import ChecklistPage from '../pages/ChecklistPage'
import MonthlyPage from '../pages/MonthlyPage'
import RankingPage from '../pages/RankingPage'
import PrizesPage from '../pages/PrizesPage'
import ProfilePage from '../pages/ProfilePage'

// Admin pages
import MentoradasPage from '../pages/admin/MentoradasPage'
import MonthlyHistoryPage from '../pages/admin/MonthlyHistoryPage'
import ValidationsPage from '../pages/admin/ValidationsPage'
import ChecklistAdminPage from '../pages/admin/ChecklistAdminPage'
import PrizesAdminPage from '../pages/admin/PrizesAdminPage'
import ExportPage from '../pages/admin/ExportPage'

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-6 text-center">
      <h1
        className="text-5xl font-semibold text-dark mb-3"
        style={{ fontFamily: 'Bride, Georgia, serif' }}
      >
        404
      </h1>
      <p className="text-sm text-dark/60 font-body mb-6">
        Ops! A página que você procura não existe ou foi movida.
      </p>
      <a
        href="/dashboard"
        className="px-5 py-2.5 rounded-full bg-dark text-white text-sm font-body hover:opacity-90 transition-opacity"
      >
        Voltar ao início
      </a>
    </div>
  )
}

const router = createBrowserRouter([
  // Redirect raiz
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  // Auth routes (sem layout)
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },

  // App routes (com layout protegido)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'checklist',
        element: <ChecklistPage />,
      },
      {
        path: 'monthly',
        element: <MonthlyPage />,
      },
      {
        path: 'ranking',
        element: <RankingPage />,
      },
      {
        path: 'prizes',
        element: <PrizesPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },

      // Admin routes
      {
        path: 'admin/mentoradas',
        element: (
          <AdminRoute>
            <MentoradasPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/validations',
        element: (
          <AdminRoute>
            <ValidationsPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/monthly-history',
        element: (
          <AdminRoute>
            <MonthlyHistoryPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/checklist',
        element: (
          <AdminRoute>
            <ChecklistAdminPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/prizes',
        element: (
          <AdminRoute>
            <PrizesAdminPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/export',
        element: (
          <AdminRoute>
            <ExportPage />
          </AdminRoute>
        ),
      },
    ],
  },

  // Catch-all 404
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export default router
