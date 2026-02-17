import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useLang } from '../../contexts/LangContext'
import { useState } from 'react'
import logo from '../../assets/icons/logo.png'

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const { lang, toggleLang, t } = useLang()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/research', label: t('nav.research') },
    { to: '/data', label: t('nav.data') },
    // { to: '/participate', label: t('nav.participate') },  // Hidden until IRB approval
    { to: '/support', label: t('nav.support') },
  ]

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="K-ARC" className="h-10" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="ml-4 flex items-center gap-2">
              {/* Language toggle */}
              <button
                onClick={toggleLang}
                className="px-2 py-1 rounded text-xs font-semibold border border-gray-300 text-slate-600 hover:bg-gray-50 transition-colors"
              >
                {lang === 'en' ? '한국어' : 'EN'}
              </button>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 px-3 py-2"
                  >
                    {t('nav.dashboard')}
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-slate-500 hover:text-slate-700 px-3 py-2"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 px-3 py-2"
                >
                  {t('nav.login')}
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === link.to
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-slate-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={toggleLang}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-500"
            >
              {lang === 'en' ? '한국어로 보기' : 'Switch to English'}
            </button>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-primary-600"
                >
                  {t('nav.dashboard')}
                </Link>
                <button
                  onClick={() => { logout(); setMobileOpen(false) }}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-500"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-primary-600"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
