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
import ValidationsPage from '../pages/admin/ValidationsPage'
import ChecklistAdminPage from '../pages/admin/ChecklistAdminPage'
import PrizesAdminPage from '../pages/admin/PrizesAdminPage'
import ExportPage from '../pages/admin/ExportPage'

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
])

export default router
