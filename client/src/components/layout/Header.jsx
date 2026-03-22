import { LogOut, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../ui/Avatar'

export default function Header({ title }) {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="h-16 bg-nude-light border-b border-nude-medium/60 flex items-center justify-between px-6 flex-shrink-0">
      {/* Título da página */}
      <h2 className="font-display text-xl font-semibold text-dark">
        {title}
      </h2>

      {/* Avatar + menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-nude-medium transition-colors"
        >
          <Avatar
            src={user?.avatar_url}
            name={user?.name}
            size="sm"
            gold
          />
          <div className="hidden sm:block text-left">
            <p className="text-sm font-body font-medium text-dark leading-tight">
              {user?.name}
            </p>
            {user?.instagram && (
              <p className="text-xs font-body text-dark/50">
                @{user.instagram}
              </p>
            )}
          </div>
          <ChevronDown
            size={16}
            className={`text-dark/40 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-card border border-nude-medium/40 overflow-hidden z-20">
            <div className="px-4 py-3 border-b border-nude-medium/30">
              <p className="text-sm font-body font-medium text-dark">{user?.name}</p>
              <p className="text-xs font-body text-dark/50">{user?.email}</p>
            </div>
            <button
              onClick={() => { setMenuOpen(false); logout() }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-body text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              Sair da conta
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
