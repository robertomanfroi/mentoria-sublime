import { LogOut, ChevronDown, Settings } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../ui/Avatar'

export default function Header({ title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

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
    <header
      className="h-16 flex items-center justify-between px-6 flex-shrink-0"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid rgba(45,45,45,0.08)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Título */}
      <div className="flex items-center gap-3">
        <h2 className="font-display text-xl font-semibold text-dark tracking-tight">
          {title}
        </h2>
      </div>

      {/* Avatar + menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200"
          style={{
            background: menuOpen ? 'rgba(45,45,45,0.05)' : 'transparent',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(45,45,45,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = menuOpen ? 'rgba(45,45,45,0.05)' : 'transparent'}
        >
          <Avatar src={user?.avatar_url} name={user?.name} size="sm" gold />
          <div className="hidden sm:block text-left">
            <p className="text-sm font-body font-medium text-dark leading-none mb-0.5">
              {user?.name}
            </p>
            {user?.instagram && (
              <p className="text-[11px] font-body" style={{ color: '#bda788' }}>
                @{user.instagram}
              </p>
            )}
          </div>
          <ChevronDown
            size={15}
            className={`transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
            style={{ color: 'rgba(45,45,45,0.35)' }}
          />
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-20"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(45,45,45,0.09)',
              boxShadow: '0 8px 32px rgba(45,45,45,0.12)',
            }}
          >
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(45,45,45,0.07)' }}>
              <p className="text-sm font-body font-semibold text-dark">{user?.name}</p>
              <p className="text-xs font-body mt-0.5" style={{ color: 'rgba(45,45,45,0.45)' }}>
                {user?.email}
              </p>
            </div>

            <div className="py-1">
              <button
                onClick={() => { setMenuOpen(false); navigate('/profile') }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-body text-dark transition-colors"
                style={{ borderRadius: 0 }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(45,45,45,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Settings size={14} style={{ color: '#bda788' }} />
                Meu perfil
              </button>

              <button
                onClick={() => { setMenuOpen(false); logout() }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-body transition-colors"
                style={{ color: '#c0392b' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(192,57,43,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={14} />
                Sair da conta
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
