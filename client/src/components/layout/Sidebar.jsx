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
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../ui/Avatar'

const navLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/checklist', icon: CheckSquare, label: 'Checklist' },
  { to: '/monthly', icon: Calendar, label: 'Dados do Mês' },
  { to: '/ranking', icon: Trophy, label: 'Ranking' },
  { to: '/prizes', icon: Gift, label: 'Premiações' },
]

const adminLinks = [
  { to: '/admin/mentoradas', icon: Users, label: 'Mentoradas' },
  { to: '/admin/validations', icon: ShieldCheck, label: 'Validações' },
  { to: '/admin/checklist', icon: ListChecks, label: 'Checklist Admin' },
  { to: '/admin/prizes', icon: Award, label: 'Prêmios Admin' },
  { to: '/admin/export', icon: Download, label: 'Exportar' },
]

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm transition-all duration-200',
          isActive
            ? 'bg-gold-dark/10 text-gold-dark font-semibold'
            : 'text-dark/60 hover:bg-nude-medium hover:text-dark'
        )
      }
    >
      <Icon size={18} strokeWidth={isActive => (isActive ? 2.5 : 1.5)} />
      {label}
    </NavLink>
  )
}

export default function Sidebar() {
  const { user, isAdmin } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-nude-medium/40 flex items-center justify-center">
        <img
          src="/brand/logos/logo-horizontal.svg"
          alt="Mentoria Sublime"
          className="h-14 w-auto object-contain"
        />
      </div>

      {/* Nav principal */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navLinks.map((link) => (
          <NavItem
            key={link.to}
            {...link}
            onClick={() => setMobileOpen(false)}
          />
        ))}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-3 text-[11px] font-body font-semibold text-dark/30 uppercase tracking-wider">
                Administração
              </p>
            </div>
            {adminLinks.map((link) => (
              <NavItem
                key={link.to}
                {...link}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </>
        )}
      </nav>

      {/* Avatar usuária no bottom */}
      <div className="px-4 py-4 border-t border-nude-medium/40">
        <div className="flex items-center gap-3">
          <Avatar
            src={user?.avatar_url}
            name={user?.name}
            size="sm"
            gold
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-body font-medium text-dark truncate">
              {user?.name}
            </p>
            {user?.instagram && (
              <p className="text-xs font-body text-dark/50 truncate">
                @{user.instagram}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-nude-light border-r border-nude-medium/60 h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white shadow-soft border border-nude-medium/40"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} className="text-dark" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-dark/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-nude-light shadow-card',
          'transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          className="absolute top-4 right-4 p-1.5 rounded-lg text-dark/40 hover:text-dark"
          onClick={() => setMobileOpen(false)}
        >
          <X size={18} />
        </button>
        {sidebarContent}
      </aside>
    </>
  )
}
