import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Trophy,
  Gift,
  Users,
  ShieldCheck,
  ListChecks,
  Award,
  Download,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../ui/Avatar'

const navLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/checklist',  icon: CheckSquare,    label: 'Checklist'   },
  { to: '/monthly',    icon: Calendar,        label: 'Dados do Mês'},
  { to: '/ranking',    icon: Trophy,          label: 'Ranking'     },
  { to: '/prizes',     icon: Gift,            label: 'Premiações'  },
]

const adminLinks = [
  { to: '/admin/mentoradas',  icon: Users,      label: 'Mentoradas'     },
  { to: '/admin/validations', icon: ShieldCheck, label: 'Validações'     },
  { to: '/admin/checklist',   icon: ListChecks,  label: 'Checklist Admin'},
  { to: '/admin/prizes',      icon: Award,       label: 'Prêmios Admin'  },
  { to: '/admin/export',      icon: Download,    label: 'Exportar'       },
]

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200',
          isActive
            ? 'bg-[rgba(199,170,137,0.12)] text-[#F6F2E7]'
            : 'text-[rgba(246,242,231,0.5)] hover:text-[rgba(246,242,231,0.85)] hover:bg-[rgba(246,242,231,0.05)]'
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Borda esquerda dourada quando ativo */}
          {isActive && (
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
              style={{ background: 'linear-gradient(180deg, #8e7028, #f2ea9c, #8e7028)' }}
            />
          )}
          <Icon
            size={16}
            strokeWidth={isActive ? 2 : 1.5}
            className={isActive ? 'text-[#C7AA89]' : ''}
          />
          <span className={cn('font-body tracking-wide', isActive && 'font-medium')}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarContent = (
    <div className="flex flex-col h-full" style={{ background: '#3D281C' }}>

      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="px-5 pt-7 pb-6 flex flex-col items-center gap-3">
        <img
          src="/brand/logos/logo-principal.svg"
          alt="Mentoria Sublime"
          className="w-16 h-16 rounded-xl object-cover"
          style={{ boxShadow: '0 4px 20px rgba(142,112,40,0.35)' }}
        />
        <div className="text-center">
          <p className="font-display text-[#F6F2E7] text-sm tracking-[0.12em] uppercase leading-none">
            Mentoria
          </p>
          <p
            className="font-display text-xs tracking-[0.18em] uppercase mt-0.5"
            style={{
              background: 'linear-gradient(90deg, #8e7028, #f2ea9c, #8e7028)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Sublime
          </p>
        </div>
        {/* Linha ornamental */}
        <div
          className="w-10 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #C7AA89, transparent)' }}
        />
      </div>

      {/* ── Navegação principal ───────────────────────────── */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navLinks.map((link) => (
          <NavItem key={link.to} {...link} onClick={() => setMobileOpen(false)} />
        ))}

        {/* Admin */}
        {isAdmin && (
          <>
            <div className="pt-5 pb-2 px-4">
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 h-px"
                  style={{ background: 'rgba(199,170,137,0.2)' }}
                />
                <p className="text-[10px] font-body font-semibold tracking-[0.14em] uppercase"
                  style={{ color: 'rgba(199,170,137,0.45)' }}>
                  Admin
                </p>
                <div
                  className="flex-1 h-px"
                  style={{ background: 'rgba(199,170,137,0.2)' }}
                />
              </div>
            </div>
            {adminLinks.map((link) => (
              <NavItem key={link.to} {...link} onClick={() => setMobileOpen(false)} />
            ))}
          </>
        )}
      </nav>

      {/* ── Usuária ───────────────────────────────────────── */}
      <div
        className="px-4 py-4 mx-3 mb-3 rounded-xl"
        style={{ background: 'rgba(246,242,231,0.05)', border: '1px solid rgba(246,242,231,0.07)' }}
      >
        <div className="flex items-center gap-3">
          <Avatar src={user?.avatar_url} name={user?.name} size="sm" gold />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-body font-medium text-[#F6F2E7] truncate leading-none mb-0.5">
              {user?.name}
            </p>
            {user?.instagram && (
              <p className="text-[11px] font-body truncate" style={{ color: 'rgba(199,170,137,0.6)' }}>
                @{user.instagram}
              </p>
            )}
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(246,242,231,0.08)]"
            title="Sair"
          >
            <LogOut size={14} style={{ color: 'rgba(246,242,231,0.35)' }} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-60 flex-col h-screen sticky top-0 flex-shrink-0"
        style={{ background: '#3D281C', borderRight: '1px solid rgba(246,242,231,0.07)' }}>
        {sidebarContent}
      </aside>

      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl shadow-soft"
        style={{ background: '#3D281C', border: '1px solid rgba(246,242,231,0.12)' }}
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} style={{ color: '#F6F2E7' }} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 backdrop-blur-sm"
          style={{ background: 'rgba(61,40,28,0.6)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 left-0 z-50 h-full w-60 shadow-card transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ background: '#3D281C' }}
      >
        <button
          className="absolute top-4 right-4 p-1.5 rounded-lg"
          style={{ color: 'rgba(246,242,231,0.4)' }}
          onClick={() => setMobileOpen(false)}
        >
          <X size={18} />
        </button>
        {sidebarContent}
      </aside>
    </>
  )
}
